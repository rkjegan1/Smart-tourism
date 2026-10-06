import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPlaceById } from '../api';
import Spinner from '../components/Spinner';
import FadeInSection from '../components/FadeInSection';
import { ArrowLeftIcon, MapPinIcon, StarIcon } from '../components/Icons';
import { getPlaceBanner, CATEGORY_EMOJI } from '../utils/images';

export default function PlaceDetailPage({ addToast }) {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPlaceById(id)
      .then((data) => setPlace(data.place || data))
      .catch((err) => addToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [id, addToast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Spinner size="lg" className="text-accent" />
        <p className="text-secondary text-sm">Loading place details…</p>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-primary/70 font-semibold text-xl mb-6">Place not found</p>
        <Link to="/explore" className="btn-secondary inline-flex items-center gap-2 no-underline">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Explore
        </Link>
      </div>
    );
  }

  const bannerImage = getPlaceBanner(place);
  const emoji = CATEGORY_EMOJI[place.category] || '📍';

  return (
    <div className="animate-fade-in">
      {/* ─── Banner Image ────────────────────────────────── */}
      <div className="relative h-72 sm:h-96 lg:h-[28rem] overflow-hidden">
        <img
          src={bannerImage}
          alt={place.name}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />

        {place.imageAttribution?.photographer && (
          <a
            href={place.imageAttribution.profileUrl || place.imageAttribution.photoUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute right-4 top-5 text-xs text-white/65 hover:text-white transition-colors"
          >
            Photo by {place.imageAttribution.photographer} on Unsplash
          </a>
        )}

        {/* Back button on banner */}
        <Link
          to="/explore"
          className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full transition-colors no-underline"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Link>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full border border-white/10">
                {emoji} {place.category}
              </span>
              {place.budgetLevel && (
                <span className="bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full border border-white/10">
                  {place.budgetLevel}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-2">
              {place.name}
            </h1>
            <div className="flex items-center gap-2 text-white/70">
              <MapPinIcon className="w-4 h-4 text-white/50" />
              <span className="text-lg">{place.city}, {place.country}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content ─────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content — 2 cols */}
          <div className="lg:col-span-2 space-y-10">
            {/* About */}
            <FadeInSection>
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">About</h2>
                {place.description ? (
                  <p className="text-primary/70 text-lg leading-relaxed">{place.description}</p>
                ) : (
                  <p className="text-secondary italic">No description available for this destination.</p>
                )}
              </div>
            </FadeInSection>

            {/* Details Grid */}
            <FadeInSection delay={100}>
              <h2 className="text-2xl font-bold tracking-tight mb-5">Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {place.country && <DetailCard label="Country" value={place.country} />}
                {place.city && <DetailCard label="City" value={place.city} />}
                {place.category && <DetailCard label="Category" value={`${emoji} ${place.category}`} />}
                {place.budgetLevel && <DetailCard label="Budget" value={place.budgetLevel} />}
                {place.bestFor && (
                  <DetailCard
                    label="Best For"
                    value={Array.isArray(place.bestFor) ? place.bestFor.join(', ') : place.bestFor}
                  />
                )}
                {place.tags && place.tags.length > 0 && (
                  <DetailCard label="Tags" value={place.tags.join(', ')} />
                )}
              </div>
            </FadeInSection>
          </div>

          {/* Sidebar — 1 col */}
          <div className="space-y-6">
            {/* Rating Card */}
            {place.rating && (
              <FadeInSection delay={80}>
                <div className="bg-card rounded-2xl p-6 text-center">
                  <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-3">Rating</p>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <StarIcon className="w-8 h-8 text-amber-500" />
                    <span className="text-4xl font-bold text-primary">{place.rating}</span>
                    <span className="text-lg text-secondary font-medium">/5</span>
                  </div>
                  <div className="flex justify-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(place.rating) ? 'text-amber-500' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                </div>
              </FadeInSection>
            )}

            {/* Quick Info */}
            <FadeInSection delay={160}>
              <div className="bg-card rounded-2xl p-6 space-y-4">
                <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-1">Quick Info</p>
                {place.category && (
                  <InfoRow label="Category" value={place.category} />
                )}
                {place.budgetLevel && (
                  <InfoRow label="Budget" value={place.budgetLevel} />
                )}
                {place.bestFor && (
                  <InfoRow label="Best For" value={Array.isArray(place.bestFor) ? place.bestFor.join(', ') : place.bestFor} />
                )}
              </div>
            </FadeInSection>

            {/* CTA */}
            <FadeInSection delay={240}>
              <Link
                to="/recommend"
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 no-underline"
              >
                Find Similar Places
                <ArrowLeftIcon className="w-4 h-4 rotate-180" />
              </Link>
            </FadeInSection>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="bg-card rounded-xl px-4 py-4">
      <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-primary font-medium text-sm capitalize">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-muted/30 last:border-0">
      <span className="text-sm text-secondary">{label}</span>
      <span className="text-sm font-medium text-primary capitalize">{value}</span>
    </div>
  );
}
