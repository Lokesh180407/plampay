const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
    console.log('Testing all systems...');

    try {
        const userCount = await prisma.user.count();
        console.log(`✅ DB Connection OK. Current User Count: ${userCount}`);

        const email = 'test' + Date.now() + '@test.com';
        console.log(`👤 Creating test user: ${email}`);

        const hash = await bcrypt.hash('pass123', 10);
        const user = await prisma.user.create({
            data: {
                email: email,
                phone: 'P' + Date.now(),
                passwordHash: hash,
                wallet: { create: { balance: 0 } }
            },
            include: { wallet: true }
        });
        console.log(`✅ User created: ${user.id}`);

        console.log('💰 Adding 1000 testing amount...');
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
