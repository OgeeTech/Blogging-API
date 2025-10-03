const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret, jwtExpiresIn } = require('../middleware/auth');

function jwtForUser(user) {
    return jwt.sign({ id: user._id }, jwtSecret, { expiresIn: jwtExpiresIn });
}

exports.signup = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password, bio } = req.body;
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already in use' });

        const user = new User({ first_name, last_name, email, password, bio });
        await user.save();
        const token = jwtForUser(user);
        res.status(201).json({ token, user: { id: user._id, first_name, last_name, email } });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await user.comparePassword(password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwtForUser(user);
        res.json({ token, user: { id: user._id, first_name: user.first_name, last_name: user.last_name, email: user.email } });
    } catch (err) {
        next(err);
    }
};
