const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

function getSaltRounds() {
  return Number(process.env.BCRYPT_SALT_ROUNDS || 10);
}

function generateToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  };
  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

async function signup({ email, phone, password }) {
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    const err = new Error('Email already registered');
    err.statusCode = 400;
    throw err;
  }
  const existingPhone = await prisma.user.findUnique({ where: { phone } });
  if (existingPhone) {
    const err = new Error('Phone already registered');
    err.statusCode = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, getSaltRounds());

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      wallet: {
        create: {
          balance: 0,
          currency: 'INR',
        },
      },
    },
    include: {
      wallet: true,
    },
  });

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      kycStatus: user.kycStatus,
      palmRegistered: user.palmRegistered,
    },
    token,
  };
}

async function login({ email, phone, password }) {
  let user = null;
  if (email) {
    user = await prisma.user.findUnique({ where: { email } });
  } else if (phone) {
    user = await prisma.user.findUnique({ where: { phone } });
  }

  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      kycStatus: user.kycStatus,
      palmRegistered: user.palmRegistered,
    },
    token,
  };
}

module.exports = {
  signup,
  login,
};

