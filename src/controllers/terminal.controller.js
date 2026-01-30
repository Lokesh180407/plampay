const terminalService = require('../services/terminal.service');

async function create(req, res, next) {
  try {
    const { terminal_id: terminalId, api_key: apiKey, merchant, location } = req.body;
    const terminal = await terminalService.createTerminal({
      terminalId,
      apiKey,
      merchant,
      location,
    });
    res.status(201).json({
      success: true,
      data: {
        id: terminal.id,
        terminalId: terminal.terminalId,
        merchant: terminal.merchant,
        location: terminal.location,
        active: terminal.active,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
};

