const Place = require('../models/Place');

// @route  POST /api/admin/places
const createPlace = async (req, res) => {
  try {
    const place = await Place.create(req.body);
    return res.status(201).json(place);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// @route  PUT /api/admin/places/:id
const updatePlace = async (req, res) => {
  try {
    const place = await Place.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!place) return res.status(404).json({ message: 'Place not found' });
    return res.json(place);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// @route  DELETE /api/admin/places/:id
const deletePlace = async (req, res) => {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    return res.json({ message: 'Place deleted', id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { createPlace, updatePlace, deletePlace };
