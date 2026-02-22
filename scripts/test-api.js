/**
 * Pruebas manuales de la API (auth, productos, carrito, compra).
 * Ejecutar con el servidor corriendo: npm run dev (en otra terminal).
 *   node scripts/test-api.js
 */
const BASE = process.env.BASE_URL || 'http://localhost:8080';
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'token';

let cookie = '';
let failed = 0;

async function request(method, path, body = null, useCookie = true) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (useCookie && cookie) opts.headers['Cookie'] = cookie;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0].trim();
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch (_) { data = text; }
  return { status: res.status, data };
}

function ok(status) {
  return status >= 200 && status < 300;
}

function assert(condition, msg) {
  if (!condition) {
    console.log('   FAIL:', msg);
    failed++;
    return false;
  }
  return true;
}

async function main() {
  console.log('Base URL:', BASE);
  console.log('---\n');

  // --- Auth y sesión ---
  console.log('1) Login como admin@test.com');
  let r = await request('POST', '/api/sessions/login', { email: 'admin@test.com', password: '123456' });
  if (!assert(ok(r.status), `Login admin: ${r.status} ${JSON.stringify(r.data)}`)) {
    console.log('   Asegúrate de ejecutar: node scripts/seed-test-users.js');
    process.exit(1);
  }
  console.log('   OK', r.status, '- Usuario:', r.data?.user?.email);

  console.log('\n2) POST /api/products (solo admin)');
  r = await request('POST', '/api/products', {
    title: 'Producto Test',
    description: 'Descripción',
    code: 'CODE-TEST-1',
    price: 100,
    stock: 5,
    category: 'test'
  });
  if (!assert(ok(r.status), `Crear producto: ${r.status}`)) process.exit(1);
  const productId = r.data?.id || r.data?._id;
  console.log('   OK', r.status, '- Producto id:', productId);

  await request('POST', '/api/sessions/logout');
  cookie = '';

  console.log('\n3) Login como user@test.com');
  r = await request('POST', '/api/sessions/login', { email: 'user@test.com', password: '123456' });
  if (!assert(ok(r.status), `Login user: ${r.status}`)) process.exit(1);
  console.log('   OK', r.status);

  console.log('\n4) GET /api/sessions/current (DTO sin datos sensibles)');
  r = await request('GET', '/api/sessions/current');
  if (!assert(ok(r.status), `Current: ${r.status}`)) process.exit(1);
  const cartId = r.data?.cart;
  if (!assert(cartId, 'Usuario sin carrito')) process.exit(1);
  if (!assert(!r.data?.password, 'DTO no debe incluir password')) failed++;
  if (!assert(r.data?.id && r.data?.email && r.data?.first_name != null && r.data?.role, 'DTO debe tener id, email, first_name, role')) failed++;
  const dtoKeys = Object.keys(r.data).filter((k) => !k.startsWith('_') && k !== '__v');
  console.log('   OK', r.status, '- cart:', cartId, '| DTO:', dtoKeys.join(', '));

  console.log('\n5) POST /api/carts/:cid/product/:pid (user, carrito propio)');
  r = await request('POST', `/api/carts/${cartId}/product/${productId}`, null);
  if (!assert(ok(r.status), `Agregar al carrito: ${r.status}`)) process.exit(1);
  console.log('   OK', r.status);

  console.log('\n6) POST /api/carts/:cid/purchase');
  r = await request('POST', `/api/carts/${cartId}/purchase`, null);
  if (!assert(ok(r.status), `Purchase: ${r.status}`)) process.exit(1);
  console.log('   OK', r.status, '| Ticket:', r.data?.ticket?.code, '| amount:', r.data?.ticket?.amount);

  // --- Autorización: sin cookie → 401 ---
  console.log('\n7) POST /api/products sin cookie (esperado 401)');
  cookie = '';
  r = await request('POST', '/api/products', { title: 'X', description: 'X', code: 'X', price: 1, stock: 1, category: 'x' });
  if (r.status === 401) console.log('   OK 401 No autorizado');
  else assert(false, `esperado 401, recibido ${r.status}`);

  console.log('\n8) GET /api/sessions/current sin cookie (esperado 401)');
  r = await request('GET', '/api/sessions/current');
  if (r.status === 401) console.log('   OK 401');
  else assert(false, `esperado 401, recibido ${r.status}`);

  console.log('\n9) POST /api/carts/:cid/purchase sin cookie (esperado 401)');
  r = await request('POST', `/api/carts/${cartId}/purchase`, null);
  if (r.status === 401) console.log('   OK 401');
  else assert(false, `esperado 401, recibido ${r.status}`);

  // --- User no puede crear producto → 403 ---
  console.log('\n10) User intenta POST /api/products (esperado 403)');
  await request('POST', '/api/sessions/login', { email: 'user@test.com', password: '123456' });
  r = await request('POST', '/api/products', { title: 'X', description: 'X', code: 'USER-PROD', price: 1, stock: 1, category: 'x' });
  if (r.status === 403) console.log('   OK 403 Solo administrador');
  else assert(false, `esperado 403, recibido ${r.status}`);

  // --- Admin no puede agregar al carrito → 403 ---
  console.log('\n11) Admin intenta agregar al carrito (esperado 403)');
  r = await request('POST', '/api/sessions/login', { email: 'admin@test.com', password: '123456' });
  r = await request('GET', '/api/sessions/current');
  const adminCartId = r.data?.cart;
  r = await request('POST', `/api/carts/${adminCartId}/product/${productId}`, null);
  if (r.status === 403) console.log('   OK 403 Solo usuario puede agregar al carrito');
  else assert(false, `esperado 403, recibido ${r.status}`);

  // --- User no puede agregar al carrito de otro → 403 ---
  console.log('\n12) User intenta agregar al carrito de otro (esperado 403)');
  r = await request('POST', '/api/carts', null);
  const otherCartId = r.data?.id || r.data?._id;
  r = await request('POST', '/api/sessions/login', { email: 'user@test.com', password: '123456' });
  r = await request('POST', `/api/carts/${otherCartId}/product/${productId}`, null);
  if (r.status === 403) console.log('   OK 403 Solo tu propio carrito');
  else assert(false, `esperado 403, recibido ${r.status}`);

  // --- Rutas públicas: productos ---
  console.log('\n13) GET /api/products (público)');
  r = await request('GET', '/api/products');
  const list = r.data?.payload ?? (Array.isArray(r.data) ? r.data : []);
  if (!assert(ok(r.status) && Array.isArray(list), `GET products: ${r.status}`)) process.exit(1);
  console.log('   OK', r.status, '-', list.length, 'productos');

  console.log('\n14) GET /api/products/:pid (público)');
  r = await request('GET', `/api/products/${productId}`);
  if (!assert(ok(r.status) && r.data?.id, `GET product: ${r.status}`)) process.exit(1);
  console.log('   OK', r.status, '-', r.data?.title);

  // --- Admin: PUT y DELETE producto ---
  console.log('\n15) PUT /api/products/:pid (admin)');
  r = await request('POST', '/api/sessions/login', { email: 'admin@test.com', password: '123456' });
  r = await request('PUT', `/api/products/${productId}`, { title: 'Producto Actualizado', description: 'Desc', code: 'CODE-TEST-1', price: 150, stock: 10, category: 'test' });
  if (!assert(ok(r.status), `PUT product: ${r.status}`)) process.exit(1);
  console.log('   OK', r.status, '- price:', r.data?.price);

  // --- Registro de usuario ---
  console.log('\n16) POST /api/sessions/register');
  cookie = '';
  const newEmail = `test-${Date.now()}@test.com`;
  r = await request('POST', '/api/sessions/register', {
    first_name: 'Nuevo',
    last_name: 'Usuario',
    email: newEmail,
    age: 22,
    password: 'abc123'
  });
  if (!assert(r.status === 201 && r.data?.email === newEmail, `Register: ${r.status}`)) process.exit(1);
  console.log('   OK 201 -', r.data?.email);

  console.log('\n17) Login con credenciales incorrectas (esperado 401)');
  r = await request('POST', '/api/sessions/login', { email: 'user@test.com', password: 'wrong' });
  if (r.status === 401) console.log('   OK 401 Credenciales inválidas');
  else assert(false, `esperado 401, recibido ${r.status}`);

  // --- Stock insuficiente en compra ---
  console.log('\n18) Compra con stock insuficiente (unprocessedIds)');
  r = await request('POST', '/api/sessions/login', { email: 'admin@test.com', password: '123456' });
  r = await request('POST', '/api/products', {
    title: 'Poco Stock',
    description: 'D',
    code: 'CODE-POCO-STOCK',
    price: 50,
    stock: 1,
    category: 'test'
  });
  const pidPocoStock = r.data?.id || r.data?._id;
  r = await request('POST', '/api/sessions/login', { email: 'user@test.com', password: '123456' });
  r = await request('GET', '/api/sessions/current');
  const userCartId = r.data?.cart;
  r = await request('POST', `/api/carts/${userCartId}/product/${pidPocoStock}`, null);
  r = await request('POST', `/api/carts/${userCartId}/product/${pidPocoStock}`, null);
  r = await request('POST', `/api/carts/${userCartId}/purchase`, null);
  if (!assert(ok(r.status), `Purchase con poco stock: ${r.status}`)) process.exit(1);
  const unprocessed = r.data?.unprocessedIds ?? [];
  if (!assert(unprocessed.length > 0, 'unprocessedIds debe incluir el producto sin stock')) process.exit(1);
  console.log('   OK', r.status, '| unprocessedIds:', unprocessed);

  // --- Resumen ---
  console.log('\n---');
  if (failed > 0) {
    console.log(`Pruebas fallidas: ${failed}`);
    process.exit(1);
  }
  console.log('Todas las pruebas pasaron.');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
