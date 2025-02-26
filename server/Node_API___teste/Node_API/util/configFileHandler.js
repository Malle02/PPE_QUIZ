const fs = require('fs');
const path = require('path');

class MetadataUtil {
    static filePath = path.resolve(__dirname, '../config/metadata.json');

    // Ensures the metadata file exists
    static ensureFileExists() {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, JSON.stringify({}, null, 2));
        }
    }

    // Reads a specific field from the metadata file
    static read(field) {
        try {
            this.ensureFileExists();
            const data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
            return data[field] || null;
        } catch (err) {
            console.error(`Error reading field "${field}" from metadata:`, err);
            return null;
        }
    }

    // Writes (or updates) a field in the metadata file
    static write(field, value) {
        try {
            this.ensureFileExists();
            const data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
            data[field] = value;
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
        } catch (err) {
            console.error(`Error writing field "${field}" to metadata:`, err);
        }
    }

    // Loads installation timestamp (returns properly formatted string)
    static loadInstallationTimestamp() {
        let timestamp = this.read('installationTimestamp');
        if (!timestamp) {
            timestamp = this.formatTimestamp(new Date());
            this.write('installationTimestamp', timestamp);
        }
        return timestamp;
    }

    // Helper: Formats timestamp to remove 'T' and 'Z'
    static formatTimestamp(date) {
        return date.toISOString().replace('T', ' ').replace('Z', '');
    }
}

module.exports = MetadataUtil;
