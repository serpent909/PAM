const express = require('express');
const { initializeDatabase, getPromise } = require('./Database/db.js');
const ResourceBaseAvailabilityChecker = require('./Helpers/resourceBaseAvailabilityCheckerService.js');
const appointments = require('./routes/appointments.js');

const fs = require('fs');
const app = express();
const port = 3000;


app.use(express.static('public'));
app.use(express.json());

// Read in nurse trialAvailability from JSON file
const nurseAvailability = JSON.parse(fs.readFileSync('./Config/nurse_availability.json'));
const researcherAvailability = JSON.parse(fs.readFileSync('./Config/researcher_availability.json'));
const trialAvailability = JSON.parse(fs.readFileSync('./Config/trial_availability.json'));
const psychologistOneAvailability = JSON.parse(fs.readFileSync('./Config/psychologist_1_availability.json'));
const psychologistTwoAvailability = JSON.parse(fs.readFileSync('./Config/psychologist_2_availability.json'))


initializeDatabase((database) => {
    db = database;
    const checker = new ResourceBaseAvailabilityChecker(db, getPromise);
    console.log("Database initialized")

    app.locals.db = db;
    app.locals.checker = checker;
    app.locals.nurseAvailability = nurseAvailability;
    app.locals.researcherAvailability = researcherAvailability;
    app.locals.trialAvailability = trialAvailability;

    app.use('/appointments', appointments);


    //Get all availability for screening appointments
    TODO:

    // Start the server
    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
    });
});