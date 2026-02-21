const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-dev';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '24h';
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'token';
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24h

/**
 * POST /api/sessions/register
 * Registro de usuario. Password se hashea con bcrypt (hashSync). Crea carrito vacío.
 */
async function register(req, res, next) {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || !email || !age || password === undefined) {
      return res.status(400).json({ error: 'Faltan campos: first_name, last_name, email, age, password' });
    }
    const result = await userService.register(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(201).json(result.user);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/sessions/login
 * Login con email y password. Compara con bcrypt (compareSync). Devuelve JWT en cookie y datos del usuario.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos' });
    }
    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.cookie(COOKIE_NAME, token, { httpOnly: true, maxAge: COOKIE_MAX_AGE });
    const { password: _, ...userData } = user;
    res.status(200).json({ user: { ...userData, id: user._id.toString() } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/sessions/current
 * Valida al usuario logueado (cookie con JWT) y devuelve sus datos asociados al JWT.
 * Protegido por estrategia Passport "current". Si no hay token o es inválido → 401.
 */
async function current(req, res, next) {
  try {
    res.status(200).json(req.user);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/sessions/logout
 * Limpia la cookie del token.
 */
async function logout(req, res, next) {
  try {
    res.clearCookie(COOKIE_NAME);
    res.status(200).json({ message: 'Sesión cerrada' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  current,
  logout
};
