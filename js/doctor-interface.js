var Doctor = require('../js/doctor.js').doctorModule;
var getLatLon = require('../js/location.js').getLatLon;
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

    $("#doctorList").append(`<hr><li class="media-object"><div class="media-object-section middle"><a href="#" class="thumbnail toggle-panel">`+
      `<img src="${doctor.img}" alt="thumbnail for doctor ${doctor.name}"></a></div>`+
      `<div class="media-object-section main-section"><h4>${doctor.name}, ${doctor.title} ${newPatient}</h4>`+
      `<p>${specialties}</p></li>`);

    $('#doctorList .toggle-panel').last().click(function() {
      $("#doctorImg").html(`<img src="${doctor.img}" alt="thumbnail for doctor ${doctor.name}">`);
      $("#doctorName").text(`${doctor.name}, ${doctor.title}`);
      $("#doctorSpec").html(specialties);
      $("#doctorBio").text(doctor.bio);
      $("#doctorEdu").html(education);
      $("#doctorPrac").empty();
      doctor.practices.forEach(function(practice) {
        if (practice.newPatients) {
          var pracNewPatient = '<span class="success radius label">Accepting new patients</span>'
        } else {
          var pracNewPatient = '<span class="alert radius label">Not accepting new patients</span>'
        }
        var phone = practice.phone.reduce((acc, phone) => acc + `<dt>${phone.type}</dt><dd>${phone.number}</dd>`, "");
        $("#doctorPrac").append(`<h4>${practice.name}</h4><h5>${pracNewPatient}</h5><dl class="dl-horizontal">${phone}`+
            `<dt>Address</dt><dd>${practice.address.street} ${practice.address.city}, ${practice.address.state} ${practice.address.zip}</dd></dl>`);
      });
      $("#offCanvas").foundation('toggle');
    });
  });
  resetBtn();
}

function resetBtn() {
  $("#findDoctorBtn").html('<i class="fa fa-search"></i>');
  $("#advFindDoctorBtn").html('<i class="fa fa-search"></i>');
}

function getLocation() {
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
  setTimeout(function() {
    doctorObj.getInsurance().done(results => {
      results.forEach(result => $("#insuranceList").append(`<option value="${result.uid}">${result.name}</option>`));
    })
  }, 500);


  if (navigator.geolocation) {
    localStorage.removeItem("currentLocation");
    var navLocate = getLocation().then(location => {
      localStorage.setItem("currentLocation", location);
      localStorage.setItem("searchLocation", location);
    }).catch(error => {
      localStorage.setItem("currentLocation", "disabled");
      $("#location").attr("placeholder", "Enter address or zipcode");
    })
  } else {
    localStorage.setItem("currentLocation", "disabled");
    $("#location").attr("placeholder", "Enter address or zipcode");
  }

  function processLocation(address) {
    return new Promise((resolve, reject) => {
      if (((localStorage.getItem("currentLocation") === "disabled") && address) || address) {
        getLatLon(address).then(latLng => {
          localStorage.setItem("searchLocation", `${latLng.lat}, ${latLng.lng}`);
          resolve(`${latLng.lat}, ${latLng.lng}`);
        });
      } else if ((localStorage.getItem("currentLocation") === "disabled") && !(address)) {
        // Display error in search field
        reject("enter address field");
        resetBtn();
      } else {
        navLocate.then(() => {
          if (localStorage.getItem("currentLocation") === localStorage.getItem("searchLocation")) {
            resolve(localStorage.getItem("currentLocation"));
          } else {
            getLocation().then(location => resolve(location));
          }
        });
      }
    });
  }

  $("#findDoctorBtn").click(function() {
    $(this).html('<span aria-hidden="true"><i class="fa fa-spinner fa-lg fa-spin"></i></span>');
    var address = $("#location").val();
    var input = $("#input").val();
    $("#input").val("");
    processLocation(address).then(location => {
      doctorObj.findDoctorByIssue(location, input).done(results => displayDoctorList(results));
    });
  });

  $("#advFindDoctorBtn").click(function() {
    $(this).html('<span aria-hidden="true"><i class="fa fa-spinner fa-lg fa-spin"></i></span>');
    var address = $("#advLocation").val();
    var spec = $("#specList").val();
    var insurance = $("#insuranceList").val();
    var gender = $("#genderList").val();
    if (spec) {spec = `specialty_uid=${spec}&`;}
    if (insurance) {insurance = `insurance_uid=${insurance}&`}
    if (gender) {gender = `&gender=${gender}`}
    processLocation(address).then(location => {
      doctorObj.advSearch(location, spec, insurance, gender).done(results => displayDoctorList(results));
    });
  });

})
