const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

async function verifyTerminal(req, res, next) {
  try {
    const terminalId = req.body.terminal_id || req.headers['x-terminal-id'];
    const apiKey = req.body.api_key || req.headers['x-api-key'];

    if (!terminalId || !apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Terminal authentication required',
      });
    }

    const terminal = await prisma.terminal.findUnique({
      where: { terminalId },
    });
    if (!terminal || !terminal.active) {
      return res.status(401).json({ success: false, message: 'Invalid terminal' });
    }

    const isValid = await bcrypt.compare(apiKey, terminal.apiKeyHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid terminal api key' });
    }

    req.terminal = terminal;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  verifyTerminal,
};

