const summaryService = require('../services/summaryService');

exports.getAttendanceSummary = async (req, res) => {
  const { date } = req.query;
  try {
    const summary = await summaryService.getAttendanceSummary(date);
    res.json(summary);
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
