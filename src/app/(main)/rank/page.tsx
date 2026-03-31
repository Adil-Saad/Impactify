'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { TrendingUp, TrendingDown, Trophy, Gift, Clock, Ticket, Users } from 'lucide-react';

interface LeaderEntry {
  id: string;
  username: string | null;
  points: number;
}

const DEMO_LEADERS: LeaderEntry[] = [
  { id: '1', username: 'Sarah M.', points: 580 },
  { id: '2', username: 'Raj P.', points: 470 },
  { id: '3', username: 'Donna K.', points: 425 },
  { id: '4', username: 'Tom W.', points: 350 },
  { id: '5', username: 'Aisha H.', points: 310 },
  { id: '6', username: 'Mike R.', points: 260 },
  { id: '7', username: 'Jenny L.', points: 210 },
  { id: '8', username: 'Chris B.', points: 180 },
  { id: '9', username: 'Priya S.', points: 155 },
  { id: '10', username: 'James O.', points: 130 },
];

const AVATARS = ['👩‍🦰', '👨', '👩', '👨‍🦱', '🧕', '👨‍🦳', '👩‍🦱', '🧑‍💻', '👩‍🎤', '👨‍🎨'];

// Ring colors for top 3
const RING_COLORS = [
  'ring-amber-400 shadow-[0_0_20px_4px_rgba(251,191,36,0.3)]',   // 1st - gold
  'ring-blue-400 shadow-[0_0_16px_4px_rgba(96,165,250,0.25)]',    // 2nd - blue
  'ring-emerald-400 shadow-[0_0_16px_4px_rgba(52,211,153,0.25)]', // 3rd - green
];
const POINT_COLORS = ['text-amber-400', 'text-blue-400', 'text-emerald-400'];

export default function RankPage() {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [tab, setTab] = useState<'weekly' | 'alltime'>('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function fetch() {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, points')
        .order('points', { ascending: false })
        .limit(20);
      setLeaders(data && data.length > 3 ? data : DEMO_LEADERS);
      setLoading(false);
    }
    fetch();
  }, []);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-pulse text-[#34D1BF]">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <div className="px-5 pt-3">
        {/* Split layout: stacks on mobile, side-by-side on wider screens */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* LEFT COLUMN — Weekly Draw (always visible) */}
          <div className="lg:w-[340px] shrink-0">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 rounded-2xl p-5 relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#34D1BF]/5 rounded-full blur-2xl" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <Gift size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Weekly Draw</div>
                  </div>
                </div>

                {/* Prize */}
                <div className="bg-gray-900/60 rounded-xl p-4 mb-4 border border-amber-500/10">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎁</div>
                    <h3 className="text-lg font-bold text-white leading-tight">£100 Gunwharf Quays</h3>
                    <p className="text-xs text-gray-400 mt-1">Voucher</p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed mb-4 text-center">
                  Every completed quest earns one entry into the weekly prize draw.
                </p>

                {/* Stats */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between py-2 border-b border-gray-700/30">
                    <span className="text-xs text-gray-400 flex items-center gap-2">
                      <Users size={12} className="text-gray-500" /> Total entries
                    </span>
                    <span className="text-sm font-bold text-amber-400">142</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-700/30">
                    <span className="text-xs text-gray-400 flex items-center gap-2">
                      <Ticket size={12} className="text-gray-500" /> Your entries
                    </span>
                    <span className="text-sm font-bold text-[#34D1BF]">3</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-700/30">
                    <span className="text-xs text-gray-400 flex items-center gap-2">
                      <Trophy size={12} className="text-gray-500" /> Your odds
                    </span>
                    <span className="text-sm font-bold text-white">1 in 47</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-gray-400 flex items-center gap-2">
                      <Clock size={12} className="text-gray-500" /> Draw in
                    </span>
                    <span className="text-sm font-bold text-white">3d 14h</span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-500 mt-4 text-center leading-relaxed">
                  Winners are selected randomly each Monday. Participate by completing quests in Portsmouth.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Leaderboard */}
          <div className="flex-1 min-w-0">
            {/* Header + Tabs */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
                <p className="text-[#34D1BF] text-sm font-medium mt-0.5">Top helpers in Portsmouth</p>
              </div>
            </div>

            <div className="flex bg-gray-800/80 rounded-xl p-1 mb-5">
              <button
                onClick={() => setTab('weekly')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === 'weekly' ? 'bg-[#34D1BF] text-[#0A1628]' : 'text-gray-400 hover:text-white'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTab('alltime')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === 'alltime' ? 'bg-[#34D1BF] text-[#0A1628]' : 'text-gray-400 hover:text-white'
                }`}
              >
                All Time
              </button>
            </div>

            {/* Top 3 — circular avatars with colored rings, no stands */}
            {top3.length >= 3 && (
              <div className="flex items-end justify-center gap-6 mb-6 pt-4">
                {/* 2nd */}
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full bg-gray-800 ring-[3px] ${RING_COLORS[1]} flex items-center justify-center text-2xl relative`}>
                    {AVATARS[1]}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0A1628]">2</div>
                  </div>
                  <div className="text-sm font-bold text-white mt-2 text-center">{top3[1].username}</div>
                  <div className={`text-xs font-bold ${POINT_COLORS[1]}`}>{top3[1].points} pts</div>
                </div>

                {/* 1st */}
                <div className="flex flex-col items-center -mt-4">
                  <div className="text-2xl mb-1">👑</div>
                  <div className={`w-20 h-20 rounded-full bg-gray-800 ring-[3px] ${RING_COLORS[0]} flex items-center justify-center text-3xl relative`}>
                    {AVATARS[0]}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-[#0A1628] text-[10px] font-bold flex items-center justify-center border-2 border-[#0A1628]">1</div>
                  </div>
                  <div className="text-sm font-bold text-white mt-2 text-center">{top3[0].username}</div>
                  <div className={`text-sm font-bold ${POINT_COLORS[0]}`}>{top3[0].points}</div>
                  <div className="text-[10px] text-gray-500">@{top3[0].username?.toLowerCase().replace(/\s/g, '')}</div>
                </div>

                {/* 3rd */}
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full bg-gray-800 ring-[3px] ${RING_COLORS[2]} flex items-center justify-center text-2xl relative`}>
                    {AVATARS[2]}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0A1628]">3</div>
                  </div>
                  <div className="text-sm font-bold text-white mt-2 text-center">{top3[2].username}</div>
                  <div className={`text-xs font-bold ${POINT_COLORS[2]}`}>{top3[2].points} pts</div>
                </div>
              </div>
            )}

            {/* Your Position */}
            <div className="bg-[#34D1BF]/8 border border-[#34D1BF]/15 rounded-xl px-4 py-3 flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-300">Your Position</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#34D1BF] bg-[#34D1BF]/15 px-3 py-1 rounded-lg">Unranked</span>
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <TrendingUp size={14} className="text-[#34D1BF]" /> -- pts
                </span>
              </div>
            </div>

            {/* Rest of leaderboard */}
            <div className="space-y-2">
              {rest.map((entry, i) => {
                const rank = i + 4;
                const trending = entry.points > 200;
                return (
                  <div key={entry.id} className="bg-gray-800/40 border border-gray-700/40 rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-gray-800/60 transition-colors">
                    <div className="w-8 text-center text-sm font-bold text-gray-500">{rank}.</div>
                    <div className="w-10 h-10 rounded-full bg-gray-700/60 border border-gray-600/40 flex items-center justify-center text-lg">
                      {AVATARS[(rank - 1) % AVATARS.length]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">{entry.username || 'Anonymous'}</div>
                      <div className="text-[11px] text-gray-500">{Math.floor(entry.points / 20)} quests</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[#34D1BF]">{entry.points}</span>
                      {trending ? (
                        <TrendingUp size={13} className="text-[#34D1BF]" />
                      ) : (
                        <TrendingDown size={13} className="text-rose-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
