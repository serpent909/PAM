const express = require('express');
const ResourceBaseAvailabilityChecker = require('./Helpers/resourceBaseAvailabilityCheckerService.js');
const appointments = require('./routes/appointments.js');
const db = require('./Database/db.js');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Read in nurse trialAvailability from JSON file
const nurseAvailability = JSON.parse(
  fs.readFileSync('./Config/nurse_availability.json')
);
const researcherAvailability = JSON.parse(
  fs.readFileSync('./Config/researcher_availability.json')
);
const trialAvailability = JSON.parse(
  fs.readFileSync('./Config/trial_availability.json')
);
const psychologistOneAvailability = JSON.parse(
  fs.readFileSync('./Config/psychologist_1_availability.json')
);
const psychologistTwoAvailability = JSON.parse(
  fs.readFileSync('./Config/psychologist_2_availability.json')
);

db.initializeDatabase()
  .then((database) => {
    const checker = new ResourceBaseAvailabilityChecker(database, db.getPromise);
    console.log('Database initialized');

    app.locals.db = database;
    app.locals.checker = checker;
    app.locals.nurseAvailability = nurseAvailability;
    app.locals.researcherAvailability = researcherAvailability;
    app.locals.trialAvailability = trialAvailability;

    app.use('/appointments', appointments);

    // Get all availability for screening appointments
    TODO:

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).send('Something went wrong');
    });

    // Start the server
    app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });