const prisma = require('../config/prisma');

async function uploadKyc(userId, { aadhaarImageUrl, panImageUrl }) {
  const kyc = await prisma.kyc.upsert({
    where: { userId },
    update: {
      aadhaarImageUrl,
      panImageUrl,
      status: 'PENDING',
    },
    create: {
      userId,
      aadhaarImageUrl,
      panImageUrl,
      status: 'PENDING',
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { kycStatus: 'PENDING' },
  });

  return kyc;
}

async function verifyKyc({ userId, decision }) {
  const status = decision === 'approve' ? 'APPROVED' : 'REJECTED';

  const existing = await prisma.kyc.findUnique({ where: { userId } });
  if (!existing) {
    const err = new Error('KYC record not found for user');
    err.statusCode = 404;
    throw err;
  }

  const kyc = await prisma.kyc.update({
    where: { userId },
    data: { status },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { kycStatus: status },
  });

  return kyc;
}

module.exports = {
  uploadKyc,
  verifyKyc,
};

