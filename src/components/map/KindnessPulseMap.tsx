'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { createClient } from '@/utils/supabase/client';

const CATEGORY_EMOJI: Record<string, string> = {
  shopping: '🛒', delivery: '📦', litter: '🗑️', charity: '💛',
  pothole: '🕳️', elderly: '👴', pet: '🐕', other: '✨',
};

function createMarkerIcon(status: string) {
  const isOpen = status === 'open';
  const color = isOpen ? '#8B5CF6' : '#34D1BF';
  const glow = isOpen ? '#8B5CF680' : '#34D1BF80';

  return L.divIcon({
    className: '',
    html: `
      <div class="gk-marker" style="--c:${color};--g:${glow};">
        <div class="gk-ring gk-ring1"></div>
        <div class="gk-ring gk-ring2"></div>
        <div class="gk-core"></div>
      </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

interface QuestPin {
  id: string;
  title: string;
  category: string;
  lat: number;
  lng: number;
  status: string;
  reward_type: string;
  price: number;
}

export default function KindnessPulseMap() {
  const [quests, setQuests] = useState<QuestPin[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const styleId = 'gk-map-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .gk-marker { position:relative; width:30px; height:30px; }
        .gk-core {
          position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
          width:14px; height:14px; border-radius:50%;
          background:var(--c); border:2px solid white;
          box-shadow:0 0 12px 4px var(--g), 0 0 4px 1px var(--c);
          z-index:3;
        }
        .gk-ring {
          position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) scale(0);
          border-radius:50%; border:2px solid var(--c);
          animation: gkPulse 2s ease-out infinite;
          z-index:1;
        }
        .gk-ring1 { width:30px; height:30px; animation-delay:0s; }
        .gk-ring2 { width:30px; height:30px; animation-delay:0.8s; }
        @keyframes gkPulse {
          0%   { transform:translate(-50%,-50%) scale(0.4); opacity:0.9; }
          100% { transform:translate(-50%,-50%) scale(2.2); opacity:0; }
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const el = document.getElementById(styleId);
      if (el) document.head.removeChild(el);
    };
  }, []);

  useEffect(() => {
    // Fetch quests
    async function fetchQuests() {
      const { data, error } = await supabase
        .from('quests')
        .select('id, title, category, lat, lng, status, reward_type, price');
      if (data) setQuests(data);
      if (error) console.error('Map fetch error:', error);
    }
    fetchQuests();

    // Realtime subscription
    const channel = supabase
      .channel('map-quests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quests' }, (payload) => {
        console.log('Realtime Map Update:', payload);
        fetchQuests(); // Refetch on any change
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={[50.8, -1.09]}
        zoom={13}
        style={{ height: '100%', width: '100%', background: '#0A1628' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {quests.map((q) => (
          <Marker key={q.id} position={[q.lat, q.lng]} icon={createMarkerIcon(q.status)}>
            <Popup>
              <div className="text-gray-900">
                <strong>{CATEGORY_EMOJI[q.category] || '✨'} {q.title}</strong><br />
                <span className="text-gray-600 capitalize">Status: {q.status}</span><br />
                <span className="text-gray-600">
                  {q.reward_type === 'money' ? `£${q.price}` : `${q.price || 50} pts`}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-700 px-4 py-3 z-[1000]">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">Legend</p>
        <div className="flex items-center gap-2 text-xs text-gray-300 mb-1">
          <span className="w-3 h-3 rounded-full bg-[#8B5CF6] inline-block"></span> Open Quest
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <span className="w-3 h-3 rounded-full bg-[#34D1BF] inline-block"></span> Completed
        </div>
      </div>
    </div>
  );
}
