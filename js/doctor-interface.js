var Doctor = require('../js/doctor.js').doctorModule;
var doctorObj = new Doctor();

function displayDoctorList(doctorList) {
  $("#doctorList").empty();
  doctorList.forEach(function(doctor) {
    var education = doctor.education.reduce((acc, ed) => acc + `<dt>${ed.degree}</dt><dd>${ed.school}</dd>`, "");
    var specialties = doctor.specialties.reduce((acc, spec) => acc + `<span class="[round] label">${spec.name}</span> `, "");
    var newPatient;
    if(doctor.practices.filter(practice => (practice.newPatients)).map(practice => practice.newPatients).length > 0) {
      newPatient = '<span class="success radius label">Accepting new patients</span>';
    } else {
      newPatient = '<span class="alert radius label">Not accepting new patients</span>';
    };

    $("#doctorList").append(`<li class="media-object"><div class="media-object-section"><a href="#" class="thumbnail toggle-panel">`+
      `<img src="${doctor.img}" alt="thumbnail for doctor ${doctor.name}"></a></div>`+
      `<div class="media-object-section main-section"><h4>${doctor.name}, ${doctor.title} ${newPatient}</h4>`+
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
      $("#offCanvas").foundation('toggle');
      // detailsPanel.toggle();
    });
  });
  resetBtn();
}

var resetBtn = function() {
  $("#findDoctorBtn").html('<span aria-hidden="true"><i class="fa fa-search" aria-hidden="true"></i></span>');
  $("#findSpecBtn").html('<span aria-hidden="true"><i class="fa fa-search" aria-hidden="true"></i></span>');
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
  $(document).foundation();
  doctorObj.getSpecs().done(results => {
    results.forEach(result => $("#specList").append(`<option value="${result.uid}">${result.name}</option>`));
  })
  //
  // var detailsPanel = $('#details-panel').scotchPanel({
  //   containerSelector: '#doctors',
  //   direction: 'right',
  //   duration: 300,
  //   transition: 'ease',
  //   clickSelector: '.toggle-panel',
  //   distanceY: '80%',
  //   enableEscapeKey: true
  // });

  // $(".overlay").click(function() {
  //   detailsPanel.close();
  // })

  $("#findDoctorBtn").click(function() {
    $(this).html('<span aria-hidden="true"><i class="fa fa-spinner fa-spin"></i></span>');
    var issue = $("#issue").val();
    $("#issue").val("");
    if (navigator.geolocation) {
      getLocation().then(location => doctorObj.findDoctorByIssue(location, issue).done(results => displayDoctorList(results)));
    } else {
      // add option to enter location manually
    }
  })

  $("#findSpecBtn").click(function() {
    $(this).html('<span aria-hidden="true"><i class="fa fa-spinner fa-spin"></i></span>');
    var spec = $("#specList").val();
    if (navigator.geolocation) {
      getLocation().then(location => doctorObj.findDoctorBySpec(location, spec).done(results => displayDoctorList(results)));
    } else {
      // add option to enter location manually
    }
  })

})
