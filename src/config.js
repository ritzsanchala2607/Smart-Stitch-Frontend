// API Base URL - uses environment variable with fallback to localhost
export const API_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

console.log('API Base URL:', API_URL);