const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('\n--- PlamPay Registered Users ---\n');

        const users = await prisma.user.findMany({
            include: {
                wallet: true,
                kyc: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (users.length === 0) {
            console.log('No users found.');
            return;
        }

        console.table(users.map(user => ({
            ID: user.id.substring(0, 8) + '...',
            Email: user.email,
            Phone: user.phone,
            Role: user.role,
            KYC: user.kycStatus,
            Palm: user.palmRegistered ? '✅' : '❌',
            Balance: user.wallet ? `${user.wallet.balance} ${user.wallet.currency}` : 'No Wallet',
            'Joined At': user.createdAt.toLocaleString(),
        })));

        console.log(`\nTotal Users: ${users.length}\n`);

    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
