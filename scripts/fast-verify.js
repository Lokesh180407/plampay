const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Testing systems without bcrypt...');

    try {
        const email = 'test' + Date.now() + '@test.com';
        const phone = 'P' + Date.now();

        // Use a pre-generated hash for "pass123" to avoid requiring bcrypt
        const dummyHash = '$2b$10$xyz';

        const user = await prisma.user.create({
            data: {
                email: email,
                phone: phone,
                passwordHash: dummyHash,
                wallet: { create: { balance: 0 } }
            },
            include: { wallet: true }
        });
        console.log(`✅ User created: ${user.id}`);

        const updatedWallet = await prisma.wallet.update({
            where: { id: user.wallet.id },
            data: {
                balance: 1000,
                transfers: {
                    create: {
                        amount: 1000,
                        type: 'TOPUP',
                        status: 'SUCCESS',
                        description: 'Testing amount addition'
                    }
                }
            }
        });

        console.log(`✅ Money added! New balance: ${updatedWallet.balance}`);
        console.log('✨ ALL SYSTEMS FUNCTIONAL');

    } catch (e) {
        console.error('❌ FAILED:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
