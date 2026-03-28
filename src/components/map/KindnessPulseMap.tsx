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
  const color = status === 'completed' ? '#34D1BF' : '#8B5CF6';
  const pulse = status === 'completed' ?
    `<div style="width:20px;height:20px;background:${color};border-radius:50%;position:absolute;animation:mapPulse 1.5s infinite;"></div>` : '';

  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:20px;height:20px;">
      <div style="width:16px;height:16px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 0 10px ${color}80;position:absolute;top:2px;left:2px;z-index:2;"></div>
      ${pulse}
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
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
    const style = document.createElement('style');
    style.innerHTML = `@keyframes mapPulse { 0% { transform:scale(1); opacity:0.8; } 100% { transform:scale(3); opacity:0; } }`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
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
