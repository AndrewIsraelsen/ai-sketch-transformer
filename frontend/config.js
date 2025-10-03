// API Configuration
const API_CONFIG = {
    // Use environment variable or default to localhost for development
    API_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api'
        : `${window.location.protocol}//${window.location.host}/api`,

    SOCKET_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : `${window.location.protocol}//${window.location.host}`
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
