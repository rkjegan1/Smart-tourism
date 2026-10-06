require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Place = require('../models/Place');

const users = [
  { name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { name: 'Test User', email: 'user@example.com', password: 'user123', role: 'user' },
];

const places = [
  {
    name: 'Munnar Hill Station',
    description: 'Lush green tea plantations and misty mountains.',
    country: 'India',
    city: 'Munnar',
    category: 'nature',
    tags: ['mountains', 'tea', 'scenic'],
    budgetLevel: 'low',
    bestFor: ['couple', 'family', 'solo'],
    rating: 4.6,
    location: { lat: 10.0889, lng: 77.0595 },
  },
  {
    name: 'Eiffel Tower',
    description: 'Iconic iron landmark in the heart of Paris.',
    country: 'France',
    city: 'Paris',
    category: 'culture',
    tags: ['landmark', 'architecture', 'romantic'],
    budgetLevel: 'high',
    bestFor: ['couple', 'family', 'friends'],
    rating: 4.8,
    location: { lat: 48.8584, lng: 2.2945 },
  },
  {
    name: 'Queenstown Bungee',
    description: 'Adventure capital with bungee jumping and skydiving.',
    country: 'New Zealand',
    city: 'Queenstown',
    category: 'adventure',
    tags: ['bungee', 'extreme sports', 'skydiving'],
    budgetLevel: 'high',
    bestFor: ['solo', 'friends'],
    rating: 4.7,
    location: { lat: -45.0312, lng: 168.6626 },
  },
  {
    name: 'Bali Beach Resort',
    description: 'Relaxing beach resort with spa and yoga retreats.',
    country: 'Indonesia',
    city: 'Bali',
    category: 'relaxation',
    tags: ['beach', 'spa', 'yoga'],
    budgetLevel: 'medium',
    bestFor: ['couple', 'solo', 'family'],
    rating: 4.5,
    location: { lat: -8.3405, lng: 115.092 },
  },
  {
    name: 'Bangkok Night Market',
    description: 'Vibrant nightlife with street food and live music.',
    country: 'Thailand',
    city: 'Bangkok',
    category: 'nightlife',
    tags: ['nightlife', 'market', 'street food'],
    budgetLevel: 'low',
    bestFor: ['friends', 'solo'],
    rating: 4.3,
    location: { lat: 13.7563, lng: 100.5018 },
  },
  {
    name: 'Tokyo Street Food Tour',
    description: 'Explore ramen shops, sushi bars and izakayas.',
    country: 'Japan',
    city: 'Tokyo',
    category: 'food',
    tags: ['ramen', 'sushi', 'street food'],
    budgetLevel: 'medium',
    bestFor: ['solo', 'couple', 'friends'],
    rating: 4.9,
    location: { lat: 35.6762, lng: 139.6503 },
  },
  {
    name: 'Swiss Alps Trek',
    description: 'Breathtaking alpine trails and snow-capped peaks.',
    country: 'Switzerland',
    city: 'Interlaken',
    category: 'nature',
    tags: ['mountains', 'trekking', 'snow'],
    budgetLevel: 'high',
    bestFor: ['solo', 'friends', 'family'],
    rating: 4.8,
    location: { lat: 46.6863, lng: 7.8632 },
  },
  {
    name: 'Rome Colosseum',
    description: 'Ancient amphitheater showcasing Roman history.',
    country: 'Italy',
    city: 'Rome',
    category: 'culture',
    tags: ['history', 'ancient', 'architecture'],
    budgetLevel: 'medium',
    bestFor: ['couple', 'family', 'solo'],
    rating: 4.7,
    location: { lat: 41.8902, lng: 12.4922 },
  },
];

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Place.deleteMany();

    await User.create(users);
    await Place.insertMany(places);

    console.log('Sample data seeded successfully');
    process.exit();
  } catch (err) {
    console.error(`Seed error: ${err.message}`);
    process.exit(1);
  }
};

seedData();
