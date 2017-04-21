var Doctor = require('../js/doctor.js').doctorModule;

function displayDoctorList(doctorList) {
  doctorList.forEach(function(doctor) {
    let education = "";
    let specialties = "";
    doctor.education.forEach(function(ed) {
      education += '<dt>'+ed.degree+'</dt><dd>'+ed.school+'</dd>';
    });
    doctor.specialties.forEach(function(spec) {
      specialties += ', ' + spec.name;
    });
    $("#doctorList").append(
      '<li class="media">'+
        '<div class="media-left">'+
          '<a href="#">'+
            '<img class="media-object" src="'+doctor.img+'" alt="thumbnail for doctor '+doctor.name+'">'+
          '</a>'+
        '</div>'+
        '<div class="media-body">'+
          '<h4 class="media-heading">'+doctor.name+', '+doctor.title+'</h4>'+
          '<p>'+specialties.slice(2)+'</p>'+
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