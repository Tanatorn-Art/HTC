const db = require('../db'); 

exports.getDepartments = async () => {
    const result = await db.query( );
      return result.rows;
};