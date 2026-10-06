import { useEffect, useState } from 'react';
import { getPlaces, searchPlaces } from '../api';
import Spinner from '../components/Spinner';
import FadeInSection from '../components/FadeInSection';
import PlaceCard from '../components/PlaceCard';
import { SearchIcon, GlobeIcon } from '../components/Icons';

export default function ExplorePage({ addToast }) {
  const [places, setPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    getPlaces()
      .then((data) => setPlaces(data.places))
      .catch((err) => addToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [addToast]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    try {
      const data = await searchPlaces(searchTerm);
      setPlaces(data.places);
      if (data.places.length === 0) {
        addToast('No results found. Try a different keyword.', 'info');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSearchLoading(false);
    }
  };

  const isLoading = loading || searchLoading;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Page Header */}
      <FadeInSection>
        <div className="mb-10">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">Destinations</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 tracking-tight">Explore the World</h1>
          <p className="text-secondary text-lg max-w-lg">Discover extraordinary places curated for every type of traveler.</p>
        </div>
      </FadeInSection>

      {/* Search Bar */}
      <FadeInSection delay={80}>
        <form onSubmit={handleSearch} className="flex gap-3 mb-12 max-w-2xl">
          <input
            className="flex-1"
            placeholder="Search by country, city, or name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn-primary flex items-center gap-2 rounded-xl" disabled={isLoading}>
            {searchLoading ? <Spinner size="sm" /> : <SearchIcon />}
            <span className="hidden sm:inline">{searchLoading ? 'Searching…' : 'Search'}</span>
          </button>
        </form>
      </FadeInSection>

      {/* Results */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Spinner size="lg" className="text-accent" />
          <p className="text-secondary text-sm">Finding destinations…</p>
        </div>
      ) : places.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
          <GlobeIcon className="w-16 h-16 text-secondary/40" />
          <p className="text-primary/70 font-semibold text-xl">No destinations found</p>
          <p className="text-secondary text-sm text-center max-w-sm">
            Try searching for a different country, city, or place name.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
          {places.map((p, i) => (
            <FadeInSection key={p._id} delay={Math.min(i * 60, 400)}>
              <PlaceCard place={p} />
            </FadeInSection>
          ))}
        </div>
      )}
    </div>
  );
}
