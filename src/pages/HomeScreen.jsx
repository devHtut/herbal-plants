import { useState, useRef } from "react";
import { IoMenu, IoSearch, IoRefresh } from "react-icons/io5";
import PlantCard from "../components/PlantCard";
import logoBrand from "../assets/Herbal_Logo.png";

export default function HomeScreen({ plants, loading, setMenuOpen, user, onRefresh }) {
  const [search, setSearch] = useState("");
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const scrollContainerRef = useRef(null);
  const startY = useRef(0);

  const filteredPlants = plants.filter((p) =>
    p.myanmar_name?.includes(search) ||
    p.english_name?.toLowerCase().includes(search.toLowerCase())
  );

  // --- Pull to Refresh Logic Start ---
  const handleTouchStart = (e) => {
    // Only trigger if we are at the very top of the scroll container
    if (scrollContainerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (scrollContainerRef.current?.scrollTop === 0) {
      const diff = e.touches[0].clientY - startY.current;
      // If dragging down and not already refreshing
      if (diff > 0 && !refreshing) {
        // Apply resistance (0.5) so it doesn't move 1:1 with finger
        setPullY(Math.min(diff * 0.5, 100));
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullY > 60) {
      setRefreshing(true);
      setPullY(40); // Hang at 40px while loading
      if (onRefresh) await onRefresh();
      setRefreshing(false);
      setPullY(0);
    } else {
      setPullY(0);
    }
  };
  // --- Pull to Refresh Logic End ---

  return (
    <div className="relative h-screen bg-[#F2F2F7] flex flex-col font-sans overflow-hidden">
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200">
        <div className="flex justify-between items-center px-4 pt-4 pb-2">
          <img src={logoBrand} alt="Herb" className="h-[38px] w-auto" />
          <button onClick={() => setMenuOpen(true)} className="p-2 text-[#007AFF] active:opacity-50">
            <IoMenu size={28} />
          </button>
        </div>
        <div className="px-4 pb-3">
          <div className="relative flex items-center">
            <IoSearch className="absolute left-3 text-gray-500" size={18} />
            <input 
              placeholder="Search plants..." 
              className="w-full bg-gray-200/60 py-2.5 pl-10 pr-4 rounded-[12px] focus:outline-none focus:bg-gray-200/80 transition-colors"
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div 
        ref={scrollContainerRef} 
        className="flex-1 overflow-y-auto px-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Refresh Indicator */}
        <div 
          className="flex justify-center overflow-hidden transition-all duration-200 ease-out"
          style={{ height: pullY > 0 ? `${pullY}px` : '0px' }}
        >
          <div className="flex items-center justify-center">
            {refreshing ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#007AFF]" />
            ) : (
              <IoRefresh 
                className={`text-[#007AFF] transition-transform duration-200 ${pullY > 50 ? 'rotate-180' : 'rotate-0'}`} 
                size={24} 
              />
            )}
          </div>
        </div>

        {/* Plant List */}
        <div 
          className="pb-24 transition-transform duration-200 ease-out"
          style={{ transform: pullY > 0 && !refreshing ? `translateY(10px)` : 'none' }}
        >
          {loading && !refreshing ? (
            <div className="flex flex-col items-center justify-center mt-20">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF] mb-2"></div>
               <p className="text-gray-400 text-sm">Loading plants...</p>
            </div>
          ) : filteredPlants.length > 0 ? (
            filteredPlants.map(p => <PlantCard key={p.id} plant={p} user={user} />)
          ) : (
            <p className="text-center text-gray-400 mt-20">No plants found.</p>
          )}
        </div>
      </div>
    </div>
  );
}