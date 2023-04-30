const addAppointment = (db, req, res) => {
    const { participant_id, researcher_id, nurse_id, psychologist_id, room_id, appointment_type_id, start_time, end_time } = req.body;
  
    const sql = `INSERT INTO appointments (participant_id, researcher_id, nurse_id, psychologist_id, room_id, appointment_type_id, start_time, end_time)
      VALUES (${participant_id}, ${researcher_id}, ${nurse_id}, ${psychologist_id}, ${room_id}, ${appointment_type_id}, '${start_time}', '${end_time}')`;
  
    db.run(sql, function (err) {
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
  };
  
  module.exports = { addAppointment };