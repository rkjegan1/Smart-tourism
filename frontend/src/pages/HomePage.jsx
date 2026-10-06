import { Link } from 'react-router-dom';
import FadeInSection from '../components/FadeInSection';
import { CompassIcon, SearchIcon, SparklesIcon, ArrowRightIcon, MapPinIcon } from '../components/Icons';

const HERO_BG = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&h=900&fit=crop&q=80';
const BEACH_HERO_BG = 'https://images.unsplash.com/photo-1777837527818-5e54d3611c47?auto=format&fit=crop&w=1600&h=900&q=85';

export default function HomePage() {
  return (
    <>
      {/* ─── Hero with Background Image ───────────────────── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <img
          src={HERO_BG}
          alt=""
          className="absolute inset-0 w-full h-full object-cover hero-background-image"
          loading="eager"
        />
        <img
          src={BEACH_HERO_BG}
          alt="Beach chairs and inflatable toys beside the sea"
          className="absolute inset-0 hidden w-full h-full object-cover beach-hero-image"
          loading="eager"
        />
        {/* Gradient overlay using palette */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/80 via-primary-dark/60 to-primary-dark/90" />
        {/* Slow-moving light creates depth without competing with the content. */}
        <div className="hero-atmosphere absolute inset-0" aria-hidden="true" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium px-5 py-2 rounded-full mb-8 border border-white/10">
            <CompassIcon className="w-4 h-4" />
            Your journey starts here
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
            Discover Your<br className="hidden sm:block" />
            Perfect Destination
          </h1>
          <p className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
            Personalized travel recommendations tailored to your interests, budget, and travel style.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/recommend" className="btn-primary inline-flex items-center gap-2.5 text-base px-10 py-3.5 rounded-full no-underline shadow-[0_4px_24px_rgba(168,95,60,0.4)]">
              Get Recommendations
              <ArrowRightIcon />
            </Link>
            <Link to="/explore" className="inline-flex items-center gap-2.5 text-base px-10 py-3.5 rounded-full no-underline text-white/90 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 font-medium">
              Explore Places
              <SearchIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        {/* Subtle decorative blob */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/[0.03] rounded-full blur-3xl -z-10" />

        <FadeInSection>
          <p className="text-accent font-semibold text-sm uppercase tracking-widest text-center mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 tracking-tight">
            Three Simple Steps
          </h2>
          <p className="text-secondary text-center max-w-lg mx-auto mb-16 text-lg">
            From exploration to your perfect trip — effortlessly.
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {[
            {
              icon: <SearchIcon className="w-6 h-6 text-accent" />,
              step: '01',
              title: 'Explore',
              desc: 'Browse curated destinations across the world by country, city, or category.',
            },
            {
              icon: <SparklesIcon className="w-6 h-6 text-accent" />,
              step: '02',
              title: 'Get Matched',
              desc: 'Tell us your interests, budget, and travel group — our engine does the rest.',
            },
            {
              icon: <MapPinIcon className="w-6 h-6 text-accent" />,
              step: '03',
              title: 'Discover',
              desc: 'View personalized recommendations with ratings, details, and travel info.',
            },
          ].map((feature, i) => (
            <FadeInSection key={feature.title} delay={i * 120}>
              <div className="relative bg-card rounded-2xl p-8 text-center shadow-[0_1px_2px_rgba(26,23,20,0.04)] hover:shadow-[0_8px_30px_rgba(26,23,20,0.08)] hover:-translate-y-1.5 transition-all duration-300 group">
                <span className="absolute top-4 right-5 text-5xl font-bold text-primary/[0.04] select-none">{feature.step}</span>
                <div className="w-14 h-14 bg-accent/8 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-accent/15 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-secondary text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ───────────────────────────────────── */}
      <FadeInSection>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
          <div className="relative bg-primary-dark rounded-3xl px-8 sm:px-16 py-16 sm:py-20 text-center overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />

            <div className="relative">
              <p className="text-accent-light font-semibold text-sm uppercase tracking-widest mb-4">Start Planning</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                Ready for your next adventure?
              </h2>
              <p className="text-white/40 mb-10 max-w-md mx-auto text-lg">
                Let our recommendation engine match you with the best destinations.
              </p>
              <Link to="/recommend" className="btn-primary inline-flex items-center gap-2.5 px-10 py-3.5 rounded-full no-underline text-base shadow-[0_4px_24px_rgba(168,95,60,0.4)]">
                Start Now
                <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </section>
      </FadeInSection>
    </>
  );
}
