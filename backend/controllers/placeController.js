const Place = require('../models/Place');

// @route  GET /api/places
// Supports optional pagination via ?page=&limit=
const getPlaces = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const total = await Place.countDocuments();
    const places = await Place.find()
      .sort({ rating: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({ total, page, limit, places });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/places/search?q=&country=&city=
const searchPlaces = async (req, res) => {
  try {
    const { q, country, city } = req.query;
    const filter = {};

    if (country) filter.country = new RegExp(country, 'i');
    if (city) filter.city = new RegExp(city, 'i');
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { city: new RegExp(q, 'i') },
        { country: new RegExp(q, 'i') },
        { tags: new RegExp(q, 'i') },
      ];
    }

    const places = await Place.find(filter).sort({ rating: -1 });
    return res.json({ count: places.length, places });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/places/:id
const getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    return res.json(place);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getPlaces, searchPlaces, getPlaceById };
