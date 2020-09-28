# Part 3 - Base Middleware <!-- omit in toc -->

Regardless of the target architecture, we will always need to build a base application layer. This is the part that takes care of setting up an HTTP(s) server, handling routing (sending request to the right code), initial actions on inbound requests and a few more bits and pieces. For our purposes, it is important that this code is generic and easy to copy over to create a new service quickly, this is key to the success of a modular monolith.

As we are using [Express](https://expressjs.com/) as our base, we will be using the concept of `middleware`. This concept takes some time to grasp, but when combined with some of the features of JavaScript, it becomes very useful. We will go into more detail on this later.

But first...

- [`app.js`](#appjs)
- [HTTP Response Security](#http-response-security)
- [Access Logging](#access-logging)
- [Compression](#compression)
- [Request Parsing](#request-parsing)
- [Done](#done)

## `app.js`

In [Part 2](./PART-2.md) we built a base application so we can test a single simple API and connect to a database. We will expand on this to split out some key concepts and prepare for the modular part of the service.

In `app/` folder we have `index.js` which is the starting point if we want to load up the service. This file should take care of a few things, but not the building of the `app` object as created by `express`. In a later part we will explore the idea of component testing, this uses a framework that would benefit from having direct simple access to the `app` object. Also, we will want to build in other loading steps to run before our application is ready to accept connections.

Create a file `app/app.js`, in this file we will create the app object and make it available. Normally, I like to ensure that my modules always export an object with the different functions it contains, even if there is one. This helps to grow the file, but in the case of `app.js` it is fine to export the complete app object only.

We now write the `app.js` file to match the below, and then we can start adding the basic middleware.

```js
const express = require('express');
const app = express();

// Add middleware and configuration here

module.exports = app;
```

## HTTP Response Security

Security is a large and complex subject, every developer is responsible for this (cliché, I know, but true). At this stage we will not concern ourselves with `https`, auth & auth, database access, VM hardening, networking etc. We will focus on securing our response objects. This involves setting headers on our HTTP packages to prevent some misuse of our APIs.

The best package to help us with this is called [helmet](https://helmetjs.github.io/), it provides simple out of the box setup to protect our application. Please read the documentation to understand each of the 11 middleware functions it adds, and the configuration. Depending on your situation, you may need to change some of the configuration. For now we simply add it as below (we installed it in [Part 1](PART-1.md)).

```js
/** previous requires */
const helmet = require('helmet');

// Add middleware and configuration here
app.use(helmet());

module.exports = app;
```

## Access Logging

We wont go into full blown logging just yet, we will when we start writing our own middleware. This is about access logging. This is a simple middleware that will log out useful information about a request made to the service after it has completed. It normally contains the url, method, response code (200, etc) and some other bits about the request. There are many common formats for these types of logs that can be read by other tools to help understand the health and performance of your service. It is also very useful for development.

We will use a package called [morgan](https://github.com/expressjs/morgan#readme) to apply the basic setup for this. We may revisit this later on to change it a little to give us more information.

```js
/** previous requires */
const morgan = require('morgan');

// Add middleware and configuration here
app.use(helmet());
app.use(morgan('combined'));

module.exports = app;
```

This will output a log string for each API call with the basic information, including the time it took to complete.

## Compression

Compression is a good performance enhancement, it will *"zip"* each of your responses in a format that is known to browsers making the responses as small as possible. A simple middleware to add that can have a positive impact on the user experience, no reason not to use it.

We will use the aptly named [compression](https://github.com/expressjs/compression#readme) library, and like the other middleware so far, we will hold off on any specific configuration until we have to.

```js
/** previous requires */
const compression = require('compression');

// Add middleware and configuration here
app.use(helmet());
app.use(morgan('combined'));
app.use(compression());

module.exports = app;
```

## Request Parsing

A client (anything outside of your service, e.g. UI), will send requests to your service to get, add, change data or perform some sort of other action. Almost any action will need some data in the request to act upon, for example, an ID to get specific data on something. This comes in the request in 4 places, 1 of which is reserved mainly for authentication and other bits:

- URL parameters (aka params)
- URL options information (aka query)
- Request body (normally in POST & PUT calls)
- Request headers (mainly used for auth & auth bits)

This data can come in several formats from the client, normally we will use JSON data. Simple and easy for both clients and services. However, some older systems use other things like multi-part forms. We wont go into these for now, just be aware there are other ways to receive data.

To get this information out of the request and into a usable format, we will use some builtin (to express) middleware.

```js
/** previous requires */

// Add middleware and configuration here
app.use(helmet());
app.use(morgan('combined'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

module.exports = app;
```

`json` provides a method to parse the incoming data into a JSON format. Where `urlencoded` will extract the same from URLs (e.g. params & query).

## Done

We have now added some basic middleware to our application, there will be more to come as we explore the required functionality of our service. The setup of our app has been isolated to simplify future tasks and to keep things separated.
