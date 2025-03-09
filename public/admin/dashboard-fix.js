// Admin Dashboard Link Fixer

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard link fixer running...');
    
    // Fix navigation tabs
    const navTabs = document.querySelectorAll('.nav-tabs a');
    if (navTabs.length === 0) {
        console.warn('No navigation tabs found!');
    } else {
        console.log(`Found ${navTabs.length} navigation tabs`);
        
        // Make sure at least one tab is active
        let hasActiveTab = false;
        
        navTabs.forEach(tab => {
            // Ensure visibility
            tab.style.display = 'block';
            
            if (tab.classList.contains('active')) {
                hasActiveTab = true;
            }
            
            // Make sure click handlers are working
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                const tabId = this.getAttribute('data-tab');
                
                // Update active tab
                document.querySelectorAll('.nav-tabs a').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Show selected tab content
                document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
                const targetPane = document.getElementById(tabId);
                if (targetPane) {
                    targetPane.classList.add('active');
                } else {
                    console.warn(`Tab pane with ID ${tabId} not found`);
                }
            });
        });
        
        // If no tab is active, activate the first one
        if (!hasActiveTab && navTabs.length > 0) {
            navTabs[0].classList.add('active');
            const firstTabId = navTabs[0].getAttribute('data-tab');
            const firstPane = document.getElementById(firstTabId);
            if (firstPane) {
                firstPane.classList.add('active');
            }
        }
    }
    
    // Check for invisible containers
    document.querySelectorAll('.tab-content, .tab-pane').forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' && !el.classList.contains('tab-pane')) {
            console.warn('Container is hidden:', el);
            el.style.display = 'block';
        }
    });


    // This runs 2 seconds after page load to ensure data has been fetched
    setTimeout(() => {
        // Check if we're on the admin dashboard
        if (window.location.pathname.includes('/admin/dashboard.html')) {
            console.log('Verifying map and photo link fields...');
            
            // Check if fields exist and have values
            const mapLink = document.getElementById('mapLink');
            const satelliteLink = document.getElementById('satelliteLink');
            const photoLink1 = document.getElementById('photoLink1');
            
            if (mapLink) console.log('Map Link value:', mapLink.value);
            if (satelliteLink) console.log('Satellite Link value:', satelliteLink.value);
            if (photoLink1) console.log('Photo Link 1 value:', photoLink1.value);
            
            // Verify database connection by re-fetching college data
            if (window.currentCollegeId) {
                console.log('Re-fetching college data to verify database values...');
                fetch(`/college/${window.currentCollegeId}`)
                    .then(response => response.json())
                    .then(college => {
                        console.log('College data re-fetched from database:', {
                            id: college.id,
                            name: college.name,
                            map_link: college.map_link,
                            satellite_link: college.satellite_link,
                            photo_link1: college.photo_link1
                        });
                        
                        // Fix the form submission issue by repopulating form fields
                        // This ensures values are not lost after submission
                        if (mapLink && college.map_link) mapLink.value = college.map_link;
                        if (satelliteLink && college.satellite_link) satelliteLink.value = college.satellite_link;
                        if (photoLink1 && college.photo_link1) photoLink1.value = college.photo_link1;
                        
                        // Also populate other photo links
                        const photoLink2 = document.getElementById('photoLink2');
                        const photoLink3 = document.getElementById('photoLink3');
                        const photoLink4 = document.getElementById('photoLink4');
                        
                        if (photoLink2 && college.photo_link2) photoLink2.value = college.photo_link2;
                        if (photoLink3 && college.photo_link3) photoLink3.value = college.photo_link3;
                        if (photoLink4 && college.photo_link4) photoLink4.value = college.photo_link4;
                    })
                    .catch(err => console.error('Error re-fetching college data:', err));
            }
        }
    }, 2000);

    // Add validation for iframe code
    setTimeout(() => {
        // Check if we're on the admin dashboard
        if (window.location.pathname.includes('/admin/dashboard.html')) {
            console.log('Validating map embed code...');
            
            // Get map link field
            const mapLinkField = document.getElementById('mapLink');
            
            if (mapLinkField) {
                // Add tooltip explaining iframe requirement
                const tooltip = document.createElement('div');
                tooltip.innerHTML = `
                    <div style="margin-top: 8px; padding: 8px; background-color: #f0fff4; border-left: 3px solid #38a169; font-size: 0.85rem;">
                        <strong>Note:</strong> Please paste the complete iframe HTML code from Google Maps. 
                        Start with &lt;iframe and end with &lt;/iframe&gt;
                    </div>
                `;
                mapLinkField.parentNode.insertBefore(tooltip, mapLinkField.nextSibling);
                
                // Add simple validation
                mapLinkField.addEventListener('blur', function() {
                    const value = this.value.trim();
                    if (value && (!value.includes('<iframe') || !value.includes('</iframe>'))) {
                        this.style.borderColor = '#e53e3e';
                        tooltip.innerHTML = `
                            <div style="margin-top: 8px; padding: 8px; background-color: #fff5f5; border-left: 3px solid #e53e3e; font-size: 0.85rem;">
                                <strong>Warning:</strong> This doesn't look like a valid iframe embed code.
                                Please paste the complete code starting with &lt;iframe and ending with &lt;/iframe&gt;
                            </div>
                        `;
                    } else {
                        this.style.borderColor = '';
                        tooltip.innerHTML = `
                            <div style="margin-top: 8px; padding: 8px; background-color: #f0fff4; border-left: 3px solid #38a169; font-size: 0.85rem;">
                                <strong>Note:</strong> Please paste the complete iframe HTML code from Google Maps. 
                                Start with &lt;iframe and end with &lt;/iframe&gt;
                            </div>
                        `;
                    }
                });
            }
        }
    }, 3000);
});
