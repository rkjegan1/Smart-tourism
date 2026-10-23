const Place = require('../models/Place');
const Questionnaire = require('../models/Questionnaire');
const { generateAiRecommendationInsights } = require('../utils/groqClient');

const TARGET_RECOMMENDATION_COUNT = 8;

/**
 * Intelligent recommendation pipeline with progressive backfill and optional Groq AI enrichment.
 * 1. Strict match: Category + Budget + Travel Group
 * 2. Progressive backfill: Category + Travel Group (any budget)
 * 3. Broad backfill: Category (any budget/group)
 * 4. General backfill: Highest-rated destinations overall
 * 5. Groq LPU AI inference: Generates personalized match reasons & 2-day mini-itinerary
 */

// @route  POST /api/recommend
// body: { interest, budget, groupType, duration, vibe, userId? }
const getRecommendation = async (req, res) => {
  try {
    const { interest, budget, groupType, duration, vibe } = req.body;

    if (!interest || !budget || !groupType) {
      return res
        .status(400)
        .json({ message: 'interest, budget and groupType are required' });
    }

    const answers = { interest, budget, groupType, duration, vibe };
    const selectedPlaces = [];
    const seenIds = new Set();

    const addPlaces = (newPlaces) => {
      for (const p of newPlaces) {
        const idStr = p._id.toString();
        if (!seenIds.has(idStr)) {
          seenIds.add(idStr);
          selectedPlaces.push(p);
          if (selectedPlaces.length >= TARGET_RECOMMENDATION_COUNT) break;
        }
      }
    };

    // Step 1: Strict match (interest + budget + groupType)
    const strictMatches = await Place.find({
      category: interest,
      budgetLevel: budget,
      bestFor: groupType,
    })
      .sort({ rating: -1 })
      .limit(TARGET_RECOMMENDATION_COUNT)
      .lean();
    addPlaces(strictMatches);

    // Step 2: Backfill with same category and groupType (relax budget)
    if (selectedPlaces.length < TARGET_RECOMMENDATION_COUNT) {
      const remainingNeeded = TARGET_RECOMMENDATION_COUNT - selectedPlaces.length;
      const groupMatches = await Place.find({
        category: interest,
        bestFor: groupType,
        _id: { $nin: Array.from(seenIds) },
      })
        .sort({ rating: -1 })
        .limit(remainingNeeded)
        .lean();
      addPlaces(groupMatches);
    }

    // Step 3: Backfill with same category (relax groupType & budget)
    if (selectedPlaces.length < TARGET_RECOMMENDATION_COUNT) {
      const remainingNeeded = TARGET_RECOMMENDATION_COUNT - selectedPlaces.length;
      const categoryMatches = await Place.find({
        category: interest,
        _id: { $nin: Array.from(seenIds) },
      })
        .sort({ rating: -1 })
        .limit(remainingNeeded)
        .lean();
      addPlaces(categoryMatches);
    }

    // Step 4: Backfill with top-rated overall places to guarantee a rich result set
    if (selectedPlaces.length < TARGET_RECOMMENDATION_COUNT) {
      const remainingNeeded = TARGET_RECOMMENDATION_COUNT - selectedPlaces.length;
      const topRatedMatches = await Place.find({
        _id: { $nin: Array.from(seenIds) },
      })
        .sort({ rating: -1 })
        .limit(remainingNeeded)
        .lean();
      addPlaces(topRatedMatches);
    }

    // Step 5: AI Enrichment via Groq (non-blocking fallback)
    let aiInsights = null;
    try {
      aiInsights = await generateAiRecommendationInsights({
        answers,
        places: selectedPlaces,
      });
    } catch (aiErr) {
      console.warn('[Recommendation] AI enrichment skipped:', aiErr.message);
    }

    // Attach personalized AI reasons to individual place objects if available
    const enrichedPlaces = selectedPlaces.map((place) => {
      const placeId = place._id.toString();
      const aiReason = aiInsights?.placeReasons?.[placeId] || null;
      return {
        ...place,
        aiReason,
      };
    });

    // Save questionnaire record (user optional - works for guests too)
    const questionnaire = await Questionnaire.create({
      user: req.user ? req.user._id : undefined,
      answers,
      recommendedPlaces: enrichedPlaces.map((p) => p._id),
    });

    return res.json({
      questionnaireId: questionnaire._id,
      count: enrichedPlaces.length,
      places: enrichedPlaces,
      ai: aiInsights,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getRecommendation };
