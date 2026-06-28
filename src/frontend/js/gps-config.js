/**
 * GPS Configuration Loader
 * Load restaurant GPS location from API settings
 */

// Default location (Đại học Trà Vinh)
let RESTAURANT_LOCATION = {
    lat: 9.9234,
    lng: 106.3465,
    radius: 500 // meters
};

/**
 * Load GPS configuration from API
 */
async function loadGPSConfig() {
    try {
        const API_URL = window.API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${API_URL}/settings`);
        const data = await response.json();
        
        if (data.success && data.data) {
            const settings = data.data;
            
            // Update location if GPS settings exist
            if (settings.latitude && settings.longitude) {
                RESTAURANT_LOCATION.lat = parseFloat(settings.latitude);
                RESTAURANT_LOCATION.lng = parseFloat(settings.longitude);
            }
            
            if (settings.radius) {
                RESTAURANT_LOCATION.radius = parseInt(settings.radius);
            }
            
            console.log('✅ GPS Config loaded:', RESTAURANT_LOCATION);
        }
    } catch (error) {
        console.warn('⚠️ Could not load GPS config from API, using default:', error.message);
        console.log('📍 Default location: TVU Trung tâm Học liệu B7');
    }
    
    return RESTAURANT_LOCATION;
}

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadGPSConfig, calculateDistance, RESTAURANT_LOCATION };
}
