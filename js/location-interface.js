var mapKey = require('../.env').mapKey;

$(function() {
  $.getScript("http://maps.google.com/maps/api/js?key="+mapKey);
});

function updateMap(locations, mapCenter) {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: mapCenter
  });

  var markers = locations.map(function(location) {
    var infowindow = new google.maps.InfoWindow({
      content: `<h4>${location.name}</h4><h5>${location.nearestLocation.name}</h5><p>${location.nearestLocation.address.street} ${location.nearestLocation.address.city}, ${location.nearestLocation.address.state} ${location.nearestLocation.address.zip}</p>`
    });
    var marker = new google.maps.Marker({
      map: map,
      position: location.nearestLocation.location
    });
    marker.addListener('click', function() {
      infowindow.open(map, marker);
    });
    return marker;
  });

}
