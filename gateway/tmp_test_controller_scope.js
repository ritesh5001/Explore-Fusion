require('dotenv').config({ path: '../.env' });
const { makePostController } = require('./post/controllers/postController');
const mongoose = require('mongoose');

async function testController() {
    console.log('Testing Post Controller Scope...');

    // Mock Post Model
    const MockPost = {
        create: async (data) => {
            console.log('MockPost.create called with:', data.title);
            return {
                ...data,
                _id: new mongoose.Types.ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
                likes: [],
                comments: []
            };
        }
    };

    try {
        const controller = makePostController({ Post: MockPost });

        // Mock Req/Res
        const req = {
            body: {
                title: 'Test Title',
                content: 'Test Content',
                location: 'Test Location'
            },
            user: {
                _id: new mongoose.Types.ObjectId(),
                name: 'Test User'
            }
        };

        const res = {
            status: (code) => {
                console.log('Response Status:', code);
                return {
                    json: (data) => {
                        console.log('Response JSON:', JSON.stringify(data, null, 2));
                        if (!data.success) {
                            console.error('FAILED: Controller returned error response');
                            process.exit(1);
                        }
                    }
                };
            }
        };

        console.log('Calling createPost...');
        await controller.createPost(req, res);
        console.log('SUCCESS: createPost executed without ReferenceError');
        process.exit(0);

    } catch (error) {
        console.error('CRASHED: Controller threw error:', error);
        process.exit(1);
    }
}

testController();
