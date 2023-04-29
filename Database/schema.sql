CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY,
  participant_id INTEGER NOT NULL,
  nurse_id INTEGER NOT NULL,
  psychologist_id INTEGER NOT NULL,
  researcher_id INTEGER NOT NULL,
  appointment_type_id INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  FOREIGN KEY (participant_id) REFERENCES participants (id),
  FOREIGN KEY (nurse_id) REFERENCES nurses (id),
  FOREIGN KEY (psychologist_id) REFERENCES psychologists (id),
  FOREIGN KEY (researcher_id) REFERENCES researchers (id),
  FOREIGN KEY (appointment_type_id) REFERENCES appointment_types (id)
);

CREATE TABLE IF NOT EXISTS appointment_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS nurses (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS psychologists (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS researchers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);