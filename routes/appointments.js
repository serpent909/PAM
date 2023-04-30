const express = require('express');
const router = express.Router();
const { checkIdsInBookableThings } = require('../Helpers/bookableThingsHelperService.js');
const ResourceBaseAvailabilityChecker = require('../Helpers/resourceBaseAvailabilityCheckerService.js');


    //POST appointments endpoint
    router.post('/', async (req, res) => {
        const { participant_id, researcher_id, nurse_id, psychologist_id, room_id, appointment_type_id, start_time, end_time } = req.body;
        const { db, checker, nurseAvailability, researcherAvailability, trialAvailability } = req.app.locals;
        const appointment = req.body;

        // Check that the appointment type ID is valid
        if (!Number.isInteger(appointment_type_id) || appointment_type_id < 0 || appointment_type_id > 7) {
            res.status(400).json({ message: 'Invalid appointment type ID.' });
            return;
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
        }

        // Check if the appointment is a long appointment
        if (appointment_type_id === 1) {

        }

        // Check if the appointment is a regular appointment
        if (appointment_type_id >= 2 && appointment_type_id <= 7) {

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
                const appointmentId = this.lastID;
                const bookableThings = [
                    { id: participant_id, type: "Participant" },
                    { id: nurse_id, type: "Nurse" },
                    { id: researcher_id, type: "Researcher" },
                    { id: psychologist_id, type: "Psychologist" },
                ];

                console.log(bookableThings)
        
                // Insert booked times for each bookable thing
                bookableThings.forEach(thing => {
                    if (thing.id) {
                        const sqlBookedTimes = 'INSERT INTO booked_times (appointment_id, bookable_thing_id, start_time, end_time) VALUES (?, ?, ?, ?)';
                        db.run(sqlBookedTimes, [appointmentId, thing.id, start_time, end_time], function (err) {
                            if (err) {
                                console.error(`Error inserting booked time for ${thing.type}:`, err);
                            } else {
                                console.log(`Booked time for ${thing.type} with ID ${thing.id} added successfully.`);
                            }
                        });
                    }
                });
        
                res.status(201).json({ id: appointmentId });
                console.log("Appointment successfully added");
            }
        });
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