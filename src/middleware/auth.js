const jwt = require('jsonwebtoken');
const User = require('../models/User');

const jwtSecret = process.env.JWT_SECRET || 'secret';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';

async function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, jwtSecret);
        const user = await User.findById(payload.id).select('-password');
        if (!user) {
            req.user = null;
            return next();
        }
        req.user = user;
        next();
    } catch (err) {
        // on invalid token treat as unauthenticated
        req.user = null;
        next();
    }
}

function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

module.exports = { auth, requireAuth, jwtSecret, jwtExpiresIn };
