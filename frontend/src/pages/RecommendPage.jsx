import { useState, useRef, useEffect } from 'react';
import { getRecommendation } from '../api';
import Spinner from '../components/Spinner';
import FadeInSection from '../components/FadeInSection';
import PlaceCard from '../components/PlaceCard';
import { SparklesIcon, ArrowRightIcon } from '../components/Icons';

const selectClass =
  'w-full bg-white border border-muted rounded-xl px-4 py-3 text-primary text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent ' +
  'focus:shadow-[0_0_0_4px_rgba(168,95,60,0.10)] transition-all duration-200';

export default function RecommendPage({ addToast, isArchitectureAdmin }) {
  const [answers, setAnswers] = useState({
    interest: 'nature',
    budget: 'low',
    groupType: 'solo',
    vibe: '',
  });
  const [recommended, setRecommended] = useState([]);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [queryLatency, setQueryLatency] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (recommended.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [recommended]);

  const handleRecommend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRecommended([]);
    setAiData(null);
    setHasSearched(true);
    const start = performance.now();
    try {
      const data = await getRecommendation(answers);
      const end = performance.now();
      setQueryLatency(Math.round(end - start));
      setRecommended(data.places || []);
      setAiData(data.ai || null);
      if (data.places && data.places.length > 0) {
        addToast(`Found ${data.places.length} recommendations for you!`, 'success');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Page Header */}
      <FadeInSection>
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-accent mb-3">
            <span>✨</span> AI-Powered Travel Discovery
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 tracking-tight">Recommendations</h1>
          <p className="text-secondary text-lg max-w-lg">
            Tell us what you love and our smart recommendation engine will curate your next journey.
          </p>
        </div>
      </FadeInSection>

      {/* Preferences Form */}
      <FadeInSection delay={80}>
        <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(26,23,20,0.04)] max-w-3xl mb-14 border border-muted/30">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2.5 tracking-tight">
            <div className="w-8 h-8 bg-accent/8 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-accent" />
            </div>
            Your Travel Preferences
          </h2>
          <form onSubmit={handleRecommend} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block mb-2 font-medium text-sm">Interest</label>
                <select
                  className={selectClass}
                  value={answers.interest}
                  onChange={(e) => setAnswers({ ...answers, interest: e.target.value })}
                >
                  <option value="nature">Nature & Landscapes</option>
                  <option value="culture">Culture & History</option>
                  <option value="adventure">Adventure & Sports</option>
                  <option value="relaxation">Relaxation & Wellness</option>
                  <option value="nightlife">Nightlife & Clubs</option>
                  <option value="food">Culinary & Street Food</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-medium text-sm">Budget</label>
                <select
                  className={selectClass}
                  value={answers.budget}
                  onChange={(e) => setAnswers({ ...answers, budget: e.target.value })}
                >
                  <option value="low">Budget-Friendly</option>
                  <option value="medium">Mid-Range</option>
                  <option value="high">Premium / Luxury</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-medium text-sm">Travel Group</label>
                <select
                  className={selectClass}
                  value={answers.groupType}
                  onChange={(e) => setAnswers({ ...answers, groupType: e.target.value })}
                >
                  <option value="solo">Solo Traveler</option>
                  <option value="couple">Couple</option>
                  <option value="family">Family</option>
                  <option value="friends">Friends Group</option>
                </select>
              </div>
            </div>

            {/* Optional AI Travel Vibe */}
            <div>
              <label className="block mb-2 font-medium text-sm">
                Specific Travel Vibe or Wishlist <span className="text-secondary text-xs font-normal">(Optional — AI Guided)</span>
              </label>
              <input
                type="text"
                className="w-full bg-white border border-muted rounded-xl px-4 py-3 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                placeholder="e.g. Quiet mountain tea estates, serene beaches with sunsets, bustling night markets..."
                value={answers.vibe}
                onChange={(e) => setAnswers({ ...answers, vibe: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary flex items-center gap-2.5 px-6 py-3" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span>Curating matches with AI…</span>
                </>
              ) : (
                <>
                  <span>Get Recommendations</span>
                  <ArrowRightIcon />
                </>
              )}
            </button>
          </form>
        </div>
      </FadeInSection>

      {/* Results */}
      <div ref={resultsRef} className="scroll-mt-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Spinner size="lg" className="text-accent" />
            <p className="text-secondary text-sm animate-pulse-soft">
              Curating your recommendations and running AI insights…
            </p>
          </div>
        ) : recommended.length > 0 ? (
          <>
            {/* ─── Cloud Execution Telemetry Banner (Admin view) ─────────── */}
            {isArchitectureAdmin && (
              <div className="bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-white rounded-2xl p-4 sm:p-5 mb-8 border border-white/10 shadow-md animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-lg shrink-0">
                    ⚡
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-accent-light">
                        Cloud Execution Telemetry
                      </span>
                      {queryLatency !== null && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                          {queryLatency} ms
                        </span>
                      )}
                      {aiData && (
                        <span className="text-[10px] bg-sky-500/20 text-sky-300 font-mono px-2 py-0.5 rounded-full border border-sky-500/30 font-bold">
                          Groq LPU AI Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/70 mt-0.5">
                      Processed via <span className="text-white font-semibold">AWS Elastic Beanstalk (Node.js on EC2)</span> • Decision Tree Heuristics • Persisted to <span className="text-white font-semibold">MongoDB Atlas M0</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-white/60 bg-black/30 px-3 py-1.5 rounded-xl border border-white/5 shrink-0 self-start md:self-auto">
                  <span className="text-orange-300">Edge: CloudFront</span>
                  <span>•</span>
                  <span className="text-emerald-300">HTTP 200 OK</span>
                </div>
              </div>
            )}

            {/* ─── Groq AI Travel Concierge Card ─────────── */}
            {aiData && (
              <div className="bg-gradient-to-br from-card via-card to-accent/5 rounded-3xl p-6 sm:p-8 border border-accent/25 shadow-sm mb-10 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-muted/40 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-bold text-sm">
                      ✨
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-primary tracking-tight">
                        {aiData.headline || 'AI Travel Concierge Recommendation'}
                      </h3>
                      <p className="text-xs text-secondary">
                        Personalized itinerary and travel intelligence generated by Groq LPU
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                      ⚡ Groq LPU • Llama 3.3
                    </span>
                  </div>
                </div>

                {/* AI Summary */}
                {aiData.summary && (
                  <p className="text-sm sm:text-base text-primary/80 leading-relaxed mb-6 font-normal">
                    {aiData.summary}
                  </p>
                )}

                {/* AI Suggested Mini-Itinerary */}
                {aiData.suggestedItinerary && aiData.suggestedItinerary.length > 0 && (
                  <div className="bg-surface/70 rounded-2xl p-4 sm:p-5 border border-muted/30">
                    <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">
                      🗺️ Suggested 2-Day Flow
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiData.suggestedItinerary.map((item, idx) => (
                        <div key={idx} className="bg-card rounded-xl p-3.5 border border-muted/30">
                          <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                            {item.day}
                          </span>
                          <h4 className="font-semibold text-sm text-primary mt-1.5">{item.title}</h4>
                          {Array.isArray(item.activities) ? (
                            <ul className="text-xs text-secondary mt-1.5 space-y-1 list-disc list-inside">
                              {item.activities.map((act, aIdx) => (
                                <li key={aIdx}>{act}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-secondary mt-1 leading-relaxed">{item.activities}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results Header */}
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-1">Curated Results</p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Top Destinations For You</h2>
              </div>
              <span className="text-secondary text-sm font-medium bg-surface px-3 py-1 rounded-full border border-muted/40">
                {recommended.length} destinations found
              </span>
            </div>

            {/* Destinations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
              {recommended.map((p, i) => (
                <FadeInSection key={p._id} delay={i * 60}>
                  <PlaceCard place={p} isTopPick={i === 0} />
                </FadeInSection>
              ))}
            </div>
          </>
        ) : hasSearched ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
            <SparklesIcon className="w-16 h-16 text-secondary/30" />
            <p className="text-primary/70 font-semibold text-xl">No matches found</p>
            <p className="text-secondary text-sm text-center max-w-sm">
              Try adjusting your preferences — perhaps a different interest or budget range.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
            <div className="w-20 h-20 bg-accent/5 rounded-3xl flex items-center justify-center">
              <SparklesIcon className="w-10 h-10 text-secondary/40" />
            </div>
            <p className="text-primary/60 font-semibold text-lg">Your results will appear here</p>
            <p className="text-secondary text-sm text-center max-w-xs">
              Select your preferences above and click "Get Recommendations" to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
