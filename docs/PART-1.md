# Part 1 - Initial Decisions and Setup

This blog is about building a core service that provides the key functionality, features and APIs needed to for an authenticated platform. By service, I mean an application/server that provides web APIs that a website can call to get, create, update and delete data. This service will provide the core APIs needed for an authenticated website using a *modular monolith* design, allowing easy migration to a microservices architecture.

## Initial Decisions

Having an idea about how your service(s) will be deployed and the medium to long term plans for your whole system is very useful when making decisions. It is inevitable that some decisions will cause problems further down the line, so we will try to remain flexible and try to keep clear boundaries of our services. For example, we are not starting with a microservices pattern as the overheard of operations and development is too high so we will adopt a module monolith pattern where we group sets of APIs into services of similar functionality, domain or data. This structure will allow us to identify and isolate any service we feel needs to be split out, this could be done for a number of reasons, like performance. No point in scaling up your core services when only one service is really getting all the traffic, split that out and improve it.

Below are some of the decisions and some reasons for them.

1. Modular monolith
   1. Ease of development
   2. Ease of operations
   3. Can split out and scale as required
   4. Central authentication to start with
2. Node JS & Express
   1. A runtime and framework I am familiar with
   2. The middleware pattern helps us build APIs faster
   3. Using Node 12, latest and stable
3. PostGreSQL Database
   1. A good dynamic database
   2. Can use `sequelize` ORM, allowing flexibility on database choices
4. JWT Authentication
   1. Easy to implement
   2. Can keep key information within package
   3. Reduces calls to database for user information
   4. Allows for decoupled scaling (RESTful architecture)
   5. Use `passport` to easily implement

For this project we will ignore a UI and develop everything as web APIs and use a API tool to check. No need to add the headache of UI development too.

## Setup

To start we will initialise git, npm, folder structure and install the base packages we want to use.

After creating the main folder `core-service` and making sure we are on NodeJS v12 we just run `npm init -y` to create the base `package.json` file. We update this with some additional information.

```json
// Add the version of Node we want this to run on
"engines": {
  "node": ">=12.0.0"
}
```

### Development Decisions

Before we start writing code, some decisions should be made on how we want to develop. This includes the environment, frameworks and additional tools.

1. Docker
   1. Use docker to run our dependencies (database)
   2. Use docker to run the service in development
   3. Allows fast start of development
2. Nodemon
   1. Use `nodemon` tool to restart service on file changes
   2. Brilliant for fast updates and testing
3. Postman
   1. Use the Postman tool for API testing
   2. Can store configuration in repo for easy sharing
4. Jest
   1. Jest is a great testing framework with lots of support
   2. It is an all in one, so easy to work with
   3. Other testing frameworks/tools will be introduced later
   4. Unit tests will be kept next to files they test in a `__tests__` folder
5. Eslint
   1. Enforces common patterns for all developers to work with
   2. Integrates well with IDEs
   3. Use a base configuration

### Folders

To start we create a set of folders, not all will be used immediately.

| Folder     | Purpose                                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `app`      | Core code to get the service running, this folder can be duplicated without worry when splitting out a service    |
| `config`   | Files that are used to configure the service, e.g. location of database(s)                                        |
| `docker`   | Docker and Docker Compose files for development                                                                   |
| `docs`     | Blog files and other documentations                                                                               |
| `lib`      | Code that could be used by other services, potentially custom packages                                            |
| `services` | Individual folders for each service that will be added, e.g. `user`. This folder will contain everything it needs |
| `tests`    | Component and integration tests, not unit tests                                                                   |

## Installation

Having made the above decisions and building the folders, lets get started by installing all the bits and pieces we need. Of course, all of this is in the `package.json` file for you.

First, the main dependencies we want to use.

| Package                                                        | Purpose                                   |
| -------------------------------------------------------------- | ----------------------------------------- |
| [ajv](https://ajv.js.org/)                                     | JSON data validator                       |
| [compression](https://github.com/expressjs/compression#readme) | Compresses HTTP responses for performance |
| [config](https://lorenwest.github.io/node-config/)             | Simple configuration management           |
| [express](https://expressjs.com/)                              | Main http server package                  |
| [helmet](https://helmetjs.github.io/)                          | Basic security                            |
| [http-terminator](https://github.com/gajus/http-terminator)    | Manages shutdown                          |
| [lightship](https://github.com/gajus/lightship#readme)         | Abstraction of key health and other APIs  |
| [moment](https://momentjs.com/)                                | Useful time library                       |
| [morgan](https://github.com/expressjs/morgan#readme)           | Access logging                            |
| [passport](http://www.passportjs.org/)                         | JWT and other authentication strategies   |
| [sequelize](http://sequelize.org/)                             | ORM for databases                         |
| [winston](https://github.com/winstonjs/winston)                | Logging                                   |

The above are recommended from my own experience and from various best practice guides. When you can, take some time to read about each of these and its purpose.

Now we can install and configure the development tools.

| Package                        | Purpose                   |
| ------------------------------ | ------------------------- |
| [eslint](https://eslint.org/)  | JS file linting           |
| [jest](https://jestjs.io/)     | Testing                   |
| [nodemon](https://nodemon.io/) | Restart server on changes |

I have prettier installed in my IDE (vs-code), so I have included a config file for this.
