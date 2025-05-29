const db = require('../services/db');
const ExcelJS = require('exceljs');

exports.exportReport = async (req, res) => {
  try {
    const { from, to, department } = req.qwery;

    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    if (from && to) {
      whereClause += ' AND workdate Between $${queryParams.length + 1} AND $${queryParams.length + 2}';
      queryParams.push(from, to);
    }

    if (department) {
      whereClause += ' AND deptcode = $${queryParams.length + 1}';
      queryParams.push(department);
    }

    const result = await db.query(
      'SELECT * FROM vw_attendance_report_export${whereClause} ORDER BY workdate DESC',
      queryParams
    );

    const data = result.rows;

    const workdate = new ExcelJS.Workbook();
    const worksheet = workdate.addWorksheet('Attendance Report');
    worksheet.columns = [
      { header: 'deptcode', key: 'deptcode', width: 15 },
      { header: 'deptname', key: 'deptname', width: 25 },
      { header: 'deptsbu', key: 'deptsbu', width: 15 },
      { header: 'deptstd', key: 'deptstd', width: 15 },
      { header: 'workdate', key: 'workdate', width: 15 },
      { header: 'countscan', key: 'countscan', width: 15 },
      { header: 'countnoscan', key: 'countnoscan', width: 15 },
      { header: 'parentcode', key: 'parentcode', width: 15 },
      { header: 'parentperson', key: 'parentperson', width: 25 },
    ];

    // Format header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold : true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgCllor: { argb: 'FFEEEEEE' },
      };
      cell.alignment = { vertical: 'middle',horizontal: 'center' };
    });

    worksheet.addRows(data);

    res.setHeader('Content-Disposition', 'attachment; filenamr=attendance_report.xlsx');

    await Workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Export Error: ', err);
    res.status(500).json({ error: 'Export failed' });
  }
};