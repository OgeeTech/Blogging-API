const request = require('supertest');
const app = require('../app'); // adjust path to your app

let token;
let blogId;

// Increase the hook timeout to 15 seconds (15000 ms) to allow the API call
// to resolve, especially if it relies on a slow or initializing database.
beforeAll(async () => {
    // Replace with valid credentials for your app
    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'testuser@example.com',
            password: 'password123'
        });

    // Add a check to prevent tests from running if login failed (status code not 200)
    if (loginRes.statusCode !== 200) {
        throw new Error(`Login failed with status ${loginRes.statusCode}. Check if user exists and server is connected to DB.`);
    }

    token = loginRes.body.token;
}, 15000); // 👈 INCREASED JEST TIMEOUT

describe('Blogs', () => {
    test('create blog (draft) and publish, read increments', async () => {
        const createRes = await request(app)
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Test Blog',
                description: 'This is a short description.',
                body: 'This is a test blog body with some text.',
                tags: ['test', 'sample']
            });

        expect(createRes.statusCode).toBe(201);
        expect(createRes.body.state).toBe('draft');
        blogId = createRes.body._id;

        const publish = await request(app)
            .patch(`/api/blogs/${blogId}/publish`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(publish.statusCode).toBe(200);
        expect(publish.body.state).toBe('published');

        const view1 = await request(app).get(`/api/blogs/${blogId}`);
        expect(view1.body.read_count).toBe(1);

        const view2 = await request(app).get(`/api/blogs/${blogId}`);
        expect(view2.body.read_count).toBe(2);
    }, 15000); // 👈 Also increase test timeout just in case

    test('owner can update and delete', async () => {
        const update = await request(app)
            .patch(`/api/blogs/${blogId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Updated title',
                description: 'Updated description'
            });

        expect(update.statusCode).toBe(200);
        expect(update.body.title).toBe('Updated title');

        const del = await request(app)
            .delete(`/api/blogs/${blogId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(del.statusCode).toBe(200);
        expect(del.body.success).toBe(true);
    });
});

