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
  const [answers, setAnswers] = useState({ interest: 'nature', budget: 'low', groupType: 'solo' });
  const [recommended, setRecommended] = useState([]);
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
    setHasSearched(true);
    const start = performance.now();
    try {
      const data = await getRecommendation(answers);
      const end = performance.now();
      setQueryLatency(Math.round(end - start));
      setRecommended(data.places);
      if (data.places.length > 0) {
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
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">Personalized</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 tracking-tight">Recommendations</h1>
          <p className="text-secondary text-lg max-w-lg">
            Tell us what you love and we'll curate the perfect destinations for you.
          </p>
        </div>
      </FadeInSection>

      {/* Preferences Form */}
      <FadeInSection delay={80}>
        <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(26,23,20,0.04)] max-w-3xl mb-14">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2.5 tracking-tight">
            <div className="w-8 h-8 bg-accent/8 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-accent" />
            </div>
            Your Preferences
          </h2>
          <form onSubmit={handleRecommend} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block mb-2">Interest</label>
                <select
                  className={selectClass}
                  value={answers.interest}
                  onChange={(e) => setAnswers({ ...answers, interest: e.target.value })}
                >
                  <option value="nature">Nature</option>
                  <option value="culture">Culture</option>
                  <option value="adventure">Adventure</option>
                  <option value="relaxation">Relaxation</option>
                  <option value="nightlife">Nightlife</option>
                  <option value="food">Food</option>
                </select>
              </div>
              <div>
                <label className="block mb-2">Budget</label>
                <select
                  className={selectClass}
                  value={answers.budget}
                  onChange={(e) => setAnswers({ ...answers, budget: e.target.value })}
                >
                  <option value="low">Budget-Friendly</option>
                  <option value="medium">Mid-Range</option>
                  <option value="high">Premium</option>
                </select>
              </div>
              <div>
                <label className="block mb-2">Travel Group</label>
                <select
                  className={selectClass}
                  value={answers.groupType}
                  onChange={(e) => setAnswers({ ...answers, groupType: e.target.value })}
                >
                  <option value="solo">Solo</option>
                  <option value="couple">Couple</option>
                  <option value="family">Family</option>
                  <option value="friends">Friends</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary flex items-center gap-2.5" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span>Finding matches…</span>
                </>
              ) : (
                <>
                  Get Recommendations
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
            <p className="text-secondary text-sm animate-pulse-soft">Curating your perfect trips…</p>
          </div>
        ) : recommended.length > 0 ? (
          <>
            {/* ─── Cloud Execution Telemetry Banner ─────────── */}
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
                    </div>
                    <p className="text-xs text-white/70 mt-0.5">
                      Processed via <span className="text-white font-semibold">AWS Elastic Beanstalk (Node.js 20 on EC2)</span> • Decision Tree Heuristics • Persisted to <span className="text-white font-semibold">MongoDB Atlas M0</span>
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

            <div className="flex items-baseline justify-between mb-8">
              <div>
                <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-1">Results</p>
                <h2 className="text-2xl font-bold tracking-tight">Top Picks For You</h2>
              </div>
              <span className="text-secondary text-sm">{recommended.length} destinations</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
              {recommended.map((p, i) => (
                <FadeInSection key={p._id} delay={i * 80}>
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
