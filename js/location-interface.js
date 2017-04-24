var mapKey = require('../.env').mapKey;

$(function() {
  $.getScript("http://maps.google.com/maps/api/js?key="+mapKey);
});

function updateMap(locations, mapCenter) {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    scrollwheel: false,
    center: mapCenter
  });

  var markers = locations.map(function(location) {
    var infowindow = new google.maps.InfoWindow({
      content: `<div id="content"><h2 id="firstHeading" class="firstHeading">${location.name}</h2><div class="thumbnail">`+
        `<img src="${location.img}" alt="thumbnail for doctor ${location.name}"></div></div>`+
        `<div id="bodyContent"><h5>${location.nearestLocation.name}</h5><p>${location.nearestLocation.address.street} ${location.nearestLocation.address.city}, ${location.nearestLocation.address.state} ${location.nearestLocation.address.zip}</p></div>`
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
