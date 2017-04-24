var apiKey = require('../.env').apiKey;

function Doctor() {
}

Doctor.prototype.advSearch = function (location, name, search, spec, insurance, gender) {
  return $.get('https://api.betterdoctor.com/2016-03-01/doctors?' + name + search + spec + insurance + 'location=' + location + '%2C100&user_location=' + location + gender + '&sort=distance-asc&skip=0&limit=10&user_key=' + apiKey).then(function(response) {
    return processResponse(response);
  }).fail(function(error) {
    console.log(error);
  });
};

Doctor.prototype.getSpecs = function () {
  return $.get('https://api.betterdoctor.com/2016-03-01/specialties?user_key=' + apiKey).then(function(response) {
    return response.data.sort(function(a, b) {
      var nameA = a.name.toUpperCase();
      var nameB = b.name.toUpperCase();
      if (nameA < nameB) {return -1;}
      if (nameA > nameB) {return 1;}
      return 0;
    });
  }).fail(function(error) {
    console.log(error);
  });
};

Doctor.prototype.getInsurance = function () {
  return $.get('https://api.betterdoctor.com/2016-03-01/insurances?user_key=' + apiKey).then(function(response) {
    var insurancePlans = [];
    response.data.forEach(provider => {
      var newProvider = {};
      newProvider.name = provider.name;
      newProvider.uid = provider.plans.reduce((acc, plan) => acc + `,${plan.uid}`, "").slice(1);
      insurancePlans.push(newProvider);
    });
    return insurancePlans.sort(function(a, b) {
      var nameA = a.name.toUpperCase();
      var nameB = b.name.toUpperCase();
      if (nameA < nameB) {return -1;}
      if (nameA > nameB) {return 1;}
      return 0;
    });
  }).fail(function(error) {
    console.log(error);
  });
};


var processResponse = function (response) {
  var doctors = [];
  response.data.forEach(doctor => {
    var foundDoctor = {};
    foundDoctor.name = doctor.profile.first_name + " " + doctor.profile.last_name;
    foundDoctor.title = doctor.profile.title;
    foundDoctor.img = doctor.profile.image_url;
    foundDoctor.bio = doctor.profile.bio;
    foundDoctor.specialties = doctor.specialties;
    foundDoctor.education = doctor.educations;
    foundDoctor.licenses = doctor.licenses;
    foundDoctor.practices = doctor.practices.map(practice => {
      var prac = {};
      prac.name = practice.name;
      prac.newPatients = practice.accepts_new_patients;
      prac.location = {lat: practice.lat, lng: practice.lon};
      prac.distance = practice.distance;
      prac.address = practice.visit_address;
      prac.phone = practice.phones;
      return prac;
    }).sort((a, b) => {
      return a.distance - b.distance;
    });
    foundDoctor.nearestLocation = foundDoctor.practices[0];
    doctors.push(foundDoctor);
  });
  return doctors;
};

exports.doctorModule = Doctor;
