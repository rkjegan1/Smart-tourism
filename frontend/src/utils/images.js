/* ─── Deterministic placeholder images by category/city ─── */

const UNSPLASH_IMAGES = {
  nature: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
  ],
  culture: [
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&h=400&fit=crop',
  ],
  adventure: [
    'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop',
  ],
  relaxation: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop',
  ],
  nightlife: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop',
  ],
  food: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop',
  ],
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop';

/**
 * Get a relevant image for a place, using its own imageUrl if available,
 * otherwise falling back to a deterministic Unsplash image based on category.
 */
export function getPlaceImage(place) {
  if (place.imageUrl) return place.imageUrl;

  const images = UNSPLASH_IMAGES[place.category] || UNSPLASH_IMAGES.nature;
  // Use the name length as a simple deterministic index
  const index = (place.name || '').length % images.length;
  return images[index];
}

/** Higher-res version for detail/banner pages */
export function getPlaceBanner(place) {
  if (place.imageUrl) return place.imageUrl.replace(/w=\d+/, 'w=1200').replace(/h=\d+/, 'h=600');

  const images = UNSPLASH_IMAGES[place.category] || UNSPLASH_IMAGES.nature;
  const index = (place.name || '').length % images.length;
  return images[index].replace(/w=\d+/, 'w=1200').replace(/h=\d+/, 'h=600');
}

/** Category emoji map */
export const CATEGORY_EMOJI = {
  nature: '🌿',
  culture: '🏛️',
  adventure: '⛰️',
  relaxation: '🧘',
  nightlife: '🌙',
  food: '🍽️',
};
