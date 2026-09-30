const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getRecommendations, getMatchDetails } = require('../controllers/matchingController');

router.get('/recommendations', auth, getRecommendations);
router.get('/:id', auth, getMatchDetails);

module.exports = router;