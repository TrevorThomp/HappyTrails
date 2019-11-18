'use strict';

// dotenv Configuration
require('dotenv').config();

// Application Dependencies
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override')
const PORT = process.env.PORT || 3000;

app.use(bodyParser());
app.use(cors());

// Database Connection
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

// Middleware to handle PUT and DELETE
app.use(methodOverride((request, response) => {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    // look in urlencoded POST bodies and delete it
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}))

// View Engine
app.use(express.static('public'));
app.set('view engine', 'ejs');

// API Routes
app.get('/', (request,response) => {
  response.send('Home Page!')
})

// Trail Constructor
function Trail(data) {
  this.id = data.id;
  this.name = data.name;
  this.summary = data.summary;
  this.difficulty = data.difficulty;
  this.stars = data.stars;
  this.imgSmallMed = data.imgSmallMed;
  this.latitude = data.latitude;
  this.longitude = data.longitude;
  this.length = data.length;
  this.conditionStatus = data.conditionStatus;
  this.conditionDetails = data.conditionDetails;
}

// Application Listener
app.listen(PORT, console.log(`Listening on Port: ${PORT}`))
