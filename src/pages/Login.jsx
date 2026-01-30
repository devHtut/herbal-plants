import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import {
  IoChevronBack,
  IoMailOutline,
  IoLockClosedOutline,
  IoCheckmarkCircleOutline,
  IoHeart,
  IoEyeOutline,
  IoEyeOffOutline,
} from "react-icons/io5";
import leafIcon from "../assets/Herbal_Icon.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeRole, setWelcomeRole] = useState(null);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Valid ဖြစ်တဲ့ email address ကိုသာထည့်ပေးပါ");
      return;
    }

    if (password.length < 6) {
      setError("Password အနည်းဆုံး ၆ လုံးထည့်ပေးပါ");
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate the user
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        // Handle specific error for non-existent users
        // Note: Supabase usually returns 'Invalid login credentials' for both wrong pass and missing email
        // To be 100% sure about the "No Account" message, we can check your public users table if you have one,
        // or rely on the generic credential error.
        if (loginError.message.includes("Invalid login credentials")) {
          setError("Email (သို့) Password မှားနေပါတယ်");
        } else if (loginError.status === 400) {
          setError("ဒီ email နှင့် account ဖွင့်ထားခြင်းမရှိပါသဖြင့် Sign up အရင်လုပ်ပေးပါ");
        } else {
          setError(loginError.message);
        }
        setLoading(false);
        return;
      }

      const user = data.user;

      // 2. Role Check (Hybrid Approach)
      const { data: roleRow, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle(); // Better than .single() to avoid throwing on missing roles

      if (roleError) {
        setError("Error fetching user role.");
        setLoading(false);
        return;
      }

      setWelcomeRole(roleRow?.role === "contributor" ? "contributor" : "user");
      setShowWelcome(true);

      // 3. Navigation
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);

    } catch (err) {
      setError("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col font-sans relative">
      {/* === SUCCESS POPUP === */}
      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-white/60 backdrop-blur-md" />
          <div className="bg-white rounded-[30px] p-8 shadow-2xl border border-gray-100 flex flex-col items-center text-center relative animate-in fade-in zoom-in duration-300">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg ${welcomeRole === "contributor" ? "bg-[#34C759] shadow-green-200" : "bg-[#007AFF] shadow-blue-200"}`}>
              <IoCheckmarkCircleOutline className="text-white text-5xl" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">
              {welcomeRole === "contributor" ? "Welcome, Contributor!" : "Welcome!"}
            </h2>
            <div className="text-gray-500 leading-relaxed">
              {welcomeRole === "contributor" ? (
                <p>Data Team မှ ကြိုဆိုပါတယ် 🌿 <br /> Contributor အဖြစ် ဝင်ရောက်လာပါပြီ</p>
              ) : (
                <p>Herbal Plant Directory MM မှ <br /> ကြိုဆိုပါတယ် 👋</p>
              )}
            </div>
            <div className="mt-6 flex gap-2">
              <IoHeart className="text-red-500 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* === NAV BAR === */}
      <div className="flex items-center px-4 py-3 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="text-[#007AFF] flex items-center gap-1 active:opacity-50">
          <IoChevronBack size={24} />
          <span className="text-[17px]">Back</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-10">
        <div className="flex flex-col items-center py-6">
          <div className="w-24 h-24 bg-white rounded-[22px] shadow-sm border border-gray-100 flex items-center justify-center mb-3">
            <img src={leafIcon} alt="Leaf Icon" className="w-18 h-18" />
          </div>
          <h2 className="text-[22px] font-bold text-black">Herbal Plant Directory MM</h2>
        </div>

        <h1 className="text-[28px] font-bold text-black tracking-tight mb-6">ပြန်လည်ကြိုဆိုပါတယ်</h1>

        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-[12px]">
              <p className="text-[#FF3B30] text-[13px] text-center font-medium">{error}</p>
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
                required
              />
            </div>

            <div className="flex items-center px-4">
              <IoLockClosedOutline className="text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full py-3.5 px-3 focus:outline-none text-[17px]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 focus:outline-none active:opacity-60"
              >
                {showPassword ? <IoEyeOffOutline size={22} /> : <IoEyeOutline size={22} />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <button type="button" onClick={() => navigate("/forgot-password")} className="text-[#007AFF] text-[14px] font-medium active:opacity-50">
              Password မေ့နေပြီလား
            </button>
          </div>

          <button
            disabled={loading}
            className={`w-full py-3.5 rounded-[14px] font-bold text-[17px] transition-all duration-200 ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-[#007AFF] text-white shadow-md active:scale-[0.98]"}`}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <div className="text-center pt-4">
            <p className="text-[15px] text-gray-500">
              Account မရှိသေးဘူးလား <Link to="/signup" className="text-[#007AFF] font-semibold">Sign up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}