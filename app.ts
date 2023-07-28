import express, { Application } from 'express';
import bodyParser from 'body-parser';
import userController from './userController';
import organizationUnitController from './organizationUnitController';
import ldapLogin from './ldapLogin';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
const swaggerFile = require('./swagger_output.json');

const app: Application = express();
const port: number = 3000; // Replace with your desired port number

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Swagger Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Mounting the routers
app.use('/api/users', userController); // CRUD APIs for managing users
app.use('/api/organization-units', organizationUnitController); // CRUD APIs for managing organization units
app.use('/auth', ldapLogin); // LDAP login endpoint
app.use('/auth', ldapLogin); // User registration endpoint using LDAP
app.use('/api/groups',organizationUnitController)
// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
