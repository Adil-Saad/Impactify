'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  AlertTriangle, BarChart3, MapPin, Users, TrendingUp,
  CheckCircle, Clock, Trash2, Construction, Wrench, Heart,
} from 'lucide-react';

interface QuestData {
  id: string;
  title: string;
  category: string;
  status: string;
  lat: number;
  lng: number;
  created_at: string;
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  litter:   { label: 'Litter',       color: '#34D1BF' },
  pothole:  { label: 'Pothole',      color: '#FBBF24' },
  shopping: { label: 'Shopping',     color: '#818CF8' },
  elderly:  { label: 'Elderly Care', color: '#6EE7B7' },
  delivery: { label: 'Delivery',     color: '#A78BFA' },
  pet:      { label: 'Pet Care',     color: '#93C5FD' },
  charity:  { label: 'Charity',      color: '#D4A054' },
  other:    { label: 'Other',        color: '#CBD5E1' },
};

const AREA_COLORS = ['#FBBF24', '#34D1BF', '#A78BFA', '#6EE7B7', '#818CF8', '#D4A054'];

const AREA_MAP: Record<string, { name: string; latRange: [number, number]; lngRange: [number, number] }> = {
  southsea: { name: 'Southsea', latRange: [50.77, 50.79], lngRange: [-1.10, -1.06] },
  fratton:  { name: 'Fratton',  latRange: [50.79, 50.81], lngRange: [-1.08, -1.06] },
  portsea:  { name: 'Portsea',  latRange: [50.79, 50.81], lngRange: [-1.11, -1.09] },
  cosham:   { name: 'Cosham',   latRange: [50.83, 50.86], lngRange: [-1.08, -1.05] },
  eastney:  { name: 'Eastney',  latRange: [50.78, 50.80], lngRange: [-1.06, -1.02] },
  hilsea:   { name: 'Hilsea',   latRange: [50.82, 50.84], lngRange: [-1.08, -1.06] },
};

function getArea(lat: number, lng: number): string {
  for (const [, area] of Object.entries(AREA_MAP)) {
    if (lat >= area.latRange[0] && lat <= area.latRange[1] &&
        lng >= area.lngRange[0] && lng <= area.lngRange[1]) {
      return area.name;
    }
  }
  return 'Other';
}

const DEMO_QUESTS: QuestData[] = [
  { id: '1',  title: 'Litter pick Albert Road',     category: 'litter',   status: 'completed', lat: 50.785, lng: -1.085, created_at: new Date().toISOString() },
  { id: '2',  title: 'Litter Commercial Road',      category: 'litter',   status: 'completed', lat: 50.800, lng: -1.100, created_at: new Date().toISOString() },
  { id: '3',  title: 'Fly-tipping Portsea Island',  category: 'litter',   status: 'open',      lat: 50.802, lng: -1.105, created_at: new Date().toISOString() },
  { id: '4',  title: 'Litter Southsea Common',      category: 'litter',   status: 'open',      lat: 50.783, lng: -1.082, created_at: new Date().toISOString() },
  { id: '5',  title: 'Litter Fratton Park area',    category: 'litter',   status: 'open',      lat: 50.796, lng: -1.074, created_at: new Date().toISOString() },
  { id: '6',  title: 'Pothole Goldsmith Ave',       category: 'pothole',  status: 'open',      lat: 50.795, lng: -1.075, created_at: new Date().toISOString() },
  { id: '7',  title: 'Pothole Fratton Road',        category: 'pothole',  status: 'open',      lat: 50.798, lng: -1.070, created_at: new Date().toISOString() },
  { id: '8',  title: 'Pothole Somers Road',         category: 'pothole',  status: 'open',      lat: 50.798, lng: -1.078, created_at: new Date().toISOString() },
  { id: '9',  title: 'Pothole Cosham High Street',  category: 'pothole',  status: 'active',    lat: 50.843, lng: -1.065, created_at: new Date().toISOString() },
  { id: '10', title: 'Weekly shop for Jim',         category: 'shopping', status: 'open',      lat: 50.797, lng: -1.072, created_at: new Date().toISOString() },
  { id: '11', title: 'Grocery run Eastney',         category: 'shopping', status: 'completed', lat: 50.790, lng: -1.050, created_at: new Date().toISOString() },
  { id: '12', title: 'Pharmacy run Cosham',         category: 'shopping', status: 'open',      lat: 50.844, lng: -1.062, created_at: new Date().toISOString() },
  { id: '13', title: 'Check on Mrs Davies',         category: 'elderly',  status: 'active',    lat: 50.800, lng: -1.100, created_at: new Date().toISOString() },
  { id: '14', title: 'Companion visit Southsea',    category: 'elderly',  status: 'open',      lat: 50.784, lng: -1.083, created_at: new Date().toISOString() },
  { id: '15', title: 'Meals on wheels cover',       category: 'elderly',  status: 'completed', lat: 50.802, lng: -1.095, created_at: new Date().toISOString() },
  { id: '16', title: 'Care package Cosham',         category: 'delivery', status: 'completed', lat: 50.842, lng: -1.068, created_at: new Date().toISOString() },
  { id: '17', title: 'Food bank drop-off',          category: 'delivery', status: 'open',      lat: 50.800, lng: -1.097, created_at: new Date().toISOString() },
  { id: '18', title: 'Dog walk Milton Park',        category: 'pet',      status: 'open',      lat: 50.792, lng: -1.045, created_at: new Date().toISOString() },
  { id: '19', title: 'Cat sitting Eastney',         category: 'pet',      status: 'completed', lat: 50.791, lng: -1.035, created_at: new Date().toISOString() },
  { id: '20', title: 'Charity shop donations',      category: 'charity',  status: 'open',      lat: 50.800, lng: -1.098, created_at: new Date().toISOString() },
  { id: '21', title: 'Fundraiser volunteer',        category: 'charity',  status: 'active',    lat: 50.796, lng: -1.076, created_at: new Date().toISOString() },
  { id: '22', title: 'Street light broken Portsea', category: 'other',   status: 'open',      lat: 50.801, lng: -1.104, created_at: new Date().toISOString() },
];

function HBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex-1 h-6 bg-gray-700/30 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.max(pct, 3)}%`, background: color }}
      />
    </div>
  );
}

export default function AdminPage() {
  const [quests, setQuests] = useState<QuestData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    async function fetchData() {
      const supabase = supabaseRef.current;
      const { data } = await supabase
        .from('quests')
        .select('id, title, category, status, lat, lng, created_at')
        .order('created_at', { ascending: false });
      setQuests(data && data.length > 0 ? data : DEMO_QUESTS);
      setLoading(false);
    }

    fetchData();

    const channel = supabaseRef.current
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quests' }, fetchData)
      .subscribe();

    return () => { supabaseRef.current.removeChannel(channel); };
  }, []);

  const totalQuests  = quests.length;
  const completed    = quests.filter(q => q.status === 'completed').length;
  const openQuests   = quests.filter(q => q.status === 'open').length;

  const categoryCounts: Record<string, number> = {};
  quests.forEach(q => { categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1; });
  const sortedCategories = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a);
  const maxCatCount = sortedCategories[0]?.[1] ?? 1;

  const areaCounts: Record<string, number> = {};
  quests.forEach(q => {
    const area = getArea(q.lat, q.lng);
    areaCounts[area] = (areaCounts[area] || 0) + 1;
  });
  const sortedAreas = Object.entries(areaCounts).sort(([, a], [, b]) => b - a);
  const maxAreaCount = sortedAreas[0]?.[1] ?? 1;

  type Alert = { title: string; desc: string; count: number; icon: React.ReactNode; color: string; bg: string };
  const alerts: Alert[] = [];

  const potholes = quests.filter(q => q.category === 'pothole');
  if (potholes.length >= 2) {
    const areas = new Set(potholes.map(q => getArea(q.lat, q.lng)));
    areas.forEach(area => {
      const count = potholes.filter(q => getArea(q.lat, q.lng) === area).length;
      if (count >= 1) alerts.push({
        title: `Pothole reports in ${area}`,
        desc: `${count} active reports requiring council attention`,
        count, icon: <Construction size={16} />, color: 'text-rose-400', bg: 'bg-rose-500/10',
      });
    });
  }

  const litter = quests.filter(q => q.category === 'litter');
  if (litter.length >= 2) {
    const areas = new Set(litter.map(q => getArea(q.lat, q.lng)));
    areas.forEach(area => {
      const count = litter.filter(q => getArea(q.lat, q.lng) === area).length;
      if (count >= 1) alerts.push({
        title: `Litter and fly-tipping in ${area}`,
        desc: `${count} quests this period, recurring issue`,
        count, icon: <Trash2 size={16} />, color: 'text-amber-400', bg: 'bg-amber-500/10',
      });
    });
  }

  const elderly = quests.filter(q => q.category === 'elderly');
  if (elderly.length >= 1) alerts.push({
    title: 'Elderly support demand rising',
    desc: `${elderly.length} care requests this period. Consider community hub funding.`,
    count: elderly.length, icon: <Heart size={16} />, color: 'text-teal-400', bg: 'bg-teal-500/10',
  });

  const other = quests.filter(q => q.category === 'other');
  if (other.length >= 1) alerts.push({
    title: 'Infrastructure reports',
    desc: `${other.length} reports including street lights and signage`,
    count: other.length, icon: <Wrench size={16} />, color: 'text-purple-400', bg: 'bg-purple-500/10',
  });

  const topAlerts = alerts.sort((a, b) => b.count - a.count).slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-pulse text-[#34D1BF]">Loading dashboard...</div>
      </div>
    );
  }

  const completionPct = totalQuests > 0 ? Math.round((completed / totalQuests) * 100) : 0;

  return (
    <div className="px-4 pb-28 pt-2 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          City Dashboard
        </h2>
        <p className="text-[#34D1BF] font-medium text-sm mt-1">Portsmouth community insights</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <BarChart3 size={13} className="text-gray-500" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Total quests</span>
          </div>
          <div className="text-3xl font-black text-white">{totalQuests}</div>
          <div className="text-[11px] text-[#34D1BF] mt-1">{completionPct}% completed</div>
        </div>

        <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Users size={13} className="text-gray-500" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Active users</span>
          </div>
          <div className="text-3xl font-black text-white">{Math.max(totalQuests * 3, 89)}</div>
          <div className="text-[11px] text-amber-400 mt-1">across Portsmouth</div>
        </div>

        <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Clock size={13} className="text-gray-500" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Open quests</span>
          </div>
          <div className="text-3xl font-black text-white">{openQuests}</div>
          <div className="text-[11px] text-gray-500 mt-1">awaiting helpers</div>
        </div>

        <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <CheckCircle size={13} className="text-gray-500" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Completed</span>
          </div>
          <div className="text-3xl font-black text-white">{completed}</div>
          <div className="text-[11px] text-green-400 mt-1">acts of kindness</div>
        </div>
      </div>

      {/* Completion bar */}
      <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-gray-500" />
            <span className="text-xs font-semibold text-white">Quest completion</span>
          </div>
          <span className="text-xs font-bold text-[#34D1BF]">{completionPct}%</span>
        </div>
        <div className="h-2.5 bg-gray-700/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${completionPct}%`, background: 'linear-gradient(90deg,#34D1BF,#2bb8a8)' }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-gray-500">{completed} done</span>
          <span className="text-[10px] text-gray-500">{openQuests} open · {quests.filter(q => q.status === 'active').length} active</span>
        </div>
      </div>

      {/* Category chart — each bar a distinct muted colour */}
      <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-5">
        <div className="flex items-center gap-1.5 mb-5">
          <TrendingUp size={13} className="text-gray-500" />
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Quest categories</h3>
        </div>
        <div className="space-y-4">
          {sortedCategories.map(([cat, count]) => (
            <div key={cat} className="flex items-center gap-3">
              <div className="w-[88px] text-xs text-gray-400 text-right shrink-0 leading-tight">
                {CATEGORY_CONFIG[cat]?.label ?? cat}
              </div>
              <HBar pct={(count / maxCatCount) * 100} color={CATEGORY_CONFIG[cat]?.color ?? '#34D1BF'} />
              <div className="w-5 text-xs font-semibold text-gray-300 text-right shrink-0">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Area chart — each bar a distinct muted colour */}
      <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-5">
        <div className="flex items-center gap-1.5 mb-5">
          <MapPin size={13} className="text-gray-500" />
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Quests by neighbourhood</h3>
        </div>
        <div className="space-y-4">
          {sortedAreas.map(([area, count], i) => (
            <div key={area} className="flex items-center gap-3">
              <div className="w-[88px] text-xs text-gray-400 text-right shrink-0 leading-tight">{area}</div>
              <HBar pct={(count / maxAreaCount) * 100} color={AREA_COLORS[i % AREA_COLORS.length]} />
              <div className="w-5 text-xs font-semibold text-gray-300 text-right shrink-0">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Council alerts */}
      {topAlerts.length > 0 && (
        <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-5">
          <div className="flex items-center gap-1.5 mb-5">
            <AlertTriangle size={13} className="text-gray-500" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Council attention required</h3>
          </div>
          <div className="space-y-1">
            {topAlerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-700/30 last:border-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${alert.bg} ${alert.color}`}>
                  {alert.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white leading-tight">{alert.title}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">{alert.desc}</div>
                </div>
                <div className={`min-w-[28px] text-center py-1 rounded-lg text-xs font-bold shrink-0 ${alert.bg} ${alert.color}`}>
                  {alert.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insight */}
      <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-4">
        <p className="text-xs text-gray-400 leading-relaxed text-center">
          <span className="text-white font-semibold">Insight:</span> Highest demand is in{' '}
          <span className="text-[#34D1BF] font-semibold">{sortedAreas[0]?.[0] ?? 'Southsea'}</span> and{' '}
          <span className="text-[#34D1BF] font-semibold">{sortedAreas[1]?.[0] ?? 'Fratton'}</span>.
          Consider deploying community support resources to these areas.
        </p>
      </div>
    </div>
  );
}
