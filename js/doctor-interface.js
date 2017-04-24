var Doctor = require('../js/doctor.js').doctorModule;
var getLatLon = require('../js/location.js').getLatLon;
var getLocation = require('../js/location.js').getLocation;

var doctorObj = new Doctor();

function displayDoctorList(doctorList) {
  $("#doctorList").empty();
  if (doctorList.length === 0) {
    $("#doctorList").append("<h2 class='subheader text-center'>No Results Found</h2>");
  }
  doctorList.forEach(function(doctor) {
    var education = doctor.education.reduce((acc, ed) => acc + `<dt>${ed.degree}</dt><dd>${ed.school}</dd>`, "");
    var specialties = doctor.specialties.reduce((acc, spec) => acc + `<span class="[round] label">${spec.name}</span> `, "");
    var newPatient;
    if(doctor.practices.filter(practice => (practice.newPatients)).map(practice => practice.newPatients).length > 0) {
      newPatient = '<span class="success radius label">Accepting new patients</span>';
    } else {
      newPatient = '<span class="alert radius label">Not accepting new patients</span>';
    }

    $("#doctorList").append(`<div class="card card-shadow toggle-panel">`+
      `<div class="card-section float-left">`+
        `<div class="thumbnail">`+
          `<img src="${doctor.img}" alt="thumbnail for doctor ${doctor.name}">`+
      `</div></div>`+
      `<div class="card-section float-center">`+
        `<h4>${doctor.name}, ${doctor.title} ${newPatient}</h4>`+
        `<p>${specialties}</p>`+
      `</div></div>`);

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

      $("#doctorLicenses").empty();
      if (doctor.licenses) {
        doctor.licenses.forEach(function(license) {
          var licenseInfo = Object.entries(license).reduce((acc, licenseField) => {
            return acc + `<dt class="text-capitalize">${licenseField[0].replace(/_/g, ' ')}</dt><dd>${licenseField[1]}</dd>`;
          }, "");
          $("#doctorLicenses").append(`<dl>${licenseInfo}</dl><hr>`);
        });
      } else {
        $("#doctorLicenses").append('<p>No License Information Available.');
      }

      $("#doctorPrac").empty();
      doctor.practices.forEach(function(practice) {
        var pracNewPatient;
        if (practice.newPatients) {
          pracNewPatient = '<span class="success radius label">Accepting new patients</span>';
        } else {
          pracNewPatient = '<span class="alert radius label">Not accepting new patients</span>';
        }
        var phoneInfo = practice.phone.reduce((acc, phone) => {
            return acc + `<dt class="text-capitalize">${phone.type.replace(/_/g, ' ')}</dt><dd>${phone.number.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}</dd>`;
          }, "");

        $("#doctorPrac").append(`<h4>${practice.name} ${pracNewPatient}</h4><dl class="dl-horizontal">${phoneInfo}`+
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
  });
  // timeout needed to prevent too many request api error
  setTimeout(function() {
    doctorObj.getInsurance().done(results => {
      results.forEach(result => $("#insuranceList").append(`<option value="${result.uid}">${result.name}</option>`));
    });
  }, 1000);

  if (navigator.geolocation) {
    localStorage.removeItem("currentLocation");
    var navLocate = getLocation().then(location => {
      localStorage.setItem("currentLocation", location);
      localStorage.setItem("searchLocation", location);
    }).catch(error => {
      localStorage.setItem("currentLocation", "disabled");
      $("#location").attr("placeholder", "Enter address or zipcode");
    });
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
        reject("Location field required");
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
    $("#missingLocation").foundation('hide');
    $(this).html('<span aria-hidden="true"><i class="fa fa-spinner fa-lg fa-spin"></i></span>');

    var address = $("#location").val();
    var spec = $("#specList").val();
    var insurance = $("#insuranceList").val();
    var gender = $("#genderList").val();
    var search = $("#search").val();
    $("#search").val("");
    var name = $("#name").val();
    $("#name").val("");

    if (spec) {spec = `specialty_uid=${spec}&`;}
    if (insurance) {insurance = `insurance_uid=${insurance}&`;}
    if (gender) {gender = `&gender=${gender}`;}
    if (search) {search = `query=${search}&`;}
    if (name) {name = `name=${name}&`;}

    processLocation(address).then(location => {
      doctorObj.advSearch(location, name, search, spec, insurance, gender).done(results => {
        var locationSplit = location.split(', ');
        var mapCenter = {lat: parseFloat(locationSplit[0]), lng: parseFloat(locationSplit[1])}
        updateMap(results, mapCenter);
        $("#mapCard").show();
        displayDoctorList(results);
      });
    }).catch(error => {
      console.log(error);
      resetBtn();
      $("#missingLocation").foundation('show');
    });
  });

  $("#advSearchBtn").click(function() {
    $(this).children().toggleClass("down");
    $("#basicSearch").toggleClass('top-form');
    $("#advSearch").slideToggle();
    $("#specList").val("");
    $("#insuranceList").val("");
    $("#genderList").val("");
  });

});
