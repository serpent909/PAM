const express = require('express');
const router = express.Router();
const { validateResourceIds } = require('../Helpers/bookableThingsHelperService.js');
const { getBookableThings } = require('../Helpers/bookableThingsHelperService.js');
const { addAppointment } = require('../Modules/appointments-dao.js');

const ResourceBaseAvailabilityChecker = require('../Helpers/resourceBaseAvailabilityCheckerService.js');

// Validate ids of resources before processing appointment



//POST appointments endpoint
router.post('/', async (req, res) => {
    const { participant_id, researcher_id, nurse_id, psychologist_id, room_id, appointment_type_id, start_time, end_time } = req.body;
    const { db, checker, nurseAvailability, researcherAvailability, trialAvailability } = req.app.locals;

    // Check that the ids of the resources are valid
    const bookableThings = getBookableThings(req);
    const errors = await validateResourceIds(db, bookableThings);

    if (errors.length > 0) {
        res.status(400).json({ message: errors });
        return
    }

    // Check that the start and end times are within the allowed times for the clinic
    const requestedStartTime = new Date(start_time);
    const requestedEndTime = new Date(end_time);

    if (!ResourceBaseAvailabilityChecker.isWithinTrialPeriod(requestedStartTime, requestedEndTime, trialAvailability)) {
        res.status(400).json({ message: 'Invalid appointment time.' });
        return;
    }

    //Find resource base availability for the requested appointment day
    const nurseSchedule = nurseAvailability.schedule.find(schedule => schedule.day === requestedStartTime.toLocaleDateString('en-US', { weekday: 'long' }));
    const researcherSchedule = researcherAvailability.schedule.find(schedule => schedule.day === requestedStartTime.toLocaleDateString('en-US', { weekday: 'long' }));

    // If the appointment type is a screening appointment
    if (appointment_type_id === 0) {

        const nurseResult = await checker.checkAvailability('Nurse', requestedStartTime, requestedEndTime, nurseSchedule);
        if (!nurseResult.available) {
            res.status(400).json(nurseResult.message)
            return
        }
        const researcherResult = await checker.checkAvailability('Researcher', requestedStartTime, requestedEndTime, researcherSchedule);
        if (!researcherResult.available) {
            res.status(400).json(researcherResult.message)
            return
        }

        addAppointment(db, req, res);

    }

    // Check if the appointment is a long appointment
    if (appointment_type_id === 1) {

    }

    // Check if the appointment is a regular appointment
    if (appointment_type_id >= 2 && appointment_type_id <= 7) {

    }
});

router.get('/', (req, res) => {
    const db = req.app.locals.db;

    db.all('SELECT * FROM appointments', (err, rows) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        } else {
            res.json(rows);
        }
    });
});


module.exports = router;