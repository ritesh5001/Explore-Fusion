require('dotenv').config({ path: '../.env' });
const postRoutes = require('./post/routes/postRoutes');

async function testStart() {
    console.log('Testing Post Routes Module...');
    try {
        const router = postRoutes;
        console.log('Post Routes Module Valid!');
        console.log('Router paths:', router.stack.map(r => r.route ? r.route.path : 'middleware'));
        process.exit(0);
    } catch (error) {
        console.error('Post Routes Module Failed:', error);
        process.exit(1);
    }
}

testStart();
