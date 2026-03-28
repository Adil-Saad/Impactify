'use client';

import { useState } from 'react';
import QuestCardGallery from '@/components/cards/QuestCardGallery';
import { SlidersHorizontal, X, Check } from 'lucide-react';

const CATEGORY_FILTERS = [
  { value: 'shopping', label: '🛒 Shopping' },
  { value: 'delivery', label: '📦 Delivery' },
  { value: 'litter', label: '🗑️ Litter' },
  { value: 'charity', label: '💛 Charity' },
  { value: 'pothole', label: '🕳️ Pothole' },
  { value: 'elderly', label: '👴 Elderly' },
  { value: 'pet', label: '🐕 Pet' },
  { value: 'other', label: '✨ Other' },
];

interface QuestRow {
  id: string;
  title: string;
  description: string;
  category: string;
  lat: number;
  lng: number;
  w3w_address: string | null;
  reward_type: string;
  price: number;
  photo_url: string | null;
  created_at: string;
}

export default function BrowseClient({ quests }: { quests: QuestRow[] }) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const toggleCategory = (value: string) => {
    setSelectedCategories(prev =>
      prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
    );
  };

  const clearFilters = () => setSelectedCategories([]);

  const filteredQuests = quests.filter(
    (q) => selectedCategories.length === 0 || selectedCategories.includes(q.category)
  );

  const mappedQuests = filteredQuests.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description || 'No description provided.',
    distance: q.w3w_address ? q.w3w_address.substring(0, 30) + '…' : `${q.lat.toFixed(3)}, ${q.lng.toFixed(3)}`,
    time: new Date(q.created_at).toLocaleDateString(),
    reward: q.reward_type === 'money' ? `£${q.price}` : `${q.price || 50} pts`,
    category: q.category,
    photoUrl: q.photo_url,
  }));

  return (
    <div className="flex flex-col items-center justify-start p-4 h-full relative">
      <div className="w-full max-w-sm mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Discover
            </h2>
            <p className="text-[#34D1BF] font-medium text-sm mt-1">Acts of kindness near you</p>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilterPanel(v => !v)}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
              selectedCategories.length > 0
                ? 'bg-[#34D1BF]/20 text-[#34D1BF] border-[#34D1BF]'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filter
            {selectedCategories.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#34D1BF] text-[#0A1628] text-[10px] font-bold rounded-full flex items-center justify-center">
                {selectedCategories.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilterPanel && (
          <div className="mt-3 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <span className="text-sm font-semibold text-white">Filter by Category</span>
              <div className="flex gap-2">
                {selectedCategories.length > 0 && (
                  <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-white transition-colors">
                    Clear all
                  </button>
                )}
                <button onClick={() => setShowFilterPanel(false)} className="text-gray-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-0">
              {CATEGORY_FILTERS.map((cat) => {
                const active = selectedCategories.includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    onClick={() => toggleCategory(cat.value)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm border-b border-r border-gray-700/50 transition-colors last:border-r-0 ${
                      active ? 'bg-[#34D1BF]/10 text-[#34D1BF]' : 'text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      active ? 'bg-[#34D1BF] border-[#34D1BF]' : 'border-gray-600'
                    }`}>
                      {active && <Check size={11} strokeWidth={3} className="text-[#0A1628]" />}
                    </div>
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 w-full max-w-sm flex flex-col justify-center items-center">
        {mappedQuests.length > 0 ? (
          <QuestCardGallery initialQuests={mappedQuests} />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 h-96 border-2 border-dashed border-gray-700 rounded-3xl bg-gray-900/50 shadow-xl w-full">
            <h3 className="text-xl font-bold text-white mb-2">
              {selectedCategories.length > 0 ? 'No matching quests' : 'No quests yet'}
            </h3>
            <p className="text-gray-400 text-center">
              {selectedCategories.length > 0
                ? 'Try selecting different categories or clear the filter.'
                : 'Be the first to post a quest!'}
            </p>
            {selectedCategories.length > 0 && (
              <button onClick={clearFilters} className="mt-4 text-[#34D1BF] text-sm underline">
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
