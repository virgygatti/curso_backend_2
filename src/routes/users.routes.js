const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

// GET /api/users - Listar usuarios (sin password)
router.get('/', async (req, res, next) => {
  try {
    const users = await userService.getAll();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:uid
router.get('/:uid', async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.uid);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:uid
router.put('/:uid', async (req, res, next) => {
  try {
    const user = await userService.update(req.params.uid, req.body);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:uid
router.delete('/:uid', async (req, res, next) => {
  try {
    const user = await userService.remove(req.params.uid);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json({ message: 'Usuario eliminado', user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
