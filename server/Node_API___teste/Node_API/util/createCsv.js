const fs = require('fs');
const { Parser } = require('json2csv');

function createCsvFromArray(dataArray, outputFilePath) {
  try {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new Error('Input data should be a non-empty array.');
    }

    // Use the keys from the first object as column headers
    const fields = Object.keys(dataArray[0]);
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(dataArray);

    // Write the CSV file
    fs.writeFileSync(outputFilePath, csv, 'utf8');
    console.log(`CSV file created successfully at ${outputFilePath}`);
  } catch (error) {
    console.error('Error creating CSV:', error.message);
  }
}

// Export the function to be used in other scripts
module.exports = createCsvFromArray;
