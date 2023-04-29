const express = require('express');
const { initializeDatabase } = require('./Database/db.js');
const ResourceBaseAvailabilityChecker = require('./Helpers/resourceBaseAvailabilityCheckerService.js');

const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

// Read in nurse trialAvailability from JSON file
const nurseAvailability = JSON.parse(fs.readFileSync('./Config/nurse_availability.json'));
const researcherAvailability = JSON.parse(fs.readFileSync('./Config/researcher_availability.json'));
const trialAvailability = JSON.parse(fs.readFileSync('./Config/trial_availability.json'));

// Wrapper function for db.get() that returns a Promise
function getPromise(query, params, db) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

initializeDatabase((database) => {
    db = database;
    const checker = new ResourceBaseAvailabilityChecker(db, getPromise);
    console.log("Database initialized")

    //POST appointments endpoint
    app.post('/appointments', async (req, res) => {
        const { participant_id, researcher_id, nurse_id, psychologist_id, room_id, appointment_type_id, start_time, end_time } = req.body;

        // Check that the appointment type ID is valid
        if (!Number.isInteger(appointment_type_id) || appointment_type_id < 0 || appointment_type_id > 7) {
            res.status(400).json({ message: 'Invalid appointment type ID.' });
            return;
        }

        // Check that the start and end times are within the allowed times for the clinic
        const requestedStartTime = new Date(start_time);

        const requestedEndTime = new Date(end_time);

        // Check that the start and end times are within the allowed times
        function isWithinTrialPeriod(requestedStartTime, requestedEndTime, trialAvailability) {
            const dayOfWeek = requestedStartTime.getUTCDay();
            const daySchedule = trialAvailability.schedule.find(schedule => schedule.day === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]);
            if (!daySchedule) {
                return false;
            }

            const startScheduleTime = new Date(`${requestedStartTime.toISOString().slice(0, 10)}T${daySchedule.startTime}Z`);
            const endScheduleTime = new Date(`${requestedStartTime.toISOString().slice(0, 10)}T${daySchedule.endTime}Z`);

            return requestedStartTime >= startScheduleTime && requestedEndTime <= endScheduleTime;
        }

        if (!isWithinTrialPeriod(requestedStartTime, requestedEndTime, trialAvailability)) {
            res.status(400).json({ message: 'Invalid appointment time.' });
            return;
        }

        // If the appointment type is a screening appointment
        if (appointment_type_id === 0) {

            //Nurse logic
            const nurseSchedule = nurseAvailability.schedule.find(schedule => schedule.day === requestedStartTime.toLocaleDateString('en-US', { weekday: 'long' }));
            const researcherSchedule = researcherAvailability.schedule.find(schedule => schedule.day === requestedStartTime.toLocaleDateString('en-US', { weekday: 'long' }));
            console.log(nurseSchedule, "ns")

            const nurseResult = await checker.checkAvailability('Nurse', nurse_id, requestedStartTime, requestedEndTime, nurseSchedule);
            if (!nurseResult.available) {
                res.status(400).json(nurseResult.message)
                return
            }
            const researcherResult = await checker.checkAvailability('Researcher', researcher_id, requestedStartTime, requestedEndTime, researcherSchedule);
            if (!researcherResult.available) {
                res.status(400).json(researcherResult.message)
                return
            }
        }

        // Check if the appointment is a long appointment
        if (appointment_type_id === 1) {
            // Add any additional validation or business logic here for long appointments
            // For example, you could check if the participant has already had a long appointment in the past 30 days, and if so, return an error
            // You could also check if the participant has any conflicting appointments and return an error if necessary
            // This would depend on the requirements of your application
        }

        // Check if the appointment is a regular appointment
        if (appointment_type_id >= 2 && appointment_type_id <= 7) {
            // Add any additional validation or business logic here for regular appointments
            // For example, you could check if the participant has any conflicting appointments and return an error if necessary
            // You could also check if the participant has already had a regular appointment in the past week, and if so, return an error
            // This would depend on the requirements of your application
        }

        // If there are no conflicts, add the appointment to the database
        const sql = 'INSERT INTO appointments (participant_id, researcher_id, nurse_id, psychologist_id, room_id, appointment_type_id, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.run(sql, [participant_id, researcher_id, nurse_id, psychologist_id, room_id, appointment_type_id, start_time, end_time], function (err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE constraint failed')) {
                    console.error('The combination of participant_id and appointment_type_id already exists.');
                    res.status(400).json({ error: 'The combination of participant_id and appointment_type_id already exists.' });
                } else {
                    console.error(err);
                    res.sendStatus(500);
                }
            } else {
                res.status(201).json({ id: this.lastID });
                console.log("Appointment successfully added");
            }
        });
    });
})

//GET booked appointments endpoint
app.get('/appointments', (req, res) => {
    db.all('SELECT * FROM appointments', (err, rows) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        } else {
            res.json(rows);
        }
    });
});

//Get all availability for screening appointments
//TODO


// Start the server
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});






