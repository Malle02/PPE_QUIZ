const soap = require('soap');

/**
 * SOAP Client Module with Basic Authentication
 * This module provides a function to create a SOAP client, invoke a SOAP method with authentication,
 * and return a promise-based result. It also includes utility functions for formatting options.
 */

/**
 * Service Types Enumeration
 */
const ServiceType = {
    ServerCommand: 'ServerCommandService.svc',
    ConfigurationAPI: 'ConfigurationApiService.svc'
};


/**
 * Creates a SOAP client and invokes a method with the provided arguments and basic authentication.
 * 
 * @param {string} url - The WSDL URL to connect to.
 * @param {Object} [options={}] - Optional settings for the SOAP client.
 * @param {string} method - The SOAP method to invoke.
 * @param {Object} [args={}] - The arguments for the SOAP method (can be empty).
 * @param {string} username - The username for basic authentication.
 * @param {string} password - The password for basic authentication.
 * @param {string} domain - The domain for basic authentication.
 * @returns {Promise<Object>} - A promise that resolves to the SOAP response or rejects with an error.
 */
async function invokeSoapMethodWithAuth(url, options = {}, method, args = {}, username, password, domain) {
    return new Promise((resolve, reject) => {
        // Create the SOAP client
        soap.createClient(url, options, (err, client) => {
            if (err) {
                return reject({ error: `Error creating SOAP client`, details: err });
            }
            // Add Basic Authentication with domain
            client.setSecurity(new soap.BasicAuthSecurity(`${domain}\\${username}`, password));

            // Check if the method exists
            if (!client[method]) {
                return reject({ error: `Method not found`, details: `Method '${method}' not found in the SOAP client.` });
            }

            // Call the SOAP method
            client[method](args, function (err, result) {
                if (err) {
                    return reject({ error: `Error invoking SOAP method`, details: err });
                }
                resolve(result);
            });
        });
    });
}

/**
 * Utility function to format options for Milestone systems.
 * 
 * @param {string} domain - Domain or IP address of the Milestone system.
 * @param {string} serviceType - The type of service (ServerCommand or ConfigurationAPI).
 * @returns {Object} - The formatted options object.
 */
function formatOptionsForMilestone(domain, serviceType) {
    if (!Object.values(ServiceType).includes(serviceType)) {
        throw new Error(`Invalid service type: ${serviceType}`);
    }
    return {
        endpoint: `https://${domain}/ManagementServer/${serviceType}`
    };
}

module.exports = {
    invokeSoapMethodWithAuth,
    formatOptionsForMilestone,
    ServiceType
};

