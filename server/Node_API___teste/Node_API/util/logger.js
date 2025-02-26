// Helper function to get the current timestamp
function getTimestamp() {
    return new Date().toISOString(); // Format: YYYY-MM-DDTHH:mm:ss.sssZ
}

// Log levels and their corresponding colors for the console
const LOG_LEVELS = {
    INFO: { color: '\x1b[32m', label: 'INFO' },   // Green
    DEBUG: { color: '\x1b[34m', label: 'DEBUG' }, // Blue
    WARN: { color: '\x1b[33m', label: 'WARN' },   // Yellow
    ERROR: { color: '\x1b[31m', label: 'ERROR' }, // Red
    FATAL: { color: '\x1b[41m', label: 'FATAL' }, // White text on Red background
};

// Logger class
class Logger {

    /**
     * Logs a message with a specific log level, source, and message.
     * 
     * @param {string} type - The log level (e.g., 'INFO', 'DEBUG', 'WARN', 'ERROR', 'FATAL').
     * @param {string} source - The source of the log (e.g., the module or function name).
     * @param {string} message - The message to be logged.
     */
    log(type, source, message) {
        const logType = LOG_LEVELS[type] || LOG_LEVELS.INFO;
        const timestamp = getTimestamp();
        const formattedMessage = `${timestamp} [${logType.label}] ${source} : ${message}`;

        // Print to console with color
        console.log(`${logType.color}${formattedMessage}\x1b[0m`);

        if (type === 'FATAL') {
            this.handleFatal(formattedMessage);
        }
    }

    handleFatal(message) {
        console.error('\x1b[41mFATAL ERROR OCCURRED: Immediate attention required.\x1b[0m');
        this.sendEmailOrSms(message);
    }

    sendEmailOrSms(message) {
        console.log('Sending email/SMS for FATAL error:', message);
    }

    info(source, message) {
        this.log('INFO', source, message);
    }

    debug(source, message) {
        this.log('DEBUG', source, message);
    }

    warn(source, message) {
        this.log('WARN', source, message);
    }

    error(source, message) {
        this.log('ERROR', source, message);
    }

    fatal(source, message) {
        this.log('FATAL', source, message);
    }
}

// Export a singleton instance to ease the import and use
module.exports = new Logger();
