const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');

function getSaltRounds() {
  return Number(process.env.BCRYPT_SALT_ROUNDS || 10);
}

async function createTerminal({ terminalId, apiKey, merchant, location }) {
  const existing = await prisma.terminal.findUnique({ where: { terminalId } });
  if (existing) {
    const err = new Error('Terminal ID already exists');
    err.statusCode = 400;
    throw err;
  }

  const apiKeyHash = await bcrypt.hash(apiKey, getSaltRounds());

  const terminal = await prisma.terminal.create({
    data: {
      terminalId,
      apiKeyHash,
      merchant,
      location,
    },
  });

  return terminal;
}

module.exports = {
  createTerminal,
};

