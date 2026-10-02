const express = require('express');

const router = express.Router();

const auth = require('../middleware/authMiddleware');

const {
  createSession,
  getMySessions,
  updateSession
} = require('../controllers/sessionController');

router.post('/', auth, createSession);

router.get('/', auth, getMySessions);

router.put('/:id', auth, updateSession);

module.exports = router;