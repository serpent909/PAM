document.addEventListener('DOMContentLoaded', function() {

  async function fetchAppointments() {
    try {
      const response = await fetch('http://localhost:3000/appointments');
      const appointments = await response.json();
      return appointments;
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  
  async function displayAppointments() {
    const appointments = await fetchAppointments();
    const tableBody = document.getElementById('appointmentsTableBody');
  
    appointments.forEach(appointment => {
      const row = document.createElement('tr');
  
      const idCell = document.createElement('td');
      idCell.textContent = appointment.id;
      row.appendChild(idCell);
  
      const participantIdCell = document.createElement('td');
      participantIdCell.textContent = appointment.participant_id;
      row.appendChild(participantIdCell);
  
      const nurseIdCell = document.createElement('td');
      nurseIdCell.textContent = appointment.nurse_id;
      row.appendChild(nurseIdCell);
  
      const psychologistIdCell = document.createElement('td');
      psychologistIdCell.textContent = appointment.psychologist_id;
      row.appendChild(psychologistIdCell);
  
      const researcherIdCell = document.createElement('td');
      researcherIdCell.textContent = appointment.researcher_id;
      row.appendChild(researcherIdCell);
  
      const appointmentTypeIdCell = document.createElement('td');
      appointmentTypeIdCell.textContent = appointment.appointment_type_id;
      row.appendChild(appointmentTypeIdCell);
  
      const startTimeCell = document.createElement('td');
      startTimeCell.textContent = formatDate(appointment.start_time);
      row.appendChild(startTimeCell);
  
      const endTimeCell = document.createElement('td');
      endTimeCell.textContent = formatDate(appointment.end_time);
      row.appendChild(endTimeCell);
  
      tableBody.appendChild(row);
    });
  }
  
  displayAppointments();
});

