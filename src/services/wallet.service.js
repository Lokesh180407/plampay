const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');

function getSaltRounds() {
  return Number(process.env.BCRYPT_SALT_ROUNDS || 10);
}

async function getWalletByUserId(userId) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: { user: true },
  });
  if (!wallet) {
    const err = new Error('Wallet not found');
    err.statusCode = 404;
    throw err;
  }
  return wallet;
}

async function setPin(userId, pin) {
  if (!pin || pin.length < 4 || pin.length > 6) {
    const err = new Error('PIN must be 4-6 digits');
    err.statusCode = 400;
    throw err;
  }

  const pinHash = await bcrypt.hash(pin, getSaltRounds());
  const wallet = await prisma.wallet.update({
    where: { userId },
    data: { pinHash },
  });
  return wallet;
}

async function verifyPin(userId, pin) {
  const wallet = await getWalletByUserId(userId);
  if (!wallet.pinHash) {
    const err = new Error('PIN not set');
    err.statusCode = 400;
    throw err;
  }

  const isValid = await bcrypt.compare(pin, wallet.pinHash);
  if (!isValid) {
    const err = new Error('Invalid PIN');
    err.statusCode = 401;
    throw err;
  }

  return true;
}

async function getBalance(userId) {
  const wallet = await getWalletByUserId(userId);
  return {
    balance: Number(wallet.balance),
    currency: wallet.currency,
  };
}

async function createTopupOrder(userId, amount) {
  const wallet = await getWalletByUserId(userId);

  if (amount <= 0) {
    const err = new Error('Amount must be greater than 0');
    err.statusCode = 400;
    throw err;
  }

  const transaction = await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      amount,
      type: 'TOPUP',
      status: 'PENDING',
      description: 'Wallet top-up',
    },
  });

  return transaction;
}

async function completeTopup(transactionId, gatewayOrderId, gatewayProvider = 'RAZORPAY') {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { wallet: true },
  });

  if (!transaction) {
    const err = new Error('Transaction not found');
    err.statusCode = 404;
    throw err;
  }

  if (transaction.status !== 'PENDING') {
    const err = new Error('Transaction already processed');
    err.statusCode = 400;
    throw err;
  }

  const newBalance = Number(transaction.wallet.balance) + Number(transaction.amount);

  await prisma.$transaction([
    prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'SUCCESS',
        gatewayProvider,
        gatewayOrderId,
      },
    }),
    prisma.wallet.update({
      where: { id: transaction.walletId },
      data: { balance: newBalance },
    }),
  ]);

  return {
    transactionId,
    newBalance,
  };
}

async function deductBalance(walletId, amount, terminalId, description) {
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
    include: { user: true },
  });

  if (!wallet) {
    const err = new Error('Wallet not found');
    err.statusCode = 404;
    throw err;
  }

  if (wallet.user.kycStatus !== 'APPROVED') {
    const err = new Error('KYC not approved');
    err.statusCode = 403;
    throw err;
  }

  const currentBalance = Number(wallet.balance);
  if (currentBalance < amount) {
    const err = new Error('Insufficient balance');
    err.statusCode = 400;
    throw err;
  }

  const newBalance = currentBalance - amount;

  const transaction = await prisma.$transaction(async (tx) => {
    const updatedWallet = await tx.wallet.update({
      where: { id: walletId },
      data: { balance: newBalance },
    });

    const newTransaction = await tx.transaction.create({
      data: {
        walletId,
        amount,
        type: 'PAYMENT',
        status: 'SUCCESS',
        description,
        terminalId,
      },
    });

    return { transaction: newTransaction, wallet: updatedWallet };
  });

  return transaction;
}

module.exports = {
  getWalletByUserId,
  setPin,
  verifyPin,
  getBalance,
  createTopupOrder,
  completeTopup,
  deductBalance,
};
