const Place = require('../models/Place');
const Questionnaire = require('../models/Questionnaire');

/**
 * Simple decision tree.
 * Each branch narrows down the query filter based on the answer given.
 * This is intentionally simple and easy to extend with more branches/rules later.
 */
const buildFilterFromAnswers = (answers) => {
  const { interest, budget, groupType } = answers;
  const filter = {};

  // Branch 1: interest -> category (primary decision)
  if (interest) {
    filter.category = interest;
  }

  // Branch 2: budget -> budgetLevel
  if (budget) {
    filter.budgetLevel = budget;
  }

  // Branch 3: groupType -> bestFor
  if (groupType) {
    filter.bestFor = groupType;
  }

  return filter;
};

// @route  POST /api/recommend
// body: { interest, budget, groupType, duration, userId? }
const getRecommendation = async (req, res) => {
  try {
    const { interest, budget, groupType, duration } = req.body;

    if (!interest || !budget || !groupType) {
      return res
        .status(400)
        .json({ message: 'interest, budget and groupType are required' });
    }

    const answers = { interest, budget, groupType, duration };
    const filter = buildFilterFromAnswers(answers);

    // Step 1: try strict match (interest + budget + groupType)
    let places = await Place.find(filter).sort({ rating: -1 }).limit(10);

    // Step 2: fallback - relax budget if nothing found
    if (places.length === 0) {
      places = await Place.find({ category: interest, bestFor: groupType })
        .sort({ rating: -1 })
        .limit(10);
    }

    // Step 3: fallback - relax to interest only
    if (places.length === 0) {
      places = await Place.find({ category: interest }).sort({ rating: -1 }).limit(10);
    }

    // Save questionnaire record (user optional - works for guests too)
    const questionnaire = await Questionnaire.create({
      user: req.user ? req.user._id : undefined,
      answers,
      recommendedPlaces: places.map((p) => p._id),
    });

    return res.json({
      questionnaireId: questionnaire._id,
      count: places.length,
      places,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getRecommendation };
