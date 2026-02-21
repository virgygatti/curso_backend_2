const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const userService = require('../services/userService');

const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'token';

/**
 * Extractor que obtiene el JWT desde una cookie.
 * Si no hay cookie, retorna null (Passport devolverá 401).
 */
function cookieExtractor(req) {
  if (req && req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  return null;
}

const options = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET || 'secret-dev',
  passReqToCallback: false
};

/**
 * Estrategia "current": extrae el token de la cookie, lo verifica y obtiene el usuario asociado.
 * Si hay token válido → devuelve el usuario (req.user).
 * Si no hay token o es inválido → error de Passport (no autorizado).
 */
passport.use(
  'current',
  new JwtStrategy(options, async (payload, done) => {
    try {
      const user = await userService.findById(payload.sub);
      if (user) return done(null, user);
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);

module.exports = passport;
