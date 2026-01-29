import { useEffect, useState, useRef } from "react";
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
import VerifyOtp from "./pages/VerifyOtp";
import UpdatePassword from "./pages/UpdatePassword";

import { IoMenu, IoSearch, IoCreate, IoRefresh } from "react-icons/io5";
import ContributorSettings from "./pages/ContributorSetting";

function AppContent({ plants, loading, menuOpen, setMenuOpen, user, onRefresh }) {
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
            onRefresh={onRefresh}
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
      {/* <Route path="/confirm-email" element={<ConfirmEmail />} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route
        path="/reset-password-confirm"
        element={<ResetPasswordConfirm />}
      /> */}
      {/* <Route path="/check-email-reset" element={<CheckEmailReset />} /> */}
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
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/update-password" element={<UpdatePassword />} />
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

    // Auth Subscription
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // REALTIME SUBSCRIPTION FOR AUTO REFRESH
    // This listens for INSERT, UPDATE, or DELETE on the 'plants' table
    const plantSubscription = supabase
      .channel('public:plants')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'plants' },
        (payload) => {
          console.log('Realtime update received:', payload);
          fetchPlants(); // Auto-refresh when data changes
        }
      )
      .subscribe();

    return () => {
      authSubscription.unsubscribe();
      supabase.removeChannel(plantSubscription);
    };
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
        onRefresh={fetchPlants}
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
  onRefresh,
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  
  // Pull to refresh states
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const scrollContainerRef = useRef(null);
  const startY = useRef(0);

  const filteredPlants = plants.filter(
    (p) =>
      p.myanmar_name?.includes(search) ||
      p.english_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.scientific_name?.toLowerCase().includes(search.toLowerCase()),
  );

  // --- Pull to Refresh Logic ---
  const handleTouchStart = (e) => {
    // Only enable pull if we are at the top of the list
    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop === 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      
      // If pulling down (diff > 0)
      if (diff > 0 && !refreshing) {
        // Logarithmic resistance for a natural feel
        const resistance = diff * 0.5; 
        // Cap the pull distance visually
        setPullY(Math.min(resistance, 120)); 
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullY > 60) { // Threshold to trigger refresh
      setRefreshing(true);
      setPullY(60); // Snap to loading position
      try {
        await onRefresh(); // Call the refresh function passed from App
      } catch (error) {
        console.error("Refresh failed", error);
      } finally {
        setTimeout(() => {
          setRefreshing(false);
          setPullY(0);
        }, 500); // Small delay for UX
      }
    } else {
      setPullY(0); // Snap back if not pulled enough
    }
  };

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

      {/* Main Content Area with Pull-to-Refresh */}
      <div 
        ref={scrollContainerRef}
        className="px-4 pt-4 flex-1 overflow-y-auto relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull to Refresh Indicator */}
        <div 
          className="absolute top-0 left-0 w-full flex justify-center items-center pointer-events-none transition-transform duration-200"
          style={{ 
            height: '60px', 
            marginTop: '-60px',
            transform: `translateY(${pullY}px)`,
            opacity: pullY > 0 ? 1 : 0
          }}
        >
          {refreshing ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#007AFF]"></div>
          ) : (
            <div className={`text-[#007AFF] transition-transform duration-200 ${pullY > 60 ? 'rotate-180' : ''}`}>
              <IoRefresh size={24} />
            </div>
          )}
        </div>

        {/* List Content */}
        <div 
          style={{ transform: `translateY(${pullY}px)`, transition: refreshing ? 'transform 0.2s' : 'none' }}
        >
          {loading ? (
            <div className="h-[60vh] flex items-center justify-center">
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