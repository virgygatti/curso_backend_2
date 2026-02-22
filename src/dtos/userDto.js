/**
 * DTO de usuario para respuestas API. No expone password ni datos internos.
 */

/**
 * Usuario para /api/sessions/current y respuestas públicas.
 * Incluye id, email, first_name, last_name, role y cart (id del carrito) para uso en frontend.
 */
function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id || user._id?.toString(),
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    cart: user.cart ? (typeof user.cart === 'string' ? user.cart : user.cart.toString()) : null
  };
}

module.exports = { toPublicUser };
