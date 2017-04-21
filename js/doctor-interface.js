var Doctor = require('../js/doctor.js').doctorModule;

function displayDoctorList(doctorList, detailsPanel) {
  doctorList.forEach(function(doctor) {
    var education = doctor.education.reduce((acc, ed) => acc + '<dt>'+ed.degree+'</dt><dd>'+ed.school+'</dd>', "");
    var specialties = doctor.specialties.reduce((acc, spec) => acc + ', ' + spec.name, "").slice(2);
    var newPatient;
    if(doctor.practices.filter(practice => (practice.newPatients)).map(practice => practice.newPatients).length > 0) {
      newPatient = '<span class="label label-success">Accepting new patients</span>';
    } else {
      newPatient = '<span class="label label-danger">Not accepting new patients</span>';
    };
    $("#doctorList").append(
      '<li class="media">'+
        '<div class="media-left">'+
          '<a href="#" class="toggle-panel">'+
            '<img class="media-object" src="'+doctor.img+'" alt="thumbnail for doctor '+doctor.name+'">'+
          '</a>'+
        '</div>'+
        '<div class="media-body">'+
          '<h4 class="media-heading">'+doctor.name+', '+doctor.title+' '+newPatient+'</h4>'+
          '<p>'+specialties+'</p>'+
          '<dl class="dl-horizontal">'+education+'</dl>'+
        '</div>'+
      '</li>');
    $('#doctorList .toggle-panel').last().click(function() {
      $("#doctorImg").html('<img src="'+doctor.img+'" alt="thumbnail for doctor '+doctor.name+'">');
      $("#doctorName").text(doctor.name+', '+ doctor.title);
      $("#doctorSpec").text(specialties);
      $("#doctorBio").text(doctor.bio);
      $("#doctorEdu").html(education);
      detailsPanel.toggle();
    })
  });
}

$(function() {
  var detailsPanel = $('#details-panel').scotchPanel({
    containerSelector: '#doctors',
    direction: 'right',
    duration: 300,
    transition: 'ease',
    clickSelector: '.toggle-panel',
    distanceX: '80%',
    enableEscapeKey: true
  });

  $(".overlay").click(function() {
    detailsPanel.close();
  })

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
      displayDoctorList(results, detailsPanel);
      console.log(results);
    })

  })

})
