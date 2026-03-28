import Link from 'next/link';
import { Search, PlusCircle, MapPin, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-6 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#34D1BF]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
          Go<span className="text-[#34D1BF]">Kind</span> 🍃
        </h1>
        <p className="text-gray-400 text-lg mb-12 max-w-xs mx-auto">
          Small acts of kindness, big ripples of change.
        </p>

        <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
          <Link
            href="/browse"
            className="flex items-center gap-3 bg-gradient-to-r from-[#34D1BF] to-[#2bb4a4] text-[#0A1628] rounded-2xl px-6 py-5 font-bold text-lg hover:shadow-lg hover:shadow-[#34D1BF]/20 transition-all group"
          >
            <Search size={24} className="group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <span className="block">Find a Quest</span>
              <span className="text-xs font-medium opacity-70">Discover kind deeds near you</span>
            </div>
          </Link>

          <Link
            href="/post"
            className="flex items-center gap-3 bg-gray-800/80 border border-gray-700 text-white rounded-2xl px-6 py-5 font-bold text-lg hover:border-[#34D1BF]/50 hover:bg-gray-800 transition-all group"
          >
            <PlusCircle size={24} className="text-[#34D1BF] group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <span className="block">Post a Quest</span>
              <span className="text-xs font-medium text-gray-400">Ask your community for help</span>
            </div>
          </Link>

          <Link
            href="/map"
            className="flex items-center gap-3 bg-gray-800/80 border border-gray-700 text-white rounded-2xl px-6 py-5 font-bold text-lg hover:border-[#34D1BF]/50 hover:bg-gray-800 transition-all group"
          >
            <MapPin size={24} className="text-[#8B5CF6] group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <span className="block">Kindness Pulse</span>
              <span className="text-xs font-medium text-gray-400">See live quests on the map</span>
            </div>
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-gray-500 text-sm">
          <Sparkles size={14} className="text-[#34D1BF]" />
          <span>Portsmouth&apos;s kindness movement</span>
        </div>
      </div>
    </div>
  );
}
