const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // Assuming your Express app is exported from '../app'

let token;
let blogId;

// Increase timeout to ensure MongoDB connection and initial user creation/login completes
beforeAll(async () => {
    const uri = "mongodb://127.0.0.1:27017/blog_test"; // local Mongo test DB

    // 1. Removed deprecated options, added serverSelectionTimeoutMS for safety
    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 20000, // MongoDB driver timeout for connection attempt
    });

    // create user & login
    const signup = await request(app).post('/api/auth/signup').send({
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com',
        password: 'secret'
    });

    // Added a check to ensure signup was successful before proceeding
    if (signup.statusCode !== 201) {
        throw new Error(`Signup failed with status ${signup.statusCode}. Body: ${JSON.stringify(signup.body)}`);
    }

    token = signup.body.token;
}, 60000); // Increased Jest timeout to 60 seconds

afterAll(async () => {
    // 2. Added defensive check to prevent "Cannot read properties of undefined (reading 'dropDatabase')"
    if (mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
    }
    await mongoose.disconnect();
}, 60000); // Increased Jest timeout to 60 seconds

describe('Blogs', () => {
    test('create blog (draft) and publish, read increments', async () => {
        const createRes = await request(app)
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Test Blog',
                body: 'This is a test blog body with some text to compute reading time.',
                tags: ['test', 'sample']
            });
        expect(createRes.statusCode).toBe(201);
        expect(createRes.body.state).toBe('draft');
        blogId = createRes.body._id;

        // publish
        const publish = await request(app)
            .patch(`/api/blogs/${blogId}/publish`)
            .set('Authorization', `Bearer ${token}`)
            .send();
        expect(publish.statusCode).toBe(200);
        expect(publish.body.state).toBe('published');

        // view published increments read_count
        const view1 = await request(app).get(`/api/blogs/${blogId}`);
        expect(view1.statusCode).toBe(200);
        expect(view1.body.read_count).toBe(1);

        const view2 = await request(app).get(`/api/blogs/${blogId}`);
        expect(view2.body.read_count).toBe(2);
    }, 60000);

    test('owner can update and delete', async () => {
        const update = await request(app)
            .patch(`/api/blogs/${blogId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Updated title' });
        expect(update.statusCode).toBe(200);
        expect(update.body.title).toBe('Updated title');

        const del = await request(app)
            .delete(`/api/blogs/${blogId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(del.statusCode).toBe(200);
        expect(del.body.success).toBe(true);
    });
});