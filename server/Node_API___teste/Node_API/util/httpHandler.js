const axios = require('axios');

/**
 * HTTP Client Module
 * This module provides a function to make HTTP requests with custom headers and support for x-www-form-urlencoded payloads.
 */

/**
 * Makes an HTTP request with custom headers and optional x-www-form-urlencoded payload.
 * 
 * @param {string} url - The URL to send the request to.
 * @param {string} method - The HTTP method (GET, POST, PUT, DELETE, etc.).
 * @param {Object} headers - Custom headers for the HTTP request (merged with default headers).
 * @param {Object} [data={}] - The payload for the request (supports x-www-form-urlencoded if specified).
 * @param {boolean} isUrlEncoded - Indicates if the payload should be encoded as x-www-form-urlencoded.
 * @returns {Promise<Object>} - A promise that resolves to the response or rejects with an error.
 */
async function makeHttpRequest(url, method, headers, data = {}, isUrlEncoded = false) {
    try {
        // Configure request options
        const options = {
            url,
            method,
            headers: {
                ...axios.defaults.headers.common, // Retain default headers
                ...headers
            },
            data: isUrlEncoded ? new URLSearchParams(data).toString() : data,
        };

        // Ensure correct Content-Type for x-www-form-urlencoded
        if (isUrlEncoded) {
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        // Perform the request
        const response = await axios(options);
        return {
            status: response.status,
            headers: response.headers,
            data: response.data
        };
    } catch (error) {
        if (error.response) {
            return {
                error: `Error making HTTP request`,
                details: {
                    status: error.response.status,
                    headers: error.response.headers,
                    data: error.response.data
                }
            };
        }
        return {
            error: `Error making HTTP request`,
            details: error.message
        };
    }
}

module.exports = {
    makeHttpRequest
};
