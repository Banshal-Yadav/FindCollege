const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();
app.use(express.static('public'));
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Add session middleware
app.use(session({
  secret: 'college-search-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 }
}));

require('dotenv').config();
// Create a connection pool to MySQL database using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Test the database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connection to MYSQL:', err);
  } else {
    console.log('Connected to MySQL!');
    connection.release();
  }
});

// Create college admin (super admin only)
app.post('/admin/create', (req, res) => {
  // Check if user is logged in as admin
  if (!req.session.adminId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  // Check if super admin
  if (req.session.collegeId !== null) {
    return res.status(403).json({ error: 'Only super admins can create new admins' });
  }

  const { username, password, email, college_id } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Username, password and email are required' });
  }

  // Hash password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ error: 'Password encryption error' });
    }

    // Insert new admin
    const sql = 'INSERT INTO college_admins (username, password, email, college_id) VALUES (?, ?, ?, ?)';
    pool.query(sql, [username, hashedPassword, email, college_id || null], (err, result) => {
      if (err) {
        console.error('Error creating admin:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({ success: true, id: result.insertId });
    });
  });
});


// Create a super admin if one doesn't exist
const checkSuperAdminSql = "SELECT COUNT(*) as count FROM college_admins WHERE username = 'superadmin'";
pool.query(checkSuperAdminSql, (err, results) => {
  if (err) {
    console.error('Error checking super admin:', err);
    return;
  }

  if (results[0].count === 0) {
    bcrypt.hash('superadmin123', 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err);
        return;
      }

      const insertSql = "INSERT INTO college_admins (username, password, email, college_id) VALUES ('superadmin', ?, 'superadmin@example.com', NULL)";
      pool.query(insertSql, [hashedPassword], (err) => {
        if (err) {
          console.error('Error creating super admin:', err);
          return;
        }
        console.log('Super admin created with username: superadmin and password: superadmin123');
      });
    });
  }
});


// Create admin users table if it doesn't exist
pool.query(`
    CREATE TABLE IF NOT EXISTS college_admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      college_id INT,
      email VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (college_id) REFERENCES colleges(id)
    )`,
  (err) => {
    if (err) throw err;
    console.log('Admin table checked/created');

    // Add a test admin if needed
    const checkAdminSql = "SELECT COUNT(*) as count FROM college_admins WHERE username = 'admin'";
    pool.query(checkAdminSql, (err, results) => {
      if (err) throw err;
      if (results[0].count === 0) {
        // Use bcrypt in production
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        const insertAdminSql = "INSERT INTO college_admins (username, password, email) VALUES ('admin', ?, 'admin@example.com')";
        pool.query(insertAdminSql, [hashedPassword], (err) => {
          if (err) throw err;
          console.log('Test admin created');
        });
      }
    });
  });


// Create events table
pool.query(`
    CREATE TABLE IF NOT EXISTS college_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      college_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      event_date DATETIME NOT NULL,
      location VARCHAR(255),
      event_type VARCHAR(100),
      registration_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
    )`,
  (err) => {
    if (err) throw err;
    console.log('Events table checked/created');
  });

// Create facilities table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    college_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    distance VARCHAR(50),
    description TEXT,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) throw err;
  console.log('Facilities table checked/created');
});

// Admin login route 
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // Get admin user from database
  const sql = 'SELECT * FROM college_admins WHERE username = ?';
  pool.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = results[0];

    // Try bcrypt comparison first if it's a hashed password
    bcrypt.compare(password, admin.password, (err, isMatch) => {
      if (err) {
        console.error('Password comparison error:', err);
        return res.status(500).json({ error: 'Authentication error' });
      }

      // If bcrypt matching works OR direct comparison for older accounts
      if (isMatch || password === admin.password) {
        // Store admin info in session
        req.session.adminId = admin.id;
        req.session.collegeId = admin.college_id;
        req.session.username = admin.username;

        return res.json({
          success: true,
          admin: {
            id: admin.id,
            username: admin.username,
            collegeId: admin.college_id,
            isSuperAdmin: admin.college_id === null
          }
        });
      } else {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    });
  });
});


// Admin logout route
app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Check if admin is authenticated
app.get('/admin/check-auth', (req, res) => {
  if (req.session.adminId) {
    res.json({
      authenticated: true,
      username: req.session.username,
      collegeId: req.session.collegeId
    });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// Create courses table if it doesn't exist
pool.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      duration VARCHAR(50),
      degree_type VARCHAR(50),
      description TEXT
    )`, 
    (err) => {
  if (err) throw err;
  console.log('Courses table checked/created');
});

// Create college_courses junction table if it doesn't exist
pool.query(`
    CREATE TABLE IF NOT EXISTS college_courses (
      college_id INT,
      course_id INT,
      annual_fee DECIMAL(12,2),
      seats INT,
      PRIMARY KEY (college_id, course_id),
      FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
  `, (err) => {
  if (err) throw err;
  console.log('College_courses table checked/created');
});

// Add columns to colleges table if they don't exist
pool.query(`
    ALTER TABLE colleges 
    ADD COLUMN IF NOT EXISTS established_year INT,
    ADD COLUMN IF NOT EXISTS total_students INT,
    ADD COLUMN IF NOT EXISTS placement_rate DECIMAL(5,2),
    ADD COLUMN IF NOT EXISTS avg_package DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS website VARCHAR(255),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS amenities TEXT,
    ADD COLUMN IF NOT EXISTS accreditation VARCHAR(255),
    ADD COLUMN IF NOT EXISTS map_link VARCHAR(255),
    ADD COLUMN IF NOT EXISTS satellite_link VARCHAR(255),
    ADD COLUMN IF NOT EXISTS photo_link1 VARCHAR(255),
    ADD COLUMN IF NOT EXISTS photo_link2 VARCHAR(255),
    ADD COLUMN IF NOT EXISTS photo_link3 VARCHAR(255),
    ADD COLUMN IF NOT EXISTS photo_link4 VARCHAR(255)
  `, (err) => {
  if (err) {

    // MySQL 5.7 doesn't support IF NOT EXISTS for ALTER TABLE
    console.log('Note: If you see an error above about IF NOT EXISTS in ALTER TABLE, it\'s okay - this is expected in some MySQL versions');
  } else {
    console.log('Colleges table extended with new columns');
  }
});

// User registration endpoint
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const sql = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
    pool.query(sql, [username, hashedPassword, email], (err, result) => {
      if (err) {
        console.error('Registration error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({ success: true, id: result.insertId });
    });
  } catch (err) {
    console.error('Password hashing error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// User login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const sql = 'SELECT * FROM users WHERE username = ?';
  pool.query(sql, [username], async (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];

    try {
      // Compare password with hashed password in DB
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Store user info in session
      req.session.userId = user.id;
      req.session.username = user.username;

      return res.json({
        success: true,
        user: { id: user.id, username: user.username }
      });
    } catch (err) {
      console.error('Password comparison error:', err);
      return res.status(500).json({ error: 'Authentication error' });
    }
  });
});

// User logout endpoint
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Check if user is authenticated
app.get('/check-auth', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({
      authenticated: true,
      username: req.session.username
    });
  } else {
    res.json({
      authenticated: false
    });
  }
});


// Get events for a college
app.get('/college/:id/events', (req, res) => {
  const collegeId = req.params.id;
  const sql = `
      SELECT * FROM college_events 
      WHERE college_id = ? AND event_date >= CURDATE()
      ORDER BY event_date ASC
    `;

  pool.query(sql, [collegeId], (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
});

// Create event (admin only)
app.post('/college/:id/events', (req, res) => {
  // Check if user is logged in as admin
  if (!req.session.adminId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const collegeId = req.params.id;

  // Check if admin is authorized for this college
  if (req.session.collegeId !== null && req.session.collegeId !== parseInt(collegeId)) {
    return res.status(403).json({ error: 'Not authorized for this college' });
  }

  const { title, description, event_date, location, event_type, registration_url } = req.body;

  if (!title || !event_date) {
    return res.status(400).json({ error: 'Title and event date are required' });
  }

  const sql = `
      INSERT INTO college_events 
      (college_id, title, description, event_date, location, event_type, registration_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  pool.query(sql, [
    collegeId,
    title,
    description || null,
    event_date,
    location || null,
    event_type || null,
    registration_url || null
  ], (err, result) => {
    if (err) {
      console.error('Error creating event:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Event created successfully'
    });
  });
});

// Delete event (admin only)
app.delete('/events/:id', (req, res) => {
  // Check if user is logged in as admin
  if (!req.session.adminId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const eventId = req.params.id;

  // First check if admin is authorized for this event's college
  const checkSql = 'SELECT college_id FROM college_events WHERE id = ?';
  pool.query(checkSql, [eventId], (err, results) => {
    if (err) {
      console.error('Error checking event:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const collegeId = results[0].college_id;

    // Check if admin is authorized for this college
    if (req.session.collegeId !== null && req.session.collegeId !== collegeId) {
      return res.status(403).json({ error: 'Not authorized for this college' });
    }

    // Delete the event
    const deleteSql = 'DELETE FROM college_events WHERE id = ?';
    pool.query(deleteSql, [eventId], (err) => {
      if (err) {
        console.error('Error deleting event:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ success: true, message: 'Event deleted successfully' });
    });
  });
});


// Get college details by ID
app.get('/college/:id', (req, res) => {
  const collegeId = req.params.id;
  const sql = 'SELECT * FROM colleges WHERE id = ?';

  pool.query(sql, [collegeId], (err, results) => {
    if (err) {
      console.error('Error fetching college:', err);
      return res.status(500).send('Database error');
    }

    if (results.length === 0) {
      return res.status(404).send('College not found');
    }

    // Log the result to verify we're getting all fields
    console.log('College data retrieved from DB:', {
      id: results[0].id,
      name: results[0].name,
      map_link: results[0].map_link,
      satellite_link: results[0].satellite_link,
      photo_link1: results[0].photo_link1
    });

    res.json(results[0]);
  });
});

// Update enhanced college details (admin only)
app.put('/college/:id', (req, res) => {
  // Check if user is logged in as admin
  if (!req.session.adminId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const collegeId = req.params.id;
  const {
    name,
    location,
    ranking,
    established_year,
    total_students,
    placement_rate,
    avg_package,
    website,
    description,
    amenities,
    accreditation,
    map_link,
    satellite_link,
    photo_link1,
    photo_link2,
    photo_link3,
    photo_link4
  } = req.body;

  // Modified check: allow if admin's collegeId is null (super admin) OR matches this college
  if (req.session.collegeId !== null && req.session.collegeId !== parseInt(collegeId)) {
    return res.status(403).json({ error: 'Not authorized for this college' });
  }

  const sql = `
      UPDATE colleges 
      SET name = ?, 
          location = ?, 
          ranking = ?,
          established_year = ?,
          total_students = ?,
          placement_rate = ?,
          avg_package = ?,
          website = ?,
          description = ?,
          amenities = ?,
          accreditation = ?,
          map_link = ?,
        satellite_link = ?,
        photo_link1 = ?,
        photo_link2 = ?,
        photo_link3 = ?,
        photo_link4 = ?
      WHERE id = ?
    `;

  pool.query(sql, [
    name,
    location,
    ranking,
    established_year || null,
    total_students || null,
    placement_rate || null,
    avg_package || null,
    website || null,
    description || null,
    amenities || null,
    accreditation || null,
    map_link || null,
    satellite_link || null,
    photo_link1 || null,
    photo_link2 || null,
    photo_link3 || null,
    photo_link4 || null,
    collegeId
  ], (err, results) => {
    if (err) {
      console.error('Error updating college:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ success: true, id: collegeId });
  });
});



// Corrected endpoint to add a new college (super admin only)
app.post('/college', (req, res) => {
  // Check if user is logged in as admin
  if (!req.session.adminId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  // Only super admins (null collegeId) can create new colleges
  if (req.session.collegeId !== null) {
    return res.status(403).json({ error: 'Only super admins can create new colleges' });
  }

  // Get all college fields
  const {
    name,
    location,
    ranking,
    established_year,
    total_students,
    placement_rate,
    avg_package,
    website,
    description,
    amenities,
    accreditation
  } = req.body;

  // Validate required fields
  if (!name || !location) {
    return res.status(400).json({ error: 'College name and location are required' });
  }

  const sql = `
      INSERT INTO colleges 
      (name, location, ranking, established_year, total_students, placement_rate, 
      avg_package, website, description, amenities, accreditation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  pool.query(sql, [
    name,
    location,
    ranking || null,
    established_year || null,
    total_students || null,
    placement_rate || null,
    avg_package || null,
    website || null,
    description || null,
    amenities || null,
    accreditation || null
  ], (err, results) => {
    if (err) {
      console.error('Error inserting college:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({
      success: true,
      id: results.insertId,
      name,
      location
    });
  });
});


// Endpoint to fetch all colleges or search by name (user functionality)
app.get('/colleges', (req, res) => {
  // optionally,  filter by name using a query parameter
  const { name } = req.query;
  let sql = 'SELECT * FROM colleges';
  const params = [];

  if (name) {
    sql += ' WHERE name LIKE ?';
    params.push(`%${name}%`);
  }

  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error(`Error fetching colleges`, err);
      return res.status(500).send(`Database error`);
    }

    // Add logging to verify map links are being sent
    if (results.length > 0) {
      console.log(`Fetched ${results.length} colleges. First college map_link:`,
        results[0].map_link ? results[0].map_link.substring(0, 50) + '...' : 'null');
    }

    res.send(results);
  });
})



// Get courses for a specific college
app.get('/college/:id/courses', (req, res) => {
  const collegeId = req.params.id;

  const sql = `
      SELECT c.*, cc.annual_fee, cc.seats 
      FROM courses c
      JOIN college_courses cc ON c.id = cc.course_id
      WHERE cc.college_id = ?
    `;

  pool.query(sql, [collegeId], (err, results) => {
    if (err) {
      console.error('Error fetching courses:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // If no courses found, return example data for now
    if (results.length === 0) {
      return res.json([
        {
          name: "Computer Science Engineering",
          degree_type: "B.Tech",
          duration: "4 years",
          annual_fee: 125000,
          seats: 120
        },
        {
          name: "Mechanical Engineering",
          degree_type: "B.Tech",
          duration: "4 years",
          annual_fee: 110000,
          seats: 90
        },
        {
          name: "Electronics Engineering",
          degree_type: "B.Tech",
          duration: "4 years",
          annual_fee: 115000,
          seats: 60
        }
      ]);
    }

    res.json(results);
  });
});

// Add a new course (admin only)
app.post('/courses', (req, res) => {
  // Check if user is logged in as admin
  if (!req.session.adminId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const { name, duration, degree_type, description } = req.body;

  const sql = 'INSERT INTO courses (name, duration, degree_type, description) VALUES (?, ?, ?, ?)';
  pool.query(sql, [name, duration, degree_type, description], (err, result) => {
    if (err) {
      console.error('Error creating course:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(201).json({
      success: true,
      id: result.insertId,
      name,
      duration,
      degree_type,
      description
    });
  });
});

// Associate a course with a college (admin only)
app.post('/college/:id/courses', (req, res) => {
  // Check if user is logged in as admin
  if (!req.session.adminId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const collegeId = req.params.id;
  const { course_id, annual_fee, seats } = req.body;

  // Check if admin is authorized for this college
  if (req.session.collegeId !== null && req.session.collegeId !== parseInt(collegeId)) {
    return res.status(403).json({ error: 'Not authorized for this college' });
  }

  // Check if the association already exists
  const checkSql = 'SELECT * FROM college_courses WHERE college_id = ? AND course_id = ?';
  pool.query(checkSql, [collegeId, course_id], (err, results) => {
    if (err) {
      console.error('Error checking course association:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      // Association exists, update it
      const updateSql = 'UPDATE college_courses SET annual_fee = ?, seats = ? WHERE college_id = ? AND course_id = ?';
      pool.query(updateSql, [annual_fee, seats, collegeId, course_id], (err) => {
        if (err) {
          console.error('Error updating course association:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({ success: true, message: 'Course updated for college' });
      });
    } else {
      // Association doesn't exist, create it
      const insertSql = 'INSERT INTO college_courses (college_id, course_id, annual_fee, seats) VALUES (?, ?, ?, ?)';
      pool.query(insertSql, [collegeId, course_id, annual_fee, seats], (err) => {
        if (err) {
          console.error('Error creating course association:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({ success: true, message: 'Course added to college' });
      });
    }
  });
});



// Get all college admins (super admin only)
// Update this endpoint in server.js
app.get('/admin/users', (req, res) => {
  // Check if user is logged in as admin
  if (!req.session.adminId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  // Check if super admin
  if (req.session.collegeId !== null) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  // Modified query to include college names
  const sql = `
    SELECT a.id, a.username, a.email, a.college_id, c.name as college_name 
    FROM college_admins a
    LEFT JOIN colleges c ON a.college_id = c.id
    WHERE a.id != ?
  `;

  pool.query(sql, [req.session.adminId], (err, results) => {
    if (err) {
      console.error('Error fetching admins:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
});


// Create college admin (super admin only)
app.post('/admin/users', (req, res) => {
  // Check if user is logged in as admin
  if (!req.session.adminId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  // Check if super admin
  if (req.session.collegeId !== null) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const { username, password, email, college_id } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Username, password and email are required' });
  }

  // Hash password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ error: 'Password encryption error' });
    }

    // Insert new admin
    const sql = 'INSERT INTO college_admins (username, password, email, college_id) VALUES (?, ?, ?, ?)';
    pool.query(sql, [username, hashedPassword, email, college_id || null], (err, result) => {
      if (err) {
        console.error('Error creating admin:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({ success: true, id: result.insertId });
    });
  });
});


// Get all registered users (super admin only)
app.get('/admin/registered-users', (req, res) => {
  // Check if user is logged in as admin
  if (!req.session.adminId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  // Check if super admin
  if (req.session.collegeId !== null) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const sql = 'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC';
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
});

// Delete college admin (super admin only)
app.delete('/admin/users/:id', (req, res) => {
  // Check if user is logged in as admin
  if (!req.session.adminId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  // Check if super admin
  if (req.session.collegeId !== null) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const adminId = req.params.id;

  // Prevent deleting yourself
  if (parseInt(adminId) === req.session.adminId) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  const sql = 'DELETE FROM college_admins WHERE id = ?';
  pool.query(sql, [adminId], (err, result) => {
    if (err) {
      console.error('Error deleting admin:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({ success: true });
  });
});


// Get facilities for a specific college
app.get('/college/:id/facilities', (req, res) => {
  const collegeId = req.params.id;

  const sql = 'SELECT * FROM facilities WHERE college_id = ? ORDER BY name';
  pool.query(sql, [collegeId], (err, results) => {
    if (err) {
      console.error('Error fetching facilities:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // If no facilities found, return an empty array
    res.json(results);
  });
});

// Add a facility (admin only)
app.post('/college/:id/facilities', (req, res) => {
  // Check if user is logged in as admin
  if (!req.session.adminId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const collegeId = req.params.id;

  // Check if admin is authorized for this college
  if (req.session.collegeId !== null && req.session.collegeId !== parseInt(collegeId)) {
    return res.status(403).json({ error: 'Not authorized for this college' });
  }

  const { name, type, location, distance, description } = req.body;

  // Validate required fields
  if (!name || !type) {
    return res.status(400).json({ error: 'Facility name and type are required' });
  }

  const sql = 'INSERT INTO facilities (college_id, name, type, location, distance, description) VALUES (?, ?, ?, ?, ?, ?)';
  pool.query(sql, [collegeId, name, type, location, distance, description], (err, result) => {
    if (err) {
      console.error('Error adding facility:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(201).json({
      success: true,
      id: result.insertId,
      name,
      type
    });
  });
});

// Delete a facility (admin only)
app.delete('/facilities/:id', (req, res) => {
  // Check if user is logged in as admin
  if (!req.session.adminId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const facilityId = req.params.id;

  // First check if the admin is authorized for this facility's college
  const checkSql = 'SELECT college_id FROM facilities WHERE id = ?';
  pool.query(checkSql, [facilityId], (err, results) => {
    if (err) {
      console.error('Error checking facility:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    const collegeId = results[0].college_id;

    // Check if admin is authorized for this college
    if (req.session.collegeId !== null && req.session.collegeId !== parseInt(collegeId)) {
      return res.status(403).json({ error: 'Not authorized for this facility' });
    }

    // Delete the facility
    const deleteSql = 'DELETE FROM facilities WHERE id = ?';
    pool.query(deleteSql, [facilityId], (err) => {
      if (err) {
        console.error('Error deleting facility:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ success: true });
    });
  });
});

// Basic home route with HTML content
app.get('/', (req, res) => {
  res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>College Search</title>
          <style>
            h1 { font-size: 60px; color: #333; }
          </style>
        </head>
        <body>
          <h1>College Search Website</h1>
          <p>Use the API endpoints to add or search for colleges.</p>
        </body>
        </html>`
    );
});

// Create applications table if it doesn't exist
pool.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      college_id INT NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      phone_number VARCHAR(20) NOT NULL,
      preferred_course VARCHAR(100) NOT NULL,
      education_level VARCHAR(50) NOT NULL,
      message TEXT,
      preferred_time VARCHAR(50) NOT NULL,
      status VARCHAR(20) DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (college_id) REFERENCES colleges(id)
    )
`);

// Submit application
app.post('/applications', (req, res) => {
  // Check if user is logged in
  if (!req.session.userId) {
    return res.status(403).json({ success: false, message: 'Please log in to apply' });
  }

  const { collegeId, fullName, phoneNumber, preferredCourse, educationLevel, message, preferredTime } = req.body;

  // Validate required fields
  if (!collegeId || !fullName || !phoneNumber || !preferredCourse || !educationLevel || !preferredTime) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled' });
  }

  const sql = `INSERT INTO applications 
        (college_id, full_name, phone_number, preferred_course, education_level, message, preferred_time) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

  pool.query(
    sql,
    [collegeId, fullName, phoneNumber, preferredCourse, educationLevel, message, preferredTime],
    (err, result) => {
      if (err) {
        console.error('Error submitting application:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.json({ success: true, id: result.insertId });
    }
  );
});

// Get applications for a college (admin only)
app.get('/college/:id/applications', (req, res) => {
  // Check if user is logged in as admin
  if (!req.session.adminId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const collegeId = req.params.id;

  // Check if admin is authorized for this college
  if (req.session.collegeId !== null && req.session.collegeId != collegeId) {
    return res.status(403).json({ error: 'Not authorized for this college' });
  }

  const sql = 'SELECT * FROM applications WHERE college_id = ?';
  pool.query(sql, [collegeId], (err, results) => {
    if (err) {
      console.error('Error fetching applications:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
});

// Get specific application details (admin only)
app.get('/applications/:id', (req, res) => {
  // Check if user is logged in as admin
  if (!req.session.adminId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const applicationId = req.params.id;

  const sql = 'SELECT * FROM applications WHERE id = ?';
  pool.query(sql, [applicationId], (err, results) => {
    if (err) {
      console.error('Error fetching application details:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = results[0];

    // Check if admin is authorized for this college
    if (req.session.collegeId !== null && req.session.collegeId != application.college_id) {
      return res.status(403).json({ error: 'Not authorized for this college' });
    }
    res.json(application);
  });
});

// Update application status (admin only)
app.put('/applications/:id/status', (req, res) => {
  // Check if user is logged in as admin
  if (!req.session.adminId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const applicationId = req.params.id;
  const { status } = req.body;

  // Validate status
  if (!['new', 'contacted', 'processed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // First, check if the admin is authorized for this application's college
  pool.query('SELECT college_id FROM applications WHERE id = ?', [applicationId], (err, results) => {
    if (err) {
      console.error('Error fetching application:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const collegeId = results[0].college_id;

    // Check if admin is authorized for this college
    if (req.session.collegeId !== null && req.session.collegeId != collegeId) {
      return res.status(403).json({ error: 'Not authorized for this college' });
    }

    // Update status
    pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, applicationId], (updateErr) => {
      if (updateErr) {
        console.error('Error updating application status:', updateErr);
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ success: true });
    });
  });
});

// Create reviews table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS college_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    college_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY user_college_unique (user_id, college_id)
  )
`, (err) => {
  if (err) throw err;
  console.log('Reviews table checked/created');
});

// Get all reviews for a college
app.get('/college/:id/reviews', (req, res) => {
  const collegeId = req.params.id;

  const sql = `
    SELECT r.*, u.username 
    FROM college_reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.college_id = ?
    ORDER BY r.created_at DESC
  `;

  pool.query(sql, [collegeId], (err, results) => {
    if (err) {
      console.error('Error fetching reviews:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Calculate average rating
    let avgRating = 0;
    if (results.length > 0) {
      const sum = results.reduce((total, review) => total + review.rating, 0);
      avgRating = sum / results.length;
    }

    // Check if the current user has already reviewed
    let userReview = null;
    if (req.session.userId) {
      userReview = results.find(review => review.user_id === req.session.userId);
    }

    res.json({
      reviews: results,
      averageRating: avgRating,
      totalReviews: results.length,
      userReview: userReview ? {
        id: userReview.id,
        rating: userReview.rating,
        reviewText: userReview.review_text
      } : null
    });
  });
});

// Submit or update a review
app.post('/college/:id/reviews', (req, res) => {
  // Check if user is logged in
  if (!req.session.userId) {
    return res.status(403).json({ error: 'Please login to submit a review' });
  }

  const collegeId = req.params.id;
  const userId = req.session.userId;
  const { rating, reviewText } = req.body;

  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  // Check if user already has a review for this college
  const checkSql = 'SELECT id FROM college_reviews WHERE user_id = ? AND college_id = ?';
  pool.query(checkSql, [userId, collegeId], (err, results) => {
    if (err) {
      console.error('Error checking existing review:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      // Update existing review
      const updateSql = 'UPDATE college_reviews SET rating = ?, review_text = ? WHERE id = ?';
      pool.query(updateSql, [rating, reviewText || null, results[0].id], (err) => {
        if (err) {
          console.error('Error updating review:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // After update, update the college's average rating
        updateCollegeAverageRating(collegeId);

        res.json({
          success: true,
          message: 'Review updated successfully',
          reviewId: results[0].id
        });
      });
    } else {
      // Create new review
      const insertSql = 'INSERT INTO college_reviews (college_id, user_id, rating, review_text) VALUES (?, ?, ?, ?)';
      pool.query(insertSql, [collegeId, userId, rating, reviewText || null], (err, result) => {
        if (err) {
          console.error('Error creating review:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // After insert, update the college's average rating
        updateCollegeAverageRating(collegeId);

        res.status(201).json({
          success: true,
          message: 'Review submitted successfully',
          reviewId: result.insertId
        });
      });
    }
  });
});

// Delete a review (owner only)
app.delete('/college/:collegeId/reviews/:reviewId', (req, res) => {
  // Check if user is logged in
  if (!req.session.userId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const reviewId = req.params.reviewId;
  const collegeId = req.params.collegeId;
  const userId = req.session.userId;

  // Check if the review belongs to the user
  const checkSql = 'SELECT user_id FROM college_reviews WHERE id = ?';
  pool.query(checkSql, [reviewId], (err, results) => {
    if (err) {
      console.error('Error checking review ownership:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (results[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    // Delete the review
    const deleteSql = 'DELETE FROM college_reviews WHERE id = ?';
    pool.query(deleteSql, [reviewId], (err) => {
      if (err) {
        console.error('Error deleting review:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      // After delete, update the college's average rating
      updateCollegeAverageRating(collegeId);

      res.json({ success: true, message: 'Review deleted successfully' });
    });
  });
});

// Add a new endpoint - Admin delete review (college admin only)
app.delete('/admin/college/:collegeId/reviews/:reviewId', (req, res) => {
  // Check if user is logged in as admin
  if (!req.session.adminId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const reviewId = req.params.reviewId;
  const collegeId = req.params.collegeId;

  // Check if the admin is authorized for this college
  if (req.session.collegeId !== null && req.session.collegeId != collegeId) {
    return res.status(403).json({ error: 'Not authorized for this college' });
  }

  // Delete the review - no need to check ownership since admin is authorized
  const deleteSql = 'DELETE FROM college_reviews WHERE id = ? AND college_id = ?';
  pool.query(deleteSql, [reviewId, collegeId], (err, result) => {
    if (err) {
      console.error('Error deleting review:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // After delete, update the college's average rating
    updateCollegeAverageRating(collegeId);

    res.json({ success: true, message: 'Review deleted successfully' });
  });
});

// Helper function to update a college's average rating
function updateCollegeAverageRating(collegeId) {
  const sql = 'SELECT AVG(rating) as avg_rating FROM college_reviews WHERE college_id = ?';
  pool.query(sql, [collegeId], (err, results) => {
    if (err) {
      console.error('Error calculating average rating:', err);
      return;
    }

    const avgRating = results[0].avg_rating || 0;

    // Update the college record with the new average rating
    const updateSql = 'UPDATE colleges SET avg_rating = ? WHERE id = ?';
    pool.query(updateSql, [avgRating, collegeId], (err) => {
      if (err) {
        console.error('Error updating college average rating:', err);
      }
    });
  });
}

// Modify the existing rating endpoint to include reviews
// Replace the existing route with this one:
app.get('/college/:id/rating', (req, res) => {
  const collegeId = req.params.id;

  // Get the average rating and count
  const ratingsSql = 'SELECT AVG(rating) as averageRating, COUNT(*) as ratingCount FROM college_reviews WHERE college_id = ?';
  pool.query(ratingsSql, [collegeId], (err, ratingResults) => {
    if (err) {
      console.error('Error fetching ratings:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Check if user has rated
    let userRating = null;
    if (req.session && req.session.userId) {
      const userSql = 'SELECT rating FROM college_reviews WHERE college_id = ? AND user_id = ?';
      pool.query(userSql, [collegeId, req.session.userId], (err, userResults) => {
        if (err) {
          console.error('Error fetching user rating:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (userResults.length > 0) {
          userRating = userResults[0].rating;
        }

        res.json({
          averageRating: ratingResults[0].averageRating || 0,
          ratingCount: ratingResults[0].ratingCount || 0,
          userRating: userRating
        });
      });
    } else {
      res.json({
        averageRating: ratingResults[0].averageRating || 0,
        ratingCount: ratingResults[0].ratingCount || 0,
        userRating: null
      });
    }
  });
});

// Update this existing route to work with the reviews table
app.post('/college/:id/rating', (req, res) => {
  // Check if user is logged in
  if (!req.session.userId) {
    return res.status(403).json({ error: 'Please login to rate' });
  }

  const collegeId = req.params.id;
  const userId = req.session.userId;
  const { rating } = req.body;

  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  // Check if user has already rated this college
  const checkSql = 'SELECT id FROM college_reviews WHERE user_id = ? AND college_id = ?';
  pool.query(checkSql, [userId, collegeId], (err, results) => {
    if (err) {
      console.error('Error checking existing rating:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      // Update existing rating
      const updateSql = 'UPDATE college_reviews SET rating = ? WHERE id = ?';
      pool.query(updateSql, [rating, results[0].id], (err) => {
        if (err) {
          console.error('Error updating rating:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Update college average rating
        updateCollegeAverageRating(collegeId);

        res.json({ success: true, message: 'Rating updated' });
      });
    } else {
      // Create new rating
      const insertSql = 'INSERT INTO college_reviews (college_id, user_id, rating) VALUES (?, ?, ?)';
      pool.query(insertSql, [collegeId, userId, rating], (err) => {
        if (err) {
          console.error('Error creating rating:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Update college average rating
        updateCollegeAverageRating(collegeId);

        res.json({ success: true, message: 'Rating submitted' });
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Express server is listening on port ${port}`);
});