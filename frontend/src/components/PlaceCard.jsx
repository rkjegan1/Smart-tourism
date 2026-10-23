import { Link } from 'react-router-dom';
import { MapPinIcon, StarIcon } from './Icons';
import { getPlaceImage, CATEGORY_EMOJI } from '../utils/images';

/**
 * Premium place card with image, gradient overlay, category badge, and hover effects.
 */
export default function PlaceCard({ place, isTopPick = false }) {
  const image = getPlaceImage(place);
  const emoji = CATEGORY_EMOJI[place.category] || '📍';

  return (
    <article className="group rounded-2xl overflow-hidden bg-card shadow-[0_2px_8px_rgba(26,23,20,0.05)] hover:shadow-[0_12px_40px_rgba(26,23,20,0.12)] hover:-translate-y-2 transition-all duration-300">
      <Link to={`/place/${place._id}`} className="block no-underline">
      {/* Image Container */}
      <div className="relative h-48 sm:h-52 overflow-hidden">
        <img
          src={image}
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent" />

        {/* Category badge - top left */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-primary text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
          {emoji} {place.category}
        </span>

        {/* Top Pick ribbon */}
        {isTopPick && (
          <span className="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-fade-in">
            ⭐ Top Pick
          </span>
        )}

        {/* Name overlay on image bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md truncate">
            {place.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPinIcon className="w-3.5 h-3.5 text-white/60 shrink-0" />
            <span className="text-white/70 text-sm truncate">
              {place.city}, {place.country}
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5">
        {place.description && (
          <p className="text-sm text-primary/60 line-clamp-2 leading-relaxed mb-3">
            {place.description}
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <span className="badge-secondary">{place.budgetLevel}</span>
            {place.bestFor && place.bestFor.length > 0 && (
              <span className="badge-secondary">{place.bestFor[0]}</span>
            )}
          </div>
          {place.rating && (
            <div className="flex items-center gap-1 bg-surface px-2.5 py-1 rounded-lg">
              <StarIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-bold text-primary">{place.rating}</span>
            </div>
          )}
        </div>

        {/* Personalized AI Match Reason */}
        {place.aiReason && (
          <div className="mt-3 pt-2 border-t border-muted/30 flex items-start gap-2 text-xs text-accent-dark font-medium bg-accent/5 p-2.5 rounded-xl border border-accent/15">
            <span className="text-sm shrink-0">✨</span>
            <span className="line-clamp-2 leading-relaxed">{place.aiReason}</span>
          </div>
        )}
      </div>
      </Link>
      {place.imageAttribution?.photographer && (
        <div className="border-t border-muted/40 px-4 sm:px-5 py-2">
          <a
            href={place.imageAttribution.profileUrl || place.imageAttribution.photoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-secondary hover:text-accent transition-colors"
          >
            Photo by {place.imageAttribution.photographer} on Unsplash
          </a>
        </div>
      )}
    </article>
  );
}
