const prisma = require('../config/prisma');

async function getAllUsers(req, res, next) {
    try {
        const users = await prisma.user.findMany({
            include: {
                wallet: {
                    select: {
                        balance: true,
                        currency: true,
                    }
                },
                kyc: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            success: true,
            count: users.length,
            data: users.map(user => {
                const { passwordHash, ...safeUser } = user;
                return safeUser;
            }),
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllUsers,
};
