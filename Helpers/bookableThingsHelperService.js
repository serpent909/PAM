const validateResourceIds = async (db, bookableThings) => {
  const promises = [];
  for (const thing of bookableThings) {
      if (thing.id) {
          const promise = new Promise((resolve, reject) => {
              db.get('SELECT id FROM bookable_things WHERE type = ? AND id = ?', [thing.type, thing.id], function (err, row) {
                  if (err) {
                      reject(err);
                  } else {
                      resolve(row);
                  }
              });
          });
          promises.push(promise);
      }
  }

  const rows = await Promise.all(promises);

  const errors = [];
  rows.forEach((row, index) => {
      if (!row) {
          errors.push(`Invalid ${bookableThings[index].type} id: ${bookableThings[index].id}`);
      }
  });

  return errors;
};

const getBookableThings = (req) => {
    const { researcher_id, nurse_id, psychologist_id } = req.body;

    return [
        { id: nurse_id, type: "Nurse" },
        { id: researcher_id, type: "Researcher" },
        { id: psychologist_id, type: "Psychologist" },
    ];
}

module.exports = { validateResourceIds, getBookableThings };