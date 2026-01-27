import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import PlantCard from "../components/PlantCard";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { IoTrash } from "react-icons/io5"; // Solid trash icon for better visibility

export default function SavedPlant() {
  const [savedPlants, setSavedPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getUserAndPlants();
  }, []);

  async function getUserAndPlants() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);

    const { data, error } = await supabase
      .from("saved_plants")
      .select(`
        plant_id (
          *,
          plant_photos (image_url),
          data_contributors (full_name)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setSavedPlants(data.map((item) => item.plant_id).filter(p => p !== null));
    }
    setLoading(false);
  }

  async function handleRemove(plantId) {
    const { error } = await supabase
      .from("saved_plants")
      .delete()
      .eq("user_id", user.id)
      .eq("plant_id", plantId);

    if (!error) {
      setSavedPlants((prev) => prev.filter((p) => p.id !== plantId));
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-[#F2F2F7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F2F2F7] flex flex-col font-sans">
      {/* App Bar */}
      <div className="flex items-center px-4 py-3 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1 -ml-1 text-[#007AFF] active:opacity-50 transition-opacity"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-semibold text-[17px] text-black">
          Saved Plants
        </h1>
        <div className="w-8" />
      </div>

      {/* Main Content */}
      <div className="p-4 overflow-y-auto pb-10">
        {savedPlants.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center px-10">
            <span className="text-6xl mb-4">🌿</span>
            <p className="text-[17px] text-gray-400 font-medium">
              No saved plants yet.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {savedPlants.map((plant) => (
              <div key={plant.id} className="relative">
                {/* The card displays the info */}
                <PlantCard plant={plant} user={user} />
                
                {/* Top Right Remove Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(plant.id);
                  }}
                  className="absolute top-4 right-4 z-30 p-2.5 rounded-full 
                             text-[#FF3B30] 
                             bg-red-50/50 
                             active:bg-[#FF3B30] active:text-white 
                             transition-all duration-200 
                             active:scale-110 shadow-sm"
                  aria-label="Remove plant"
                >
                  <IoTrash size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}