# _Doctor Finder_

#### _Doctor Finder, 04-21-2017_

#### By _**Janek Brandt**_

## Description
_This website simplifies the process of finding a doctor. A user can enter a medial issue and then receive a list of doctors in their area that can treat that issue. A user can also search for a doctor by their specialties or the insurance they accept._


## Setup/Installation Requirements

* _The application requires an API Key from betterdoctor.com and an API Key for google maps_
* _Place your API key into a `.env` file in the root project directory. The file should contain the following._
```
exports.apiKey = "YOUR_BETTER_DOCTOR_API_KEY";
exports.mapKey = "YOUR_GOOGLE_MAPS_API_KEY"
```
* _Run the following commands to install dependencies and build the application_
```
npm install
bower install
gulp build
gulp serve
```

### License

Copyright (c) 2017 **_Janek Brandt_**

This software is licensed under the MIT license.
