'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Camera, Search, ChevronDown, Sparkles } from 'lucide-react';
import { createQuest } from './actions';

const CATEGORIES = [
  { value: 'shopping', label: '🛒 Shopping', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'delivery', label: '📦 Delivery', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'litter', label: '🗑️ Litter Pickup', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'charity', label: '💛 Charity', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'pothole', label: '🕳️ Pothole Report', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'elderly', label: '👴 Elderly Help', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: 'pet', label: '🐕 Pet Care', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { value: 'other', label: '✨ Other', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
];

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function PostPage() {
  const [category, setCategory] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [rewardType, setRewardType] = useState('points');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Nominatim location autocomplete
  useEffect(() => {
    if (locationQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&limit=5&countrycodes=gb`
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (e) {
        console.error('Nominatim error:', e);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [locationQuery]);

  const selectLocation = (result: NominatimResult) => {
    setSelectedLocation({
      name: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    });
    setLocationQuery(result.display_name);
    setShowSuggestions(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 pb-24 min-h-full">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-1">
          Create a Quest
        </h2>
        <p className="text-[#34D1BF] font-medium text-sm mb-6">Help your community, one quest at a time</p>

        <form action={createQuest} className="flex flex-col gap-5 text-white">

          {/* Photo Upload */}
          <div className="relative">
            <label htmlFor="photo-upload" className="cursor-pointer block">
              <div className={`w-full h-40 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${photoPreview ? 'border-[#34D1BF]/50' : 'border-gray-700 hover:border-gray-500'}`}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Camera size={32} className="mb-2" />
                    <span className="text-sm">Tap to add a photo</span>
                  </div>
                )}
              </div>
            </label>
            <input id="photo-upload" type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Quest Title</label>
            <input
              name="title"
              className="w-full rounded-xl px-4 py-3 bg-gray-800/80 border border-gray-700 outline-none focus:border-[#34D1BF] transition-colors placeholder-gray-500"
              placeholder="E.g. Pick up medication from Boots"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Description</label>
            <textarea
              name="description"
              className="w-full rounded-xl px-4 py-3 bg-gray-800/80 border border-gray-700 outline-none focus:border-[#34D1BF] transition-colors placeholder-gray-500 h-24 resize-none"
              placeholder="Provide details about what needs to be done..."
              required
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    category === cat.value
                      ? 'bg-[#34D1BF]/20 text-[#34D1BF] border-[#34D1BF] shadow-lg shadow-[#34D1BF]/10'
                      : cat.color
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="category" value={category} />
          </div>

          {/* Location Autofill */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-300 mb-1 block">Location</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => {
                  setLocationQuery(e.target.value);
                  setSelectedLocation(null);
                }}
                className="w-full rounded-xl pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-700 outline-none focus:border-[#34D1BF] transition-colors placeholder-gray-500"
                placeholder="Search for a location in Portsmouth..."
                required
              />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectLocation(s)}
                    className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white border-b border-gray-700/50 last:border-0 flex items-start gap-2"
                  >
                    <MapPin size={14} className="text-[#34D1BF] mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{s.display_name}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedLocation && (
              <p className="text-xs text-[#34D1BF] mt-1 flex items-center gap-1">
                <MapPin size={12} /> Pinned at {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
              </p>
            )}
            <input type="hidden" name="lat" value={selectedLocation?.lat ?? ''} />
            <input type="hidden" name="lng" value={selectedLocation?.lng ?? ''} />
            <input type="hidden" name="locationName" value={selectedLocation?.name ?? ''} />
          </div>

          {/* Reward */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Reward</label>
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => setRewardType('points')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${rewardType === 'points' ? 'bg-[#34D1BF]/20 text-[#34D1BF] border-[#34D1BF]' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                <Sparkles size={14} className="inline mr-1" /> Points
              </button>
              <button type="button" onClick={() => setRewardType('money')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${rewardType === 'money' ? 'bg-[#34D1BF]/20 text-[#34D1BF] border-[#34D1BF]' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                💷 Tip / Payment
              </button>
            </div>
            {rewardType === 'money' && (
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-xl px-4 py-3 bg-gray-800/80 border border-gray-700 outline-none focus:border-[#34D1BF] transition-colors placeholder-gray-500"
                placeholder="Amount (£)"
              />
            )}
            <input type="hidden" name="rewardType" value={rewardType} />
            <input type="hidden" name="photoUrl" value="" />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!category || !selectedLocation}
            className="w-full mt-2 bg-gradient-to-r from-[#34D1BF] to-[#2bb4a4] text-[#0A1628] rounded-xl px-4 py-4 font-bold text-lg hover:shadow-lg hover:shadow-[#34D1BF]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Post Quest 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
