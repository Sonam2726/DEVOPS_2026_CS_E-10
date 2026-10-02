const express = require('express');

const router = express.Router();

const auth = require('../middleware/authMiddleware');

const {
  sendRequest,
  updateRequestStatus,
  getMyRequests
} = require('../controllers/requestController');

router.post('/', auth, sendRequest);

router.get('/', auth, getMyRequests);

router.put('/:id/status', auth, updateRequestStatus);

module.exports = router;