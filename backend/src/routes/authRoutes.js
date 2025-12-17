const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        // Generate JWT
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        // Redirect to frontend with token
        // Adjust logic to match where frontend auth listener expects it
        // Often passed via query param or cookie. 
        // Here we'll pass via query param to a frontend 'auth-success' page or just dashboard
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/success?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    }
);

module.exports = router;
