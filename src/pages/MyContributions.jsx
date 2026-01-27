import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import PlantCard from "../components/PlantCard";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { IoLeafOutline } from "react-icons/io5";

export default function MyContributions() {
  const [myPlants, setMyPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getUserAndContributions();
  }, []);

  async function getUserAndContributions() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);

    // Fetch plants where contributor_id matches current user
    const { data, error } = await supabase
      .from("plants")
      .select(`
        *,
        plant_photos (image_url),
        data_contributors (full_name)
      `)
      .eq("contributor_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setMyPlants(data);
    }
    setLoading(false);
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
          My Contributions
        </h1>
        <div className="w-8" /> {/* Balance spacer */}
      </div>

      {/* Main Content */}
      <div className="p-4 overflow-y-auto pb-10">
        {myPlants.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center px-10">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <IoLeafOutline size={40} className="text-gray-300" />
            </div>
            <p className="text-[17px] text-gray-500 font-semibold mb-1">
              No contributions yet.
            </p>
            <p className="text-[14px] text-gray-400">
              သင်ထည့်သွင်းထားတဲ့ အပင်အချက်အလက်တွေကို 
              ဒီ Page မှာပြန်ကြည့်ရှုနိုင်ပါသည်
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {myPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}