const express = require('express');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const expressHandlebars = require('express-handlebars');
const path = require('path');
const productsRouter = require('./routes/products.routes');
const cartsRouter = require('./routes/carts.routes');
const viewsRouter = require('./routes/views.routes');
const sessionsRouter = require('./routes/sessions.routes');
const usersRouter = require('./routes/users.routes');

require('./config/passport.config');

const app = express();

// Cookie parser (para extractor de JWT en estrategia "current")
app.use(cookieParser());
app.use(passport.initialize());

// Motor de plantillas Handlebars
app.engine('handlebars', expressHandlebars.engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, '../views/layouts'),
  partialsDir: path.join(__dirname, '../views/partials')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../views'));

// Middleware para parsear JSON
app.use(express.json());

// Middleware para parsear URL encoded
app.use(express.urlencoded({ extended: true }));

// Rutas de vistas (index y realtimeproducts)
app.use('/', viewsRouter);

// Rutas API
app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
