const { makeHttpRequest } = require('../../../util/httpHandler');

class MilestoneApiTokenManager {
    constructor(domain, username, password) {
        if (MilestoneApiTokenManager.instance) {
            return MilestoneApiTokenManager.instance;
        }

        this.domain = domain || null;
        this.username = username || null;
        this.password = password || null;
        this.token = null;
        this.validity = null; // Timestamp when the token expires

        MilestoneApiTokenManager.instance = this;
    }

    static init(domain, username, password) {
        if (!MilestoneApiTokenManager.instance) {
            MilestoneApiTokenManager.instance = new MilestoneApiTokenManager(domain, username, password);
        }
        const instance = MilestoneApiTokenManager.instance;
        if (!instance.domain || !instance.username || !instance.password) {
            instance.domain = domain;
            instance.username = username;
            instance.password = password;
        }
        return instance;
    }

    static getInstance() {
        if (!MilestoneApiTokenManager.instance) {
            throw new Error("TokenManager is not initialized. Call TokenManager.init(domain, username, password) first.");
        }
        return MilestoneApiTokenManager.instance;
    }

    async getToken() {
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

        if (this.token && this.validity && currentTime < this.validity) {
            // Token is valid
            return this.token;
        }

        // Token is null or expired, retrieve a new one
        await this.renewToken();
        return this.token;
    }

    async renewToken() {
        if (!this.domain || !this.username || !this.password) {
            throw new Error("TokenManager is not initialized. Call TokenManager.init(domain, username, password) first.");
        }

        try {
            const response = await getRestApiToken(this.domain, this.username, this.password);
            this.token = response.token;
            this.validity = Math.floor(Date.now() / 1000) + response.validity; // Calculate new expiry time
        } catch (error) {
            console.error("Failed to renew token:", error);
            throw new Error("Could not retrieve token.");
        }
    }
}

/**
 * Fetches an access token and its validity period from the API response.
 * 
 * @param {string} domain - The domain of the API endpoint.
 * @param {string} username - The username for authentication.
 * @param {string} password - The password for authentication.
 * @returns {Promise<{ token: string, validity: number }>} - An object containing the token and its validity period.
 * @throws {Error} - Throws an error if the response is not successful or if the expected data is missing.
 */
async function getRestApiToken(domain, username, password) {
    const url = `https://${domain}/API/IDP/connect/token`;
    const method = 'POST';
    const data = {
        grant_type: 'password',
        username: username,
        password: password,
        client_id: 'GrantValidatorClient',
    };

    try {
        const response = await makeHttpRequest(url, method, {}, data, true);

        // Safe checks
        if (response.error) {
            throw new Error(`HTTP request failed with status ${response.details?.status || 'unknown'}`);
        }
        if (response.status !== 200) {
            throw new Error(`Unexpected response status: ${response.status}`);
        }

        const { access_token, expires_in } = response.data;

        if (!access_token || typeof expires_in !== 'number') {
            throw new Error("Invalid response structure. Missing 'access_token' or 'expires_in'.");
        }

        // Return the token and validity in the desired format
        return {
            token: access_token,
            validity: expires_in,
        };
    } catch (error) {
        console.error('Error fetching access token:', error.message);
        throw new Error("Could not retrieve access token.");
    }
}

module.exports = MilestoneApiTokenManager;
