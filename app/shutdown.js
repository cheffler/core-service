const { createHttpTerminator } = require('http-terminator');

// Define the terminator here, so it is available to both functions
let terminator;

/**
 * Function to be called when a shutdown signal has been detected
 *
 * @private
 * @async
 */
async function shutdownListener() {
  console.warn('Starting shutdown sequence...');

  await terminator.terminate();

  // Notify that shutdown has finished
  console.warn('Shutdown sequence complete, closing the process');
}

/**
 * Initiate the shutdown sequence and the event listener
 *
 * @param {https.Server} server
 */
function init(server) {
  // Create the terminator instance
  terminator = createHttpTerminator({ server });

  // Add the listener
  process.on('SIGTERM', shutdownListener);
}

module.exports = { init };
