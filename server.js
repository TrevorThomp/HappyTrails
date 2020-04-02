'use strict';

// dotenv Configuration
require('dotenv').config();

// Application Dependencies
const express = require('express');
const app = express();
const cors = require('cors');
const pg = require('pg');
const methodOverride = require('method-override');
const morgan = require('morgan');
const PORT = process.env.PORT || 3000;

const locationRouter = require('./src/routes/locationRoute')
const trailRouter = require('./src/routes/trailRoutes')

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

// Database Connection
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

// Middleware to handle PUT and DELETE
app.use(methodOverride((request, response) => {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}))

// View Engine
app.use('/public', express.static('public'));
app.set('view engine', 'ejs');

app.use(locationRouter);
app.use(trailRouter);

// Home Page and About Us routes
app.get('/', function homePage(request,response) {
  response.render('index');
})

app.get('/about', function aboutHandler(request,response) {
  response.render('pages/about');
});

// Application Listener
app.listen(PORT, console.log(`Listening on Port: ${PORT}`))
