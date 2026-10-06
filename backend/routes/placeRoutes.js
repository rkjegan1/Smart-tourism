const express = require('express');
const { getPlaces, searchPlaces, getPlaceById } = require('../controllers/placeController');

const router = express.Router();

// IMPORTANT: /search must come before /:id so it isn't treated as an id
router.get('/search', searchPlaces);
router.get('/', getPlaces);
router.get('/:id', getPlaceById);

module.exports = router;
