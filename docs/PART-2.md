# Part 2 - Docker & Development Setup <!-- omit in toc -->

In one of our initial decisions we chose to use Docker to do our development. We will use it to run our service in and the external dependencies.

Docker is useful for many reasons, primarily it provides us with a consistent environment to work in and is very simple for developers to use. A service or application will be deployed into a production environment that is secured and setup in a very specific way, it is important that we develop against similar standards to avoid random and unknown errors when putting our code into production. Depending on the size of your team or company, you may have a team dedicated to setting up the production environments and keeping them secure, they may also help/manage the release of your code. Ideally, this team would also create the docker files or images you develop against to ensure this consistency.

Docker is also very portable and is code based, embracing the concept of "Infrastructure as Code". Someone can write a `Dockerfile` or a set of Docker Compose files, commit them to `git` and other developers can use these to create an identical environment on almost any platform. The base images (code) is stored in the [Docker Hub](https://hub.docker.com/) and pulled down when the environment is built, meaning the whole setup is a simple small file. ["Infrastructure as Code"](https://en.wikipedia.org/wiki/Infrastructure_as_code), is out of scope for this series, but I highly recommend you look into it especially if you are an aspiring team/technical lead or architect. Have a look at [Chef](https://www.chef.io/), [Puppet](https://puppet.com/), [Ansible](https://www.ansible.com/) and more...

To continue with this part, please ensure you have installed Docker, Docker Compose and they are up to date. Also, if you are unfamiliar with these tools, please have a look at their tutorials and educational materials. It is outside of this blog to go into these in detail.

- [NodeJS & Nodemon](#nodejs--nodemon)
- [Postman](#postman)
- [Database](#database)
- [Done](#done)

## NodeJS & Nodemon

First we will write a base docker compose file that will get a NodeJS v12 image and run our service using `nodemon` as the entry point. Below is the copied `hello_world` example from ExpressJS that has been placed in `app/index.js` to give us something to work with.

```js
const express = require('express')
const app = express()
const port = 2000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
```

We now create the `development.yml` file in `docker` folder, this is where we will write our [Docker Compose](https://docs.docker.com/compose/) code to spin up the images needed for development. Have a look at the hub for [NodeJS images](https://hub.docker.com/_/node), we will simply use a tag to select version 12 and alpine, alpine is simply a small lightweight version. Then reviewing the [docs](https://github.com/nodejs/docker-node/blob/master/README.md#how-to-use-this-image) we will setup the volumes etc.

```yml
version: "3"

services:
  core:
    container_name: core-service
    image: node:12-alpine
    restart: always
    user: node
    working_dir: /opt/core-service
    environment:
      - NODE_ENV: development
    volumes:
      - ../:/opt/core-service
    ports:
      - 2000:2000
    command: "npm run dev"
```

So, with the above we will create a NodeJS 12 lightweight image that will link our code to the `/opt/core-service` directory, expose port `2000` and run the command `npm run dev` when we start it up. We will link out code to `/opt` rather than a `/home` directory because this is most likely where we will put it when deployed, having a specific user own the folder (e.g. `/home/node`) may not be ideal for a production environment.

The `NODE_ENV` variable is set to `development` so our service knows it is running in development and to take certain actions, e.g. log more information.

Port `2000` is chosen to give us a clear starting point and space for other services, e.g. on `2010`. Having a spread of 10 ports for a single service gives us space to scale and test load balancing without having port clashes. This is assuming that we run all our services on the same machine, which may not be the case, better safe than sorry on this.

The command will be added to the `package.json` soon, it will link to nodemon and start our app. We use a command here to make it easy to change in `package.json` rather than one or more Docker files. A command can also be added to `package.json` of `npm run start:dev` to link all the commands and get the images up and running.

Update the package.json scripts section with the three new commands.

```json
"scripts": {
  "dev": "nodemon app/", // What is run inside docker
  "start:dev": "docker-compose -f docker/development.yml up -d",  // Start the development in detached mode (wont see any logs)
  "stop:dev": "docker-compose -f docker/development.yml down", // Stop the development images
  "test": "echo \"Error: no test specified\" && exit 1"
},
```

Now run `npm run start:dev` and see the image being pulled down and spun up. Once done you can run `docker logs -f core-service` to see the logs from the service. To test the API, we will start the postman collection for this service.

## Postman

Feel free to use another API testing service, I use [Postman](https://www.postman.com/) a lot and am used to it. Ideally you should have something that you can parameterize (make variables) of the URL, passwords etc. Setting this up right will be really useful, as this blog does not include a UI, this is the best way to test and validate the code.

Configure the tool to send a GET request to `localhost:2000`, you should get a response back of "Hello World!". While running the logs, change something in the response, watch the service restart and make the call again. You can now see nodemon doing its job inside the docker container.

> Postman config has been added into the `postman` folder. You will see both the collection data and the environment variables.

## Database

We know we will need a database, not immediately, but in the future and we have decided to use PostgreSQL, so we might as well get it now. Add a basic [PostGreSQL](https://hub.docker.com/_/postgres) image to the `docker/development.yml` file and modify. We modify to give us a clear location of the data if we want to do a complete delete and we add some users and databases to get us started.

```yml
db:
  container_name: "core-db"
  image: postgres:13-alpine
  restart: always
  volumes:
    - ../data/postgresql:/opt/data/postgresql
  environment:
    - POSTGRES_DB: core
    - POSTGRES_USER: core-service
    - POSTGRES_PASSWORD: example
    - PGDATA: /opt/data/postgresql/pgdata

adminer:
  container_name: "adminer"
  image: adminer
  restart: always
  ports:
    - 8080:8080
```

We have added `adminer` as a tool to view our database through a web interface, easy to check and edit as we develop. Start/restart the images by running `npm run start:dev`. Once up, have a look at `localhost:8080`. You can now connect to the DB using the basic setup of:

- system: `PostgreSQL`
- server: `db` (this is internal docker network reference)
- user: `core-service`
- password: `example`
- database: `core`

You will also see a large number of files in `data/postgres` of the project. It is sometimes useful to know exactly where your volumes are so you can delete it all to start from scratch. Be sure to add this folder, `data`, to your git ignore.

---

## Done

We have not setup and configured our development environment. We can now make changes to our code and have the development server restart to reflect these. We also have a database setup and ready to use with a simple out of the box UI to manage it if needed. Finally, we have started our API collection for this service.
