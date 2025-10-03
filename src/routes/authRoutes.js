const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// signup
router.post('/signup', authController.signup);

// login
router.post('/login', authController.login);

module.exports = router;
