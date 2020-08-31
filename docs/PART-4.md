# Base Service <!-- omit in toc -->

In part 3 we built our app but adding key middleware useful for all routes (aka APIs). An app is a part of a service, it handles the routing and middleware, whereas the service will handle other things like http/https, startup/shutdown and configuration.

- [HTTPs](#https)
  - [Making a Certificate](#making-a-certificate)
  - [Enable HTTPs](#enable-https)
  - [Update Postman](#update-postman)
- [Boot Sequence](#boot-sequence)
- [Shutdown Sequence](#shutdown-sequence)
- [Done](#done)

## HTTPs

All services should run on HTTPs as standard, in the past it has been challenging to set this up and configure it correct, so has been the domain of the deployment teams to convert a service built in HTTP to use HTTPs. Now it is quite easy to get your own certificates that work locally without issue and the importance of developing in an environment as close to production is vital to minimise bugs, and the importance of this basic security cannot be underestimated.

There are cases where you are okay to develop services that do not use HTTPs, your service could be destined to live within a protected environment where all incoming requests go through a special security layer. And, if the architecture allows it, you may not include HTTPs to speed up processing time. But for our purposes, we are not going to ignore this and setup our development environment correctly.

### Making a Certificate

There are countless blogs of varying detail about the subject of certificates and certificate authority (CA) and how the concept of trust is handled. It is a complex subject and takes time to get a handle of, you can read about these to understand the process of establishing a trusted CA on your own computer (or development network) and generating certificates from this central place. Or we can skip this for now and use a tool that sets this up for us. [`mkcert`](https://github.com/FiloSottile/mkcert) is a great tool that simplifies this for local work. Read the docs and get it up and running for yourself.

Once you have it installed we can make the certificates we need, and we want to make a wildcard certificate as we may use sub-domains to handle different parts of our service (e.g. admin.example.com to handle all administrative API calls). Now pick a local development URL and top-level domain, I like to use `dev` for the top-level to make it clear. Then we create a folder called `secrets` into which we can place the certificates, we will add `secrets` to `.gitignore` so we do not share/overwrite other developer's certificates or (more importantly) the same in production.

> Note: this works on Mac & Unix systems, sorry Windows, I do not have a Windows machine to check how to make this work.

```sh
# Make the directory and head into it
mkdir secrets
cd secrets

mkcert "*.coreservice.dev"
```

We now have two files in `secrets` that are our certificates, these are also trusted by out computer so software like browsers will trust these certificates and not cause us issues. In the past, I have built this on my own, and taken most of a day to do it, `mkcert` is a great tool. I am sure there are other tools and websites like [letsencrypt.org](https://letsencrypt.org/) that can help too.

### Enable HTTPs

Now we need to configure our service to use this certificate and serve up our APIs on HTTPs. We have not yet altered our `app/index.js` file to use our new `app.js`, so we can easily work here and test. Make sure your docker is up and running too, and you have added the Postman collection, if you are using this.

In `index.js` we will now configure express to use HTTPs.

```js
// app/index.js

// ... other requires
// Add https module (built into NodeJS)
const https = require('https');
const fs = require('fs'); // Include fs and path to get the cert & key
const path = require('path');

// ... app initialisation

// Define the path to secrets
const secretsDir = path.join(__dirname, '..', 'secrets');

// Create the options for the HTTPs server
const options = {
  cert: fs.readFileSync(secretsDir + '/coreservice.dev.pem'),
  key: fs.readFileSync(secretsDir + '/coreservice.dev-key.pem'),
};
// It is okay to read sync here as this is part of the boot operation
// If the files are missing, it will throw an error and stop the service from booting, a good result

// create the server
const server = https.createServer(options, app)

// Change from app, to server and http to https
server.listen(port, () => {
  console.log(`Example app listening at https://localhost:${port}`);
});
```

We now have our service running on HTTPs using our custom certificates.

### Update Postman

When we created our first API in the Postman collection we created environment variable called `service_protocol`, which we can now change to `https`. We can also update our `/etc/hosts` file to route traffic to our new URL. The `hosts` file tells your computer where to look for some URLs, easy to update and modify for development, it is your local DNS and is checked before external DNS systems.

```txt
## Core Service Development

127.0.0.1 admin.coreservice.dev
```

Add the above text to your hosts file. Useful to add a header explaining what each section is for, if working on a specific project, use this. The first part of any line (not commented out by a #), is the IP address, in this case the localhost IP. The second part is the URL you will use, note we cannot use wildcards '*' here. With this change we can alter the Postman environment configuration variable `service_url` to `admin.coreservice.dev`.

> There are some tools to help manage hosts files, have a search and see what you can find if you need to.

Now test the API call, you may encounter an issue where the SSL certificate is not validated. This is because Postman is trying to validate the certificate against the global list of CAs and cannot find your computer in that list. Postman has not checked your local trust store like a browser would. You can try the [URL](https://admin.coreservice.dev:2000/) in your browser and see what you get. For Postman, turn off the setting to verify SSL connections (SSL certificate verification).

We have maintained the port, for some services you may see that HTTPs runs on port `443`. This is the standard for exposed services, e.g. your browser will try to access things on port `80` by default, if HTTPs is required it will check on port `443`.

## Boot Sequence

In the above work to add HTTPs, we read some files synchronously as this is done during boot time and doesn't matter if it takes a second or more. We will also get an error from (`fs.readFileSync`) if the file is not there, causing the service not to boot. This is a great thing to happen, lets us know very quickly that something is wrong before we start trying to do any real work.

This idea of our service failing to boot if key parts are not ready is really useful and we should isolate it all into a boot sequence which will log and exit informing us which part is clearly failing. Into this we can include things like connecting to database(s) and other 3rd party systems.

For now, we only have the reading of the certificate files, but we will add more in the future. We should move this to a specific file that, when 'required', will attempt the boot sequence(s) returning the data necessary.

Create a file in `app` called `boot.js`. Then create a function called `boot` and export this. Much like `app.js` we wont be exporting more than one function.

```js
// app/boot.js

function boot() {}

module.exports = boot;
```

We can now move the HTTPs options setup from `index.js` to here. A simple copy and past creates

```js
// app/boot.js

const fs = require('fs');
const path = require('path');

/**
 * Prepare service for use
 */
function boot() {
  // Define the path to secrets
  const secretsDir = path.join(__dirname, '..', 'secrets');

  // HTTPs options
  const options = {
    cert: fs.readFileSync(secretsDir + '/coreservice.dev.pem'),
    key: fs.readFileSync(secretsDir + '/coreservice.dev-key.pem'),
  };

  return {
    options,
  };
}

module.exports = boot;
```

Returning an object with options in it is good, but not quite robust for future changes, lets change this to `httpsOptions`. And, knowing more changes are to come, we can change the way we define the paths to the certificates. We can also wrap the `readFileSync` functions in a `try...catch` to catch the error and log an appropriate message, easier for us to understand later on.

At the moment, this function is synchronous, it may not always be this way, when it changes we can update the impacted code. The new `boot.js` file is:

```js
// app/boot.js

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
```

Here we are creating a base path to the root of the project/repository, then building upon this to access the actual files. We split this code out as we will move some of this to configuration, as the location of certificate files may change based on the environment. In the function we do the actual reading of the files with a catch to log an error if something goes wrong. We are using `console` here until we build our main logging tool. On an error, we force an error exit of the process with `process.exit(1)`, any management tool will flag this as an error and we will know about it. We return the options for use in `app/index.js`.

```js
// app/index.js
// ... other requires

// Local modules
const boot = require('./boot');

// ... app initialisation

// Trigger boot sequence, then launch service
const { httpsOptions } = boot();
const server = https.createServer(httpsOptions, app);

// ... server listen
```

## Shutdown Sequence

When our service shuts down, either intentionally or through some error, we would like to trigger some actions to clean up any data etc. First, we want to stop accepting any inbound requests from clients and let those currently being processed finish. If we have any connections to databases we will close these safely, same goes for any sub-processes or write activities. To help with this, we installed [`http-terminator`](https://github.com/gajus/http-terminator) earlier.

First, lets create a file called `shutdown.js` to retain this logic that exposes a simple shutdown function that we can initialise when our service boots up. Following the docs from `http-terminator`, we set this up in a shutdown listener function and initiate the variables in an initiation function. We expose the initiation function to be registered at the correct time and place.

```js
// app/shutdown.js

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
  console.warn('Starting shutdown sequence');

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

```

The above may seem like overkill right now, but we will be adding additional shutdown actions in the future, and like the other parts of our service it is good practice to isolate these and wrap them in functions.

We create a variable to link the terminator to, this is then available to all functions within the file. The initiation function `init` will setup all the values we need. `server` is not available from the start, we have to wait until we build in in `app/index.js`. We then add the listener function to the `SIGTERM` event, which is triggered when we want a "graceful" shutdown. We expose the init function as a property in the exports object, as we may want to add more functions to this file to allow other parts of our service to register actions to be carried out when shutting down.

In `app/index.js` we link this file and initialise it after we have created the server object.

```js
// app/index.js
// ... other requires

// Local modules
const boot = require('./boot');
const shutdown = require('./shutdown');

// ... server initialisation

// Setup the shutdown listener
shutdown.init(server);

// ... server listen
```

We can not test this. If running docker, watch the logs in one terminal by running `docker logs -f core-service`, in another terminal run `docker stop core-service`. In the first terminal you will see some logs with the outputs we created in the listener function.

```sh
Example app listening at https://*.coreservice.dev:2000
Starting shutdown sequence...
Shutdown sequence complete, closing the process
```

More logging may be present, generated by `nodemon`.

## Done

This part is now done, we have created certificates and clean boot and shutdown sequences. These sequences will become valuable in the coming parts, allowing us to ensure that our app is ready to go and able to connect to all the other parts we need.
