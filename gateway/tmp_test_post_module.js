require('dotenv').config({ path: '../.env' });
const { initPosts } = require('./post/index');
const mongoose = require('mongoose');

async function testStart() {
    console.log('Testing Post Module Init...');
    try {
        const router = await initPosts();
        console.log('Post Module Valid and Initialized!');
        console.log('Router paths:', router.stack.map(r => r.route ? r.route.path : 'middleware'));
        process.exit(0);
    } catch (error) {
        console.error('Post Module Init Failed:', error);
        process.exit(1);
    }
}

testStart();
