var apiKey = require('../.env').apiKey;

function Doctor() {
}

Doctor.prototype.findDoctorByIssue = function (location, issue) {
  return $.get('https://api.betterdoctor.com/2016-03-01/doctors?query=' + issue + '&location=' + location + '%2C100&user_location=' + location + '&skip=0&limit=10&user_key=' + apiKey).then(function(response) {
    var doctors = [];
    response.data.forEach(doctor => {
      var foundDoctor = {};
      foundDoctor.name = doctor.profile.first_name + " " + doctor.profile.last_name;
      foundDoctor.title = doctor.profile.title;
      foundDoctor.img = doctor.profile.image_url;
      foundDoctor.bio = doctor.profile.bio;
      foundDoctor.specialties = doctor.specialties;
      foundDoctor.education = doctor.educations;
      foundDoctor.practices = doctor.practices;
      doctors.push(foundDoctor);
    })
    return doctors;
  }).fail(function(error) {
    console.log(error);
  });
};

exports.doctorModule = Doctor;
