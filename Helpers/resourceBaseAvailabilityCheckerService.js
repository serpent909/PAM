class ResourceBaseAvailabilityChecker {
    constructor(db, getPromise) {
        this.db = db;
        this.getPromise = getPromise;
    }

    async checkAvailability(resourceType, requestedStartTime, requestedEndTime, resourceSchedule) {

        try {

            if (!resourceSchedule) {
                return { available: false, message: `${resourceType} is not available during requested time.` };
            }
            
            const resourceAvailabilityStart = new Date(`${requestedStartTime.toISOString().slice(0, 10)}T${resourceSchedule.startTime}Z`);
            const resourceAvailabilityEnd = new Date(`${requestedEndTime.toISOString().slice(0, 10)}T${resourceSchedule.endTime}Z`);

            if (requestedStartTime < resourceAvailabilityStart || requestedEndTime > resourceAvailabilityEnd) {
                return { available: false, message: `${resourceType} is not available during requested time.` };
            }

            const overlappingAppointments = await this.getPromise(
                
                `SELECT COUNT(*) as count FROM appointments WHERE ${resourceType.toLowerCase()}_id AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
                [requestedEndTime.toISOString(), requestedStartTime.toISOString(), requestedStartTime.toISOString(), requestedEndTime.toISOString()], this.db

            );

            if (overlappingAppointments.count > 0) {
                return { available: false, message: `${resourceType} already has an appointment at this time start_time`};
            }

            return { available: true };
        } catch (err) {
            console.error('Error while checking resource availability:', err);
            throw err;
        }
    }
}

module.exports = ResourceBaseAvailabilityChecker;