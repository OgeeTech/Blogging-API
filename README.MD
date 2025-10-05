
Blog API


# Features

* User registration and authentication (JWT)
* Create, read, update, and delete blog posts
* Commenting system
* MongoDB database integration
* Validation and error handling
* Unit tests using Jest and Supertest

# Testing the API


# Register a new user

**POST** /api/users/register

json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}


# Login

*POST* /api/users/login

json
{
  "email": "john@example.com",
  "password": "123456"
}

> Copy the returned token for authorization in subsequent requests.

# Create a blog post

**POST** `/api/posts`
*Headers:*
`Authorization: Bearer <token>`

json
{
  "title": "My First Blog Post",
  "content": "This is a sample blog post content."
}


# Get all blog posts

*GET* /api/posts

# Get a single post

*GET* /api/posts/:id

# Update a post

*PUT* /api/posts/:id
*Headers:*
`Authorization: Bearer <token>`

#Delete a post

*DELETE* `/api/posts/:id`
*Headers:*
`Authorization: Bearer <token>`





Server runs on:
http://localhost:5000


# Project Structure

blog/
├── src/
│   ├── config/        
│   ├── controllers/   
│   ├── models/        
│   ├── routes/        
│   ├── middleware/    
│   └── app.js         
├── tests/             
├── server.js          # Entry point
├── .env               
├── .gitignore
├── package.json
└── README.md


## Technologies Used

* Node.js
* Express.js
* MongoDB & Mongoose
* JWT Authentication
* Jest & Supertest
* Render (Deployment)

---

 Author

*Wada Gift (OG Tech)*
 [wgift41@gmail.com](mailto:wgift41@gmail.com)
[GitHub Profile](https://github.com/ogeetech)

