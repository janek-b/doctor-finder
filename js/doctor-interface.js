var Doctor = require('../js/doctor.js').doctorModule;
var getLatLon = require('../js/location.js').getLatLon;
var getLocation = require('../js/location.js').getLocation;

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

    $("#doctorList").append(`<hr><li class="media-object"><div class="media-object-section middle"><div class="thumbnail toggle-panel">`+
      `<img src="${doctor.img}" alt="thumbnail for doctor ${doctor.name}"></div></div>`+
      `<div class="media-object-section main-section"><h4>${doctor.name}, ${doctor.title} ${newPatient}</h4>`+
      `<p>${specialties}</p></li>`);

    $('#doctorList .toggle-panel').last().click(function() {
      $("#doctorImg").html(`<img src="${doctor.img}" alt="thumbnail for doctor ${doctor.name}">`);
      $("#doctorName").text(`${doctor.name}, ${doctor.title}`);
      $("#doctorSpec").html(specialties);
      $("#doctorBio").text(doctor.bio);

      if (education) {
        $("#doctorEdu").html(education);
      } else {
        $("#doctorEdu").html('<p>No Education Information Availabele</p>');
      }

      $("#doctorLicenses").empty()
      if (doctor.licenses) {
        doctor.licenses.forEach(function(license) {
          var licenseInfo = Object.entries(license).reduce((acc, lice) => acc + `<dt>${lice[0]}</dt><dd>${lice[1]}</dd>`, "");
          $("#doctorLicenses").append(`<dl>${licenseInfo}</dl><hr>`);
        })
      } else {
        $("#doctorLicenses").append('<p>No License Information Available.');
      }

      $("#doctorPrac").empty();
      doctor.practices.forEach(function(practice) {
        if (practice.newPatients) {
          var pracNewPatient = '<span class="success radius label">Accepting new patients</span>'
        } else {
          var pracNewPatient = '<span class="alert radius label">Not accepting new patients</span>'
        }
        var phone = practice.phone.reduce((acc, phone) => acc + `<dt>${phone.type}</dt><dd>${phone.number}</dd>`, "");
        $("#doctorPrac").append(`<h4>${practice.name} ${pracNewPatient}</h4><dl class="dl-horizontal">${phone}`+
            `<dt>Address</dt><dd>${practice.address.street} ${practice.address.city}, ${practice.address.state} ${practice.address.zip}</dd>`+
            `<dt>Distance</dt><dd>${practice.distance.toFixed(2)} miles</dd></dl>`);
      });

      $("#offCanvas").foundation('toggle');
    });
  });
  resetBtn();
}

function resetBtn() {
  $("#findDoctorBtn").html('<i class="fa fa-search"></i>');
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
  }, 1000);

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
        // Display no results found
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
    var spec = $("#specList").val();
    var insurance = $("#insuranceList").val();
    var gender = $("#genderList").val();
    var search = $("#search").val();
    $("#search").val("");
    if (spec) {spec = `specialty_uid=${spec}&`;}
    if (insurance) {insurance = `insurance_uid=${insurance}&`}
    if (gender) {gender = `&gender=${gender}`}
    if (search) {search = `query=${search}&`}
    processLocation(address).then(location => {
      doctorObj.advSearch(location, search, spec, insurance, gender).done(results => displayDoctorList(results));
    });
  });

  $("#advSearchBtn").click(function() {
    $("#basicSearch").toggleClass('top-form');
    $("#advSearch").slideToggle();
    $("#specList").val("");
    $("#insuranceList").val("");
    $("#genderList").val("");
  })

})
