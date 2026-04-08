require('dotenv').config({ path: '../.env' });
const controller = require('./post/controllers/postController');
const mongoose = require('mongoose');

async function testController() {
    console.log('Testing Post Controller Scope...');

    try {
        const expected = [
            'createPost',
            'getPosts',
            'getPostById',
            'updatePost',
            'deletePost',
            'toggleLike',
            'addComment',
            'getPostsByUser',
            'getPostsCountByUser',
        ];

        const missing = expected.filter((name) => typeof controller[name] !== 'function');
        if (missing.length) {
            console.error('FAILED: Missing controller methods:', missing);
            process.exit(1);
        }

        console.log('SUCCESS: Post controller exports expected methods.');
        process.exit(0);

    } catch (error) {
        console.error('CRASHED: Controller threw error:', error);
        process.exit(1);
    }
}

testController();
