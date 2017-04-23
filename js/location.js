var mapKey = require('../.env').mapKey;


var getLatLon = function(address) {
  return $.get('https://maps.googleapis.com/maps/api/geocode/json?address='+address+'&key='+mapKey).then(function(response) {
    return response.results[0].geometry.location;
  });
};

var getLocation = function() {
  var options = {
    enableHighAccuracy: true,
    timeout: 10 * 1000
  };
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(function(position) {
      var location = `${position.coords.latitude}, ${position.coords.longitude}`;
      resolve(location);
    }, function(error) {
      reject(error);
    }, options)
  })
}

exports.getLocation = getLocation;
exports.getLatLon = getLatLon;
