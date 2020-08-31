const fs = require('fs');
const path = require('path');

// Use path and __dirname to create a path to the root of the project
const projectRoot = path.join(__dirname, '..');

// Define the secrets directory/folder name
const secretsDir = 'secrets';

// Define the names of the certificate files
const certificateFiles = {
  cert: 'coreservice.dev.pem',
  key: 'coreservice.dev-key.pem',
};

// Define the full paths to the files, using path.join to ensure it is combined safely
const certificatePaths = {
  cert: path.join(projectRoot, secretsDir, certificateFiles.cert),
  key: path.join(projectRoot, secretsDir, certificateFiles.key),
};

/**
 * Prepare service for use
 */
function boot() {
  // HTTPs options
  let httpsOptions;
  try {
    httpsOptions = {
      cert: fs.readFileSync(certificatePaths.cert),
      key: fs.readFileSync(certificatePaths.key),
    };
  } catch (err) {
    console.error(
      'Error encountered while trying to read certificate files, cannot boot without valid files',
    );
    console.error(err);
    process.exit(1);
  }

  return {
    httpsOptions,
  };
}

module.exports = boot;
