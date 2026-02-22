const passport = require('passport');

/**
 * Requiere usuario logueado (estrategia "current").
 * Si no hay token o es inválido, Passport responde 401.
 */
function requireAuth(req, res, next) {
  passport.authenticate('current', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: 'No autorizado' });
    req.user = user;
    next();
  })(req, res, next);
}

/**
 * Solo administrador. Debe usarse después de requireAuth.
 * Para crear, actualizar y eliminar productos.
 */
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Solo el administrador puede realizar esta acción' });
}

/**
 * Solo usuario (rol 'user'). Debe usarse después de requireAuth.
 * Para agregar productos al carrito (y que el carrito sea el del usuario).
 */
function requireUser(req, res, next) {
  if (req.user && req.user.role === 'user') return next();
  return res.status(403).json({ error: 'Solo el usuario puede agregar productos a su carrito' });
}

/**
 * Requiere que el carrito :cid sea el del usuario logueado.
 * Usar después de requireAuth (y opcionalmente requireUser).
 */
function requireOwnCart(req, res, next) {
  const cid = req.params.cid;
  if (req.user && req.user.cart && String(req.user.cart) === String(cid)) return next();
  return res.status(403).json({ error: 'Solo puedes operar sobre tu propio carrito' });
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireUser,
  requireOwnCart
};
