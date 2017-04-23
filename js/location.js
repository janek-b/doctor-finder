var mapKey = require('../.env').mapKey;


var getLatLon = function(address) {
  return $.get('https://maps.googleapis.com/maps/api/geocode/json?address='+address+'&key='+mapKey).then(function(response) {
    return response.results[0].geometry.location;
  });
};

exports.getLatLon = getLatLon;
