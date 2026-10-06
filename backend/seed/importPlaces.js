require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Place = require('../models/Place');

const IMPORT_CITIES = [
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  { city: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018 },
  { city: 'Barcelona', country: 'Spain', lat: 41.3874, lng: 2.1686 },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
];

const PLACE_CATEGORIES = [
  'tourism.sights',
  'entertainment.museum',
  'leisure.park',
  'catering.restaurant',
  'entertainment.culture',
].join(',');

const requireKey = (name) => {
  if (!process.env[name] || process.env[name].startsWith('paste_')) {
    throw new Error(`${name} is missing. Add it to backend/.env before importing.`);
  }
  return process.env[name];
};

const getCategory = (categories = []) => {
  const value = categories.join(' ').toLowerCase();
  if (value.includes('restaurant') || value.includes('catering')) return 'food';
  if (value.includes('nightclub') || value.includes('bar')) return 'nightlife';
  if (value.includes('park') || value.includes('nature')) return 'nature';
  if (value.includes('sport') || value.includes('adventure')) return 'adventure';
  if (value.includes('spa') || value.includes('beach')) return 'relaxation';
  return 'culture';
};

const preferencesFor = (category) => {
  const preferences = {
    nature: ['solo', 'couple', 'family'],
    culture: ['solo', 'couple', 'family', 'friends'],
    adventure: ['solo', 'friends'],
    relaxation: ['solo', 'couple', 'family'],
    nightlife: ['solo', 'friends'],
    food: ['solo', 'couple', 'friends', 'family'],
  };
  return preferences[category];
};

async function getPhoto(query, accessKey) {
  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('per_page', '1');

  const response = await fetch(url, {
    headers: { Authorization: `Client-ID ${accessKey}`, 'Accept-Version': 'v1' },
  });
  if (!response.ok) return { imageUrl: '', imageAttribution: undefined };

  const { results = [] } = await response.json();
  const photo = results[0];
  if (!photo) return { imageUrl: '', imageAttribution: undefined };

  return {
    imageUrl: photo.urls.regular,
    imageAttribution: {
      photographer: photo.user.name,
      profileUrl: `${photo.user.links.html}?utm_source=smart_tourism&utm_medium=referral`,
      photoUrl: `${photo.links.html}?utm_source=smart_tourism&utm_medium=referral`,
    },
  };
}

async function fetchCityPlaces(city, geoapifyKey) {
  const url = new URL('https://api.geoapify.com/v2/places');
  url.searchParams.set('categories', PLACE_CATEGORIES);
  url.searchParams.set('filter', `circle:${city.lng},${city.lat},15000`);
  url.searchParams.set('bias', `proximity:${city.lng},${city.lat}`);
  url.searchParams.set('limit', '8');
  url.searchParams.set('apiKey', geoapifyKey);

  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Geoapify import failed for ${city.city}: ${error.message || response.status}`);
  }
  const { features = [] } = await response.json();
  return features.filter(({ properties }) => properties.name && properties.place_id);
}

async function importPlaces() {
  const geoapifyKey = requireKey('GEOAPIFY_API_KEY');
  const unsplashKey = requireKey('UNSPLASH_ACCESS_KEY');
  await connectDB();

  let imported = 0;
  let skipped = 0;

  for (const city of IMPORT_CITIES) {
    const features = await fetchCityPlaces(city, geoapifyKey);
    for (const { properties } of features) {
      const category = getCategory(properties.categories);
      const photo = await getPhoto(`${properties.name} ${city.city}`, unsplashKey);
      const document = {
        name: properties.name,
        description: `${properties.name} is a ${category} destination in ${properties.city || city.city}, ${properties.country || city.country}.`,
        country: properties.country || city.country,
        city: properties.city || city.city,
        category,
        tags: [...new Set([category, ...(properties.categories || []).map((item) => item.split('.').pop())])].slice(0, 6),
        budgetLevel: 'medium',
        bestFor: preferencesFor(category),
        imageUrl: photo.imageUrl,
        imageAttribution: photo.imageAttribution,
        geoapifyPlaceId: properties.place_id,
        location: { lat: properties.lat, lng: properties.lon },
      };

      const result = await Place.updateOne(
        { geoapifyPlaceId: properties.place_id },
        { $set: document },
        { upsert: true }
      );
      if (result.upsertedCount || result.modifiedCount) imported += 1;
      else skipped += 1;
    }
  }

  console.log(`Import complete: ${imported} added or updated, ${skipped} unchanged.`);
  await mongoose.disconnect();
}

importPlaces().catch(async (error) => {
  console.error(`Import error: ${error.message}`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
