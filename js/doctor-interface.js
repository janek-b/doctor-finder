var Doctor = require('../js/doctor.js').doctorModule;

function displayDoctorList(doctorList) {
  doctorList.forEach(function(doctor) {
    var education = doctor.education.reduce((acc, ed) => acc + '<dt>'+ed.degree+'</dt><dd>'+ed.school+'</dd>', "");
    var specialties = doctor.specialties.reduce((acc, spec) => acc + ', ' + spec.name, "").slice(2);
    var newPatient;
    if(doctor.practices.filter(practice => (practice.newPatients)).map(practice => practice.newPatients).length > 0) {
      newPatient = '<span class="pull-right label label-success">Accepting new patients</span>';
    } else {
      newPatient = '<span class="pull-right label label-danger">Not accepting new patients</span>';
    };
    $("#doctorList").append(
      '<li class="media">'+
        '<div class="media-left">'+
          '<a href="#">'+
            '<img class="media-object" src="'+doctor.img+'" alt="thumbnail for doctor '+doctor.name+'">'+
          '</a>'+
        '</div>'+
        '<div class="media-body">'+
          '<h4 class="media-heading">'+doctor.name+', '+doctor.title+newPatient+'</h4>'+
          '<p>'+specialties+'</p>'+
          '<dl class="dl-horizontal">'+education+'</dl>'+
        '</div>'+
      '</li>');
  });
}

$(function() {
  $("#findDoctorBtn").click(function() {
    var issue = $("#issue").val();
    $("#issue").val("");
    var location;
    if ($("#locate").is(":checked")) {
      // add browser get location
    } else {
      // add location validation
      location = $("#location").val();
      $("#location").val("");
    }
    var doctorObj = new Doctor();
    doctorObj.findDoctorByIssue(location, issue).done(function(results) {
      displayDoctorList(results);
      console.log(results);
    })

  })
})
