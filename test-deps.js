try {
    console.log('Requiring dotenv...');
    require('dotenv').config();
    console.log('Requiring express...');
    require('express');
    console.log('Requiring cors...');
    require('cors');
    console.log('Requiring helmet...');
    require('helmet');
    console.log('Requiring express-rate-limit...');
    require('express-rate-limit');
    console.log('Requiring @prisma/client...');
    require('@prisma/client');
    console.log('Requiring bcryptjs...');
    require('bcryptjs');
    console.log('Requiring joi...');
    require('joi');
    console.log('Requiring jsonwebtoken...');
    require('jsonwebtoken');
    console.log('Requiring morgan...');
    require('morgan');
    console.log('Requiring razorpay...');
    require('razorpay');
    console.log('All major dependencies loaded!');
} catch (err) {
    console.error('Failed to load dependency:', err);
}
