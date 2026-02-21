const express = require('express');
const passport = require('passport');
const router = express.Router();
const sessionsController = require('../controllers/sessions.controller');

// POST /api/sessions/register
router.post('/register', sessionsController.register);

// POST /api/sessions/login
router.post('/login', sessionsController.login);

// GET /api/sessions/current - valida usuario logueado (cookie JWT) y devuelve datos asociados al JWT
router.get('/current', passport.authenticate('current', { session: false }), sessionsController.current);

// POST /api/sessions/logout
router.post('/logout', sessionsController.logout);

module.exports = router;
