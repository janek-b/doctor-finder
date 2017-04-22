var Doctor = require('../js/doctor.js').doctorModule;
var doctorObj = new Doctor();

function displayDoctorList(doctorList, detailsPanel) {
  $("#doctorList").empty();
  doctorList.forEach(function(doctor) {
    var education = doctor.education.reduce((acc, ed) => acc + `<dt>${ed.degree}</dt><dd>${ed.school}</dd>`, "");
    var specialties = doctor.specialties.reduce((acc, spec) => acc + `<span class="label label-default">${spec.name}</span> `, "");
    var newPatient;
    if(doctor.practices.filter(practice => (practice.newPatients)).map(practice => practice.newPatients).length > 0) {
      newPatient = '<span class="label label-success">Accepting new patients</span>';
    } else {
      newPatient = '<span class="label label-danger">Not accepting new patients</span>';
    };

    $("#doctorList").append(`<li class="media"><div class="media-left"><a href="#" class="toggle-panel">`+
      `<img class="media-object" src="${doctor.img}" alt="thumbnail for doctor ${doctor.name}"></a></div>`+
      `<div class="media-body"><h4 class="media-heading">${doctor.name}, ${doctor.title} ${newPatient}</h4>`+
      `<p>${specialties}</p><dl class="dl-horizontal">${education}</dl></div></li>`);

    $('#doctorList .toggle-panel').last().click(function() {
      $("#doctorImg").html(`<img src="${doctor.img}" alt="thumbnail for doctor ${doctor.name}">`);
      $("#doctorName").text(`${doctor.name}, ${doctor.title}`);
      $("#doctorSpec").html(specialties);
      $("#doctorBio").text(doctor.bio);
      $("#doctorEdu").html(education);
      $("#doctorPrac").empty();
      doctor.practices.forEach(function(practice) {
        if (practice.newPatients) {
          var pracNewPatient = '<span class="label label-success">Accepting new patients</span>'
        } else {
          var pracNewPatient = '<span class="label label-danger">Not accepting new patients</span>'
        }
        var phone = practice.phone.reduce((acc, phone) => acc + `<dt>${phone.type}</dt><dd>${phone.number}</dd>`, "");
        $("#doctorPrac").append(`<h4>${practice.name}</h4><h5>${pracNewPatient}</h5><dl class="dl-horizontal">${phone}`+
            `<dt>Address</dt><dd>${practice.address.street} ${practice.address.city}, ${practice.address.state} ${practice.address.zip}</dd></dl>`);
      });
      detailsPanel.toggle();
    });
  });
  resetBtn();
}

var resetBtn = function() {
  $("#findDoctorBtn").html('<span class="glyphicon glyphicon-search"></span>');
  $("#findSpecBtn").html('<span class="glyphicon glyphicon-search"></span>');
}

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

$(function() {
  doctorObj.getSpecs().done(results => {
    results.forEach(result => $("#specList").append(`<option value="${result.uid}">${result.name}</option>`));
  })

  var detailsPanel = $('#details-panel').scotchPanel({
    containerSelector: '#doctors',
    direction: 'right',
    duration: 300,
    transition: 'ease',
    clickSelector: '.toggle-panel',
    distanceY: '80%',
    enableEscapeKey: true
  });

  $(".overlay").click(function() {
    detailsPanel.close();
  })

  $("#findDoctorBtn").click(function() {
    $(this).html('<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>');
    var issue = $("#issue").val();
    $("#issue").val("");
    if (navigator.geolocation) {
      getLocation().then(location => doctorObj.findDoctorByIssue(location, issue).done(results => displayDoctorList(results, detailsPanel)));
    } else {
      // add option to enter location manually
    }
  })

  $("#findSpecBtn").click(function() {
    $(this).html('<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>');
    var spec = $("#specList").val();
    if (navigator.geolocation) {
      getLocation().then(location => doctorObj.findDoctorBySpec(location, spec).done(results => displayDoctorList(results, detailsPanel)));
    } else {
      // add option to enter location manually
    }
  })

})
