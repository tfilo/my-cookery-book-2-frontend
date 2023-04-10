# My cookery book 2 - frontend

Frontend application providing GUI build in React.js. Whole frontend is writen in Typescript.

## Technologies required for development

-   Node.js (>=18)
-   Docker (>=20.10.14)
-   Docker compose (>=2.10.2)

## Development

While development it is required to have Postgres database and Backend running. It can be runned by prepared `docker-compose.yaml` file. This development environment can be started by command:

-   `docker compose up -d`

It will run pgAdmin on port 8082 and database on port 5432 and backend on port 8080 and internal api on port 8081 (not used in frontend).

After database and backend is running, you can start development server by commands:

-   `npm install` (only if you didn't run it before or you modifed package.json file)
-   `npm run generate-openapi` (only if you didn't run it before or backend api was modified)
-   `npm start`

React App will start in development mode on port 3000.

### Usefull links when docker-compose is running and React App started

| Name                            | URL                                     | Description                                                                               |
| ------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------- |
| Backend                         | http://localhost:8080/api               | API                                                                                       |
| Backend Health check            | http://localhost:8080/api/health        | Health check                                                                              |
| Backend Swagger Api             | http://localhost:8080/api/api-docs      | OpenApi 3 documentation                                                                   |
| Backend - internal              | http://localhost:8081/internal          | API (not used in frontend)                                                                |
| Backend Health check - internal | http://localhost:8081/internal/health   | Health check (not used in frontend)                                                       |
| Backend Swagger Api - internal  | http://localhost:8081/internal/api-docs | OpenApi 3 documentation (not used in frontend)                                            |
| pgAdmin                         | http://localhost:8082                   | Database administration. <br />Username: *user@domain.com* <br />Password: *cookery2123*  |
| Frontend                        | http://localhost:3000                   | React GUI. <br />Username: _Test_ <br />Password: *Test1234*                              |

## Building docker image

There is provided Dockerfile and sh script build-image.sh. You can use this script to build docker image.

## License

Project is licensed under [MIT](./LICENSE) License. There are 3rd party libraries which can be part of builded docker images. List of this libraries can be found in [LIBRARIES](./LIBRARIES). Other than that this project use development libraries too. Please look at [package.json](./package.json) if you are interested in complete list of direct dependencies of this project.

## How to update list of used libraries

If added new dependencies, list of used libraries can be updated using this script

./generateLibrariesNotice.sh

WHILE RUNNING IT WILL INSTANLL GLOBALLY license-report LIBRARY
