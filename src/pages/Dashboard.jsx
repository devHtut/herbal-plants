import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { IoMenu, IoSearch, IoCreate, IoRefresh } from "react-icons/io5";
import PlantCard from "../components/PlantCard";
import logoBrand from "../assets/Herbal_Logo.png";

export default function Dashboard({ plants, loading, setMenuOpen, user, onRefresh }) {
  const navigate = useNavigate();
  const [isProfileReady, setIsProfileReady] = useState(false);
  
  // Search and Refresh states
  const [search, setSearch] = useState("");
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const scrollContainerRef = useRef(null);
  const startY = useRef(0);

  useEffect(() => {
  const checkProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("data_contributors")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!data) {
      // No profile found, send them to setup
      navigate("/setup-profile", { replace: true });
    } else {
      // Profile found! Now we can show the Dashboard
      setIsProfileReady(true); 
    }
  };

  checkProfile();
}, [user, navigate]);

  const filteredPlants = plants.filter((p) =>
    p.myanmar_name?.includes(search) ||
    p.english_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.scientific_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Pull to refresh logic...
  const handleTouchStart = (e) => { if (scrollContainerRef.current?.scrollTop === 0) startY.current = e.touches[0].clientY; };
  const handleTouchMove = (e) => {
    if (scrollContainerRef.current?.scrollTop === 0) {
      const diff = e.touches[0].clientY - startY.current;
      if (diff > 0 && !refreshing) setPullY(Math.min(diff * 0.5, 120));
    }
  };
  const handleTouchEnd = async () => {
    if (pullY > 60) {
      setRefreshing(true); setPullY(60);
      await onRefresh();
      setRefreshing(false); setPullY(0);
    } else { setPullY(0); }
  };

  if (!isProfileReady) return <div className="h-screen flex items-center justify-center">Verifying Profile...</div>;

  return (
    <div className="relative h-screen bg-[#F2F2F7] flex flex-col font-sans">
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200">
        <div className="flex justify-between items-center px-4 pt-4 pb-2">
          <img src={logoBrand} alt="Herb" className="h-[38px] w-auto" />
          <button onClick={() => setMenuOpen(true)} className="p-2 text-[#007AFF]"><IoMenu size={28} /></button>
        </div>
        <div className="px-4 pb-3">
          <div className="relative flex items-center">
            <IoSearch className="absolute left-3 text-gray-500" size={18} />
            <input 
              placeholder="Search plants..." 
              className="w-full bg-gray-200/60 py-2.5 pl-10 pr-4 rounded-[12px]"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div ref={scrollContainerRef} className="px-4 pt-4 flex-1 overflow-y-auto" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <div className="flex justify-center transition-transform" style={{ transform: `translateY(${pullY}px)` }}>
           {refreshing ? <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
        </div> : pullY > 10 && <IoRefresh className="text-[#007AFF]" />}
        </div>
        <div style={{ transform: `translateY(${pullY}px)` }} className="pb-24">
          {loading ? <p className="text-center">Loading plants...</p> : filteredPlants.map(p => <PlantCard key={p.id} plant={p} user={user} />)}
        </div>
      </div>

      <button onClick={() => navigate("/add-plant-info")} className="fixed bottom-8 right-6 w-14 h-14 bg-[#007AFF] text-white rounded-full shadow-xl flex items-center justify-center z-30">
        <IoCreate size={28} />
      </button>
    </div>
  );
}