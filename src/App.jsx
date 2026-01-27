import { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { supabase } from "./supabaseClient";
import PlantCard from "./components/PlantCard";
import SideMenu from "./components/SideMenu";
import PlantDetail from "./components/PlantDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SavedPlant from "./pages/SavedPlant";
import Contributors from "./pages/Contributors";
import About from "./pages/AboutUs";
import ForgotPassword from "./pages/ForgotPassword";
import ConfirmEmail from "./pages/ConfirmEmail";
import CheckEmail from "./pages/CheckEmail";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";
import logoBrand from "./assets/Herbal_Logo.png";
import CheckEmailReset from "./pages/CheckEmailReset";
import RequireContributor from "./components/RequireContributor";
import AddPlantInfo from "./pages/AddPlantInfo";
import ContributorProfile from "./pages/ContributorProfile";
import MyContributions from "./pages/MyContributions";
import EditPlantInfo from "./pages/EditPlantInfo";

import { IoMenu, IoSearch, IoCreate } from "react-icons/io5";
import ContributorSettings from "./pages/ContributorSetting";

function AppContent({ plants, loading, menuOpen, setMenuOpen, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isContributor, setIsContributor] = useState(false);

  useEffect(() => {
    const checkProfileStatus = async (currentUser) => {
      if (!currentUser) {
        setIsContributor(false);
        return;
      }

      const { data, error } = await supabase
        .from("data_contributors")
        .select("id")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (!data && !error && location.pathname !== "/setup-profile") {
        navigate("/setup-profile");
      } else if (data) {
        setIsContributor(true);
      }
    };

    checkProfileStatus(user);
  }, [user, location.pathname, navigate]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomeScreen
            plants={plants}
            loading={loading}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            user={user}
            isContributor={isContributor}
          />
        }
      />
      <Route path="/plants/:id" element={<PlantDetail plants={plants} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/saved" element={<SavedPlant />} />
      <Route path="/contributors" element={<Contributors />} />
      <Route path="/about" element={<About />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route
        path="/reset-password-confirm"
        element={<ResetPasswordConfirm />}
      />
      <Route path="/check-email-reset" element={<CheckEmailReset />} />
      <Route path="/setup-profile" element={<ContributorProfile />} />
      <Route
        path="/add-plant-info"
        element={
          <RequireContributor>
            <AddPlantInfo />
          </RequireContributor>
        }
      />
      <Route path="/my-contributions" element={<MyContributions />} />
      <Route
        path="/edit-plant/:id"
        element={
          <RequireContributor>
            <EditPlantInfo />
          </RequireContributor>
        }
      />
      <Route path="/contributor-settings" element={<ContributorSettings />} />
    </Routes>
  );
}

export default function App() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchPlants();
    const checkInitialUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkInitialUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchPlants() {
    const { data, error } = await supabase
      .from("plants")
      .select(`*, plant_photos (image_url), data_contributors (full_name)`)
      .order("created_at", { ascending: false });
    if (!error) setPlants(data);
    setLoading(false);
  }

  return (
    <Router>
      <AppContent
        plants={plants}
        loading={loading}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        user={user}
      />
      <SideMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </Router>
  );
}

function HomeScreen({
  plants,
  loading,
  menuOpen,
  setMenuOpen,
  user,
  isContributor,
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredPlants = plants.filter(
    (p) =>
      p.myanmar_name?.includes(search) ||
      p.english_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.scientific_name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative h-screen bg-[#F2F2F7] flex flex-col font-sans">
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200">
        <div className="flex justify-between items-center px-4 pt-4 pb-2">
          <h1 className="flex items-center">
            <img
              src={logoBrand}
              alt="Herb"
              className="h-[38px] w-auto object-contain"
            />
          </h1>
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 text-[#007AFF] active:opacity-50"
          >
            <IoMenu size={28} />
          </button>
        </div>
        <div className="px-4 pb-3">
          <div className="relative flex items-center">
            <IoSearch className="absolute left-3 text-gray-500" size={18} />
            <input
              placeholder="Search plants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-200/60 py-2.5 pl-10 pr-4 rounded-[12px] text-[17px] focus:outline-none placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex-1 overflow-y-auto">
        {loading ? (
          <div className="h-screen bg-[#F2F2F7] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Loading...</p>
            </div>
          </div>
        ) : (
          <div className="pb-24">
            {filteredPlants.length > 0 ? (
              filteredPlants.map((plant) => (
                <PlantCard key={plant.id} plant={plant} user={user} />
              ))
            ) : (
              <p className="text-center text-gray-500 mt-10">No plants found</p>
            )}
          </div>
        )}
      </div>

      {/* Floating Post Button - Contributor Only */}
      {isContributor && (
        <button
          onClick={() => navigate("/add-plant-info")}
          className="fixed bottom-8 right-6 w-14 h-14 bg-[#007AFF] text-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform z-30"
        >
          <IoCreate size={28} />
        </button>
      )}
    </div>
  );
}
