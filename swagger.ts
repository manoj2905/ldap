const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./app.ts"];
const options = {
  language: 'en-US',
  disableLogs: false,
  autoHeaders: true,
  autoQuery: true,
  autoBody: true,
};
const doc = {
  info: {
    title: 'My API',
    description: 'Description',
  },
  host: "trading-api.thefirstock.tech",
  schemes: ["https"],
  // security: {
  //   bearerAuth: {
  //     type: 'http',
  //     scheme: 'bearer',
  //   },
  // },
//   securityDefinitions: {
//     BearerAuth: {
//       type: 'apiKey',
//       name: 'Authorization',
//       in: 'header',
//       description: 'Bearer token authorization',
//     },
//   },
};

swaggerAutogen(outputFile, endpointsFiles, doc,options);
