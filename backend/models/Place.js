const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    country: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },

    // Used by the recommendation engine to match questionnaire answers
    category: {
      type: String,
      enum: ['nature', 'culture', 'adventure', 'relaxation', 'nightlife', 'food'],
      required: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],

    budgetLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    bestFor: {
      type: [String],
      enum: ['solo', 'couple', 'family', 'friends'],
      default: ['solo', 'couple', 'family', 'friends'],
    },

    imageUrl: { type: String, default: '' },
    imageAttribution: {
      photographer: { type: String, default: '' },
      profileUrl: { type: String, default: '' },
      photoUrl: { type: String, default: '' },
    },
    geoapifyPlaceId: { type: String, unique: true, sparse: true },
    rating: { type: Number, min: 0, max: 5, default: 4 },

    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true }
);

placeSchema.index({ name: 'text', city: 'text', country: 'text' });

module.exports = mongoose.model('Place', placeSchema);
