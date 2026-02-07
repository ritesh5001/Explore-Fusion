const BASE_URL = 'http://localhost:5050/api/v1';

async function test() {
    try {
        const email = `testuser${Date.now()}@example.com`;
        const password = 'password123';

        // 0. Register
        console.log(`Registering user ${email}...`);
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test User', email, password })
        });
        const regData = await regRes.json();
        if (!regData.success) {
            // If already exists, ignore
            console.log('Registration skipped (might exist)');
        } else {
            console.log('Registered successfully');
        }

        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        if (!loginData.success) throw new Error(loginData.message || 'Login failed');

        // Auth might return { success: true, token: ... } or { success: true, data: { token: ... } }
        const token = loginData.token || (loginData.data && loginData.data.token);

        if (!token) {
            console.log('Login response structure:', JSON.stringify(loginData, null, 2));
            throw new Error('Token missing from login response');
        }

        console.log('Logged in, token:', token.substring(0, 10) + '...');

        // 2. Create Post
        console.log('Creating post...');
        const createRes = await fetch(`${BASE_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'Db Refactor Test',
                content: 'This post confirms DB refactor works',
                location: 'Backend Verified'
            })
        });
        const createData = await createRes.json();
        if (!createData.success) throw new Error('Create failed: ' + JSON.stringify(createData));

        console.log('Post created:', createData.data._id);
        const postId = createData.data._id;

        // 3. Get Posts
        console.log('Fetching posts...');
        const getRes = await fetch(`${BASE_URL}/posts`);
        const getData = await getRes.json();
        const posts = getData.data.posts;
        const myPost = posts.find(p => p._id === postId);

        if (myPost) {
            console.log('Found my post!');
            console.log('Content:', myPost.content);
            console.log('Location:', myPost.location);
            if (myPost.content === 'This post confirms DB refactor works') {
                console.log('SUCCESS: Content matches!');
            } else {
                console.log('FAILURE: Content mismatch');
            }
        } else {
            console.log('FAILURE: Post not found in list');
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

test();
