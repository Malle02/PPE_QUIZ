const { invokeSoapMethodWithAuth, formatOptionsForMilestone, ServiceType } = require("../../../util/soapHandler");

/**
 * Retrieves raw data from the management server using the specified method and arguments.
 * 
 * @param {string} domain - The domain of the management server.
 * @param {string} method - The SOAP method to invoke.
 * @param {object} args - The arguments for the SOAP method.
 * @param {string} username - The username for authentication.
 * @param {string} password - The password for authentication.
 * @returns {Promise<any>} - The raw data from the management server.
 */
async function fetchRawDataFromManagementServer(domain, method, args, username, password) {
    const serverCommandsUrl = `https://${domain}/ManagementServer/${ServiceType.ServerCommand}?wsdl`;
    const options = formatOptionsForMilestone(domain, ServiceType.ServerCommand);

    try {
        return await invokeSoapMethodWithAuth(
            serverCommandsUrl,
            options,
            method,
            args,
            username,
            password,
            domain
        );
    } catch (error) {
        console.error(`Error fetching data using method ${method}:`, error);
        throw error;
    }
}

module.exports = { fetchRawDataFromManagementServer } ;