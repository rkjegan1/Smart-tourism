const mongoose = require('mongoose');

const questionnaireSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },

    // Raw answers submitted by the user
    answers: {
      interest: {
        type: String,
        enum: ['nature', 'culture', 'adventure', 'relaxation', 'nightlife', 'food'],
        required: true,
      },
      budget: { type: String, enum: ['low', 'medium', 'high'], required: true },
      groupType: { type: String, enum: ['solo', 'couple', 'family', 'friends'], required: true },
      duration: { type: String, enum: ['short', 'medium', 'long'], default: 'medium' },
    },

    // Snapshot of recommended place ids for history/analytics
    recommendedPlaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Place' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Questionnaire', questionnaireSchema);
