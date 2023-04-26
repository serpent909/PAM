const express = require('express');
const { initializeDatabase } = require('./db');
const fs = require('fs');
const SQL = require('sql-template-strings')

const cors = require('cors'); // Import the cors package


const app = express();
const port = 3000;
app.use(cors());
app.use(express.static('public'));

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



// Read in nurse availability from JSON file
const nurseAvailability = JSON.parse(fs.readFileSync('nurse_availability.json'));

initializeDatabase((db) => {
    // Set up middleware to parse JSON in request bodies
    app.use(express.json());

    // Set up API endpoints
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

    // Set up the range of allowed dates for appointments
    const startDate = new Date('2023-05-01');
    const endDate = new Date('2023-08-01');

    app.post('/appointments', async (req, res) => {
        const { participant_id, nurse_id, psychologist_id, researcher_id, appointment_type_id, start_time, end_time } = req.body;

        // Check that the appointment type ID is valid
        if (!Number.isInteger(appointment_type_id) || appointment_type_id < 0 || appointment_type_id > 7) {
            res.status(400).json({ message: 'Invalid appointment type ID.' });
            return;
        }

        // Check that the start and end times are within the allowed times
        
        const allowedStart = new Date(startDate);
        allowedStart.setUTCHours(8, 30, 0, 0);
        const allowedEnd = new Date(endDate);
        allowedEnd.setUTCHours(17, 0, 0, 0);
        const start = new Date(start_time);
        const end = new Date(end_time);

        if (start < allowedStart || end > allowedEnd) {
            res.status(400).json({ message: `Appointments can only be made between ${startDate.toISOString()} and ${endDate.toISOString()}.` });
            return;
        }
        if (start.getUTCDay() === 0 || end.getUTCDay() === 0) {
            res.status(400).json({ message: 'Appointments can only be made on weekdays between 8:30am and 5:00pm, and on Saturdays between 8:30am and 12:00pm.' });
            return;
        }
        if (start.getUTCDay() === 6 && start.getUTCHours() >= 12) {
            res.status(400).json({ message: 'Appointments can only be made on weekdays between 8:30am and 5:00pm, and on Saturdays between 8:30am and 12:00pm.' });
            return;
        }

        // If the appointment type is a screening appointment
        if (appointment_type_id === 0) {
            // Check if the nurse is available
            const nurseSchedule = nurseAvailability.schedule.find(schedule => schedule.day === start.toLocaleDateString('en-US', { weekday: 'long' }));

            console.log(nurseSchedule)

            if (!nurseSchedule) {
                res.status(400).json({ message: 'Nurse is not available during requested time.' });
                return;
            }
            const dayOfWeek = start.getUTCDay();
            const nurseStartTime = new Date(`2023-05-${dayOfWeek < 10 ? '0' : ''}${dayOfWeek}T${nurseSchedule.startTime}:00Z`);
            const nurseEndTime = new Date(`2023-08-${dayOfWeek < 10 ? '0' : ''}${dayOfWeek}T${nurseSchedule.endTime}:00Z`);

            console.log(nurseStartTime)
            console.log(nurseEndTime)
            console.log(start)
            console.log(end)

            // const conflictingAppointment = await db.get(
            //     `SELECT id FROM appointments WHERE nurse_id = ${nurse_id}`
            // );

            // const conflictingAppointment = await db.get(
            //     `SELECT COUNT(*) as count FROM appointments WHERE nurse_id = ?`, [nurse_id]
            //   );

            // console.log(conflictingAppointment.count)

            try {
                const overlappingAppointments = await getPromise(
                  `SELECT COUNT(*) as count FROM appointments WHERE nurse_id = ? AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
                   [nurse_id, end_time, start_time, start_time, end_time], db
                );
          
                // Check if there are any overlapping appointments
                if (overlappingAppointments.count > 0) {
                  console.log(`Found ${overlappingAppointments.count} overlapping appointments with nurse_id ${nurse_id}`);
                  res.status(400).json({ message: 'Nurse already has an appointment at this time' });
                  return
                } else {
                  console.log("No overlapping appointments found with the specified nurse_id");
                }
              } catch (err) {
                console.error('Error while fetching overlapping appointment count:', err);
              }

            //Check nurse schedule
            if (start < nurseStartTime || end > nurseEndTime) {
                res.status(400).json({ message: 'Nurse is not available during requested time.' });
                return;
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
        const sql = 'INSERT INTO appointments (participant_id, nurse_id, psychologist_id, researcher_id, appointment_type_id, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.run(sql, [participant_id, nurse_id, psychologist_id, researcher_id, appointment_type_id, start_time, end_time], function (err) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            } else {
                res.status(201).json({ id: this.lastID });
            }
        });
    });


    // Start the server
    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
    });
});