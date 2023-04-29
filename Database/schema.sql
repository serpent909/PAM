-- Create the 'appointments' table
CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participant_id INTEGER,
    researcher_id INTEGER,
    nurse_id INTEGER,
    psychologist_id INTEGER,
    room_id INTEGER,
    appointment_type_id INTEGER,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    FOREIGN KEY (participant_id) REFERENCES bookable_things(id),
    FOREIGN KEY (researcher_id) REFERENCES bookable_things(id),
    FOREIGN KEY (nurse_id) REFERENCES bookable_things(id),
    FOREIGN KEY (psychologist_id) REFERENCES bookable_things(id),
    FOREIGN KEY (room_id) REFERENCES bookable_things(id),
    UNIQUE (participant_id, appointment_type_id)
);

-- Create the 'bookable_things' table
CREATE TABLE IF NOT EXISTS bookable_things (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL UNIQUE
);

-- Populate 'bookable_things' with predefined types if they don't exist
INSERT OR IGNORE INTO bookable_things (type) SELECT 'Participant'    WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Participant');
INSERT OR IGNORE INTO bookable_things (type) SELECT 'Researcher'     WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Researcher');
INSERT OR IGNORE INTO bookable_things (type) SELECT 'Nurse'          WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Nurse');
INSERT OR IGNORE INTO bookable_things (type) SELECT 'Psychologist_1' WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist_1');
INSERT OR IGNORE INTO bookable_things (type) SELECT 'Psychologist_2' WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist_2');
INSERT OR IGNORE INTO bookable_things (type) SELECT 'Psychologist_3' WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist_3');
INSERT OR IGNORE INTO bookable_things (type) SELECT 'Psychologist_4' WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist_4');
INSERT OR IGNORE INTO bookable_things (type) SELECT 'Psychologist_5' WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist_5');
INSERT OR IGNORE INTO bookable_things (type) SELECT 'Psychologist_6' WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist_6');
INSERT OR IGNORE INTO bookable_things (type) SELECT 'Psychologist_7' WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist_7');
INSERT OR IGNORE INTO bookable_things (type) SELECT 'Psychologist_8' WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Psychologist_8');
INSERT OR IGNORE INTO bookable_things (type) SELECT 'Room_1'         WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Room_1');
INSERT OR IGNORE INTO bookable_things (type) SELECT 'Room_2'         WHERE NOT EXISTS (SELECT 1 FROM bookable_things WHERE type = 'Room_2');

-- Create the 'booked_times' table
CREATE TABLE IF NOT EXISTS booked_times (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER,
    bookable_thing_id INTEGER,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (bookable_thing_id) REFERENCES bookable_things(id)
);