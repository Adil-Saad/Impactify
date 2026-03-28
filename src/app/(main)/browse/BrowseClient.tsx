'use client';

import { useState } from 'react';
import QuestCardGallery from '@/components/cards/QuestCardGallery';
import { Filter } from 'lucide-react';

const CATEGORY_FILTERS = [
  { value: 'all', label: 'All' },
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
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredQuests = quests.filter(
    (q) => activeFilter === 'all' || q.category === activeFilter
  );

  const mappedQuests = filteredQuests.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description || 'No description provided.',
    distance: q.w3w_address ? q.w3w_address.substring(0, 25) + '...' : `${q.lat.toFixed(3)}, ${q.lng.toFixed(3)}`,
    time: new Date(q.created_at).toLocaleDateString(),
    reward: q.reward_type === 'money' ? `£${q.price}` : `${q.price || 50} pts`,
    category: q.category,
    photoUrl: q.photo_url,
  }));

  return (
    <div className="flex flex-col items-center justify-start p-4 h-full relative overflow-hidden">
      <div className="w-full max-w-sm mb-4">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Discover
        </h2>
        <p className="text-[#34D1BF] font-medium text-sm mt-1">Acts of kindness near you</p>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          <Filter size={14} className="text-gray-500 shrink-0" />
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveFilter(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                activeFilter === cat.value
                  ? 'bg-[#34D1BF]/20 text-[#34D1BF] border-[#34D1BF]'
                  : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-500'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full max-w-sm flex flex-col justify-center items-center">
        {mappedQuests.length > 0 ? (
          <QuestCardGallery initialQuests={mappedQuests} />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 h-96 border-2 border-dashed border-gray-700 rounded-3xl bg-gray-900/50 shadow-xl w-full">
            <h3 className="text-xl font-bold text-white mb-2">No quests found</h3>
            <p className="text-gray-400 text-center mb-4">
              {activeFilter !== 'all'
                ? 'No quests match this category. Try a different filter.'
                : 'Be the first to post a quest!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
