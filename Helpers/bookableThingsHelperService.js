const checkIdsInBookableThings = async (db, appointment) => {

    const { participant_id, researcher_id, nurse_id, psychologist_id, room_id } = appointment;
    console.log(appointment, "appointment")
      
    const rows = await db.all('SELECT id, type FROM bookable_things');

    const bookableThingIds = {};
  
    const errors = [];
  
    // Participant
    if (participant_id) {
      const participantIds = await db.all('SELECT id FROM bookable_things WHERE type = "Participant"');
      console.log(participantIds)
      if (!participantIds.map((idObj) => idObj.id).includes(participant_id)) {
        errors.push(`Participant with id ${participant_id} not found in bookable_things.`);
      }
    }
  
    // Researcher
    if (researcher_id) {
      const researcherIds = await db.all('SELECT id FROM bookable_things WHERE type = "Researcher"');
      if (!researcherIds.map((idObj) => idObj.id).includes(researcher_id)) {
        errors.push(`Researcher with id ${researcher_id} not found in bookable_things.`);
      }
    }
  
    // Nurse
    if (nurse_id) {
      const nurseIds = await db.all('SELECT id FROM bookable_things WHERE type = "Nurse"');
      if (!nurseIds.map((idObj) => idObj.id).includes(nurse_id)) {
        errors.push(`Nurse with id ${nurse_id} not found in bookable_things.`);
      }
    }
  
    // Psychologist
    if (psychologist_id) {
      const psychologistIds = await db.all('SELECT id FROM bookable_things WHERE type = "Psychologist"');
      if (!psychologistIds.map((idObj) => idObj.id).includes(psychologist_id)) {
        errors.push(`Psychologist with id ${psychologist_id} not found in bookable_things.`);
      }
    }
  
    // Room
    if (room_id) {
      const roomIds = await db.all('SELECT id FROM bookable_things WHERE type = "Room"');
      if (!roomIds.map((idObj) => idObj.id).includes(room_id)) {
        errors.push(`Room with id ${room_id} not found in bookable_things.`);
      }
    }
  
    return errors;
  };
  
  module.exports = { checkIdsInBookableThings };
  
  