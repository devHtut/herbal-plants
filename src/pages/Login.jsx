import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import {
  IoChevronBack,
  IoMailOutline,
  IoLockClosedOutline,
  IoCheckmarkCircleOutline,
  IoHeart,
} from "react-icons/io5";
import leafIcon from "../assets/Herbal_Icon.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // popup states
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeRole, setWelcomeRole] = useState(null); // "user" | "contributor"

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    // 1. Validation
    if (!validateEmail(email)) {
      setError("Valid ဖြစ်တဲ့ email address ကိုသာထည့်ပေးပါ");
      return;
    }

    if (password.length < 6) {
      setError("Password အနည်းဆုံး ၆ လုံးထည့်ပေးပါ");
      return;
    }

    setLoading(true);

    // 2. Sign in
    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (loginError) {
      if (loginError.message.includes("Invalid login credentials")) {
        setError("Email (သို့) Password မှားနေပါတယ်");
      } else {
        setError(loginError.message);
      }
      setLoading(false);
      return;
    }

    const user = data.user;

    // 3. Fetch role
    const { data: roleRow, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    /**
     * PGRST116 = no row found → normal user
     */
    if (roleError && roleError.code !== "PGRST116") {
      setError("Something went wrong. Please try again.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    // 4. Show welcome popup
    if (roleRow?.role === "contributor") {
      setWelcomeRole("contributor");
    } else {
      setWelcomeRole("user");
    }

    setShowWelcome(true);

    // 5. Navigate after popup
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 2500);

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col font-sans relative">

      {/* === SUCCESS POPUP (same as ContributorProfile) === */}
      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-white/60 backdrop-blur-md" />

          <div className="bg-white rounded-[30px] p-8 shadow-2xl border border-gray-100
            flex flex-col items-center text-center relative
            animate-in fade-in zoom-in duration-300
          ">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg
                ${
                  welcomeRole === "contributor"
                    ? "bg-[#34C759] shadow-green-200"
                    : "bg-[#007AFF] shadow-blue-200"
                }
              `}
            >
              <IoCheckmarkCircleOutline className="text-white text-5xl" />
            </div>

            <h2 className="text-2xl font-bold text-black mb-2">
              {welcomeRole === "contributor"
                ? "Welcome, Contributor!"
                : "Welcome!"}
            </h2>

            <p className="text-gray-500 leading-relaxed">
              {welcomeRole === "contributor" ? (
                <>
                  Data Team မှ ကြိုဆိုပါတယ် 🌿 <br />
                  Contributor အဖြစ် ဝင်ရောက်လာပါပြီ
                </>
              ) : (
                <>
                  Herbal Plant Directory MM မှ <br />
                  ကြိုဆိုပါတယ် 👋
                </>
              )}
            </p>

            <div className="mt-6 flex gap-2">
              <IoHeart className="text-red-500 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* === NAV BAR === */}
      <div className="flex items-center px-4 py-3 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="text-[#007AFF] flex items-center gap-1 active:opacity-50"
        >
          <IoChevronBack size={24} />
          <span className="text-[17px]">Back</span>
        </button>
      </div>

      {/* === CONTENT === */}
      <div className="flex-1 flex flex-col items-center px-6 pt-10">

        {/* Logo */}
        <div className="flex flex-col items-center py-6">
          <div className="w-24 h-24 bg-white rounded-[22px] shadow-sm border border-gray-100 flex items-center justify-center mb-3">
            <img src={leafIcon} alt="Leaf Icon" className="w-18 h-18" />
          </div>
          <h2 className="text-[22px] font-bold text-black">
            Herbal Plant Directory MM
          </h2>
        </div>

        <h1 className="text-[28px] font-bold text-black tracking-tight mb-6">
          ပြန်လည်ကြိုဆိုပါတယ်
        </h1>

        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">

          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-[12px]">
              <p className="text-[#FF3B30] text-[13px] text-center font-medium">
                {error}
              </p>
            </div>
          )}

          <div className="bg-white rounded-[14px] overflow-hidden border border-gray-200 shadow-sm">
            <div className="flex items-center px-4 border-b border-gray-100">
              <IoMailOutline className="text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Email"
                className="w-full py-3.5 px-3 focus:outline-none text-[17px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex items-center px-4">
              <IoLockClosedOutline className="text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Password"
                className="w-full py-3.5 px-3 focus:outline-none text-[17px]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-[#007AFF] text-[14px] font-medium"
            >
              Password မေ့နေပြီလား
            </button>
          </div>

          <button
            disabled={loading}
            className={`w-full py-3.5 rounded-[14px] font-bold text-[17px]
              ${loading ? "bg-gray-300" : "bg-[#007AFF] text-white shadow-md"}
            `}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <div className="text-center pt-4">
            <p className="text-[15px] text-gray-500">
              Account မရှိသေးဘူးလား{" "}
              <Link to="/signup" className="text-[#007AFF] font-semibold">
                Sign up
              </Link>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
