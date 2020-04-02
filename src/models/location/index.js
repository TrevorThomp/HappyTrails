'use strict';

function Location(query, data) {
  this.search_query = query;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}

module.exports = Location;