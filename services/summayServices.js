const db = require('./db');

exports.getAttendanceSummary = async (date) => {
  const query = 'SELECT * FROM public.tbscantime_person';
  const { rows } = await db.query(query, [date]);
  return rows;
};
