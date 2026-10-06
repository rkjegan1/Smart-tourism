const express = require('express');
const { getRecommendation } = require('../controllers/recommendationController');

const router = express.Router();

// Open to guests; if a valid token is sent, questionnaire is linked to the user (optional, non-blocking)
router.post('/', getRecommendation);

module.exports = router;
