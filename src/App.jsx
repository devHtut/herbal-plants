import { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { supabase } from "./supabaseClient";

// Components & Pages
import Dashboard from "./pages/Dashboard";
import HomeScreen from "./pages/HomeScreen";
import PlantDetail from "./components/PlantDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SideMenu from "./components/SideMenu";
import RequireContributor from "./components/RequireContributor";
import AddPlantInfo from "./pages/AddPlantInfo";
import ContributorProfile from "./pages/ContributorProfile";
import MyContributions from "./pages/MyContributions";
import EditPlantInfo from "./pages/EditPlantInfo";
import ContributorSettings from "./pages/ContributorSetting";
import SavedPlant from "./pages/SavedPlant";
import Contributors from "./pages/Contributors";
import AboutUs from "./pages/AboutUs";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";

function AppContent({ plants, loading, setMenuOpen, user, onRefresh }) {
  const [isContributor, setIsContributor] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsContributor(false);
        setCheckingRole(false);
        return;
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      setIsContributor(data?.role === "contributor");
      setCheckingRole(false);
    };

    checkUserRole();
  }, [user]);

  // Smoother loading UI
  if (checkingRole && user) {
    return (
      <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
    );
  }

  return (
    <Routes>
      {/* Dynamic Root Route */}
      <Route
        path="/"
        element={
          isContributor ? (
            <Dashboard plants={plants} loading={loading} setMenuOpen={setMenuOpen} user={user} onRefresh={onRefresh} />
          ) : (
            <HomeScreen plants={plants} loading={loading} setMenuOpen={setMenuOpen} user={user} onRefresh={onRefresh} />
          )
        }
      />

      {/* Shared Routes */}
      <Route path="/plants/:id" element={<PlantDetail plants={plants} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/setup-profile" element={<ContributorProfile />} />
      <Route path="/saved" element={<SavedPlant />} />
      <Route path="/contributors" element={<Contributors />}></Route>
      <Route path="/about" element={<AboutUs />}></Route>
      <Route path="/verify-otp" element={<VerifyOtp />}></Route>
      <Route path="/forgot-password" element={<ForgotPassword />}></Route>
      <Route path="/update-password" element={<UpdatePassword />}></Route>

      {/* Protected Contributor Routes */}
      <Route path="/add-plant-info" element={<RequireContributor><AddPlantInfo /></RequireContributor>} />
      <Route path="/my-contributions" element={<RequireContributor><MyContributions /></RequireContributor>} />
      <Route path="/edit-plant/:id" element={<RequireContributor><EditPlantInfo /></RequireContributor>} />
      <Route path="/contributor-settings" element={<RequireContributor><ContributorSettings /></RequireContributor>} />
    </Routes>
  );
}

export default function App() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const fetchPlants = async () => {
    const { data } = await supabase
      .from("plants")
      .select(`*, plant_photos (image_url), data_contributors (full_name)`)
      .order("created_at", { ascending: false });
    if (data) setPlants(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlants();
    
    // Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <AppContent
        plants={plants}
        loading={loading}
        setMenuOpen={setMenuOpen}
        user={user}
        onRefresh={fetchPlants}
      />
      {/* SideMenu is outside Routes so it can persist/overlay across all pages */}
      <SideMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </Router>
  );
}