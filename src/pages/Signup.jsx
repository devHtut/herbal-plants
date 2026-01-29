import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import {
  IoChevronBack,
  IoMailOutline,
  IoLockClosedOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import leafIcon from '../assets/Herbal_Icon.png';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  async function handleSignup(e) {
    e.preventDefault();
    setError("");

    // --- Validation Logic ---
    if (!validateEmail(email)) {
      setError("Valid ဖြစ်တဲ့ email address ကိုသာထည့်ပေးပါ");
      return;
    }
    if (password.length < 6) {
      setError("Password အနည်းဆုံး ၆ လုံးထည့်ပေးပါ");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords ၂ ခုတူညီအောင်ထည့်ပေးပါ");
      return;
    }

    setLoading(true);

    // --- SIGN UP ---
    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        // Pointing to /verify so link-clickers and code-typers end up in the same flow
        emailRedirectTo: `${window.location.origin}/verify`,
      },
    });

    if (signupError) {
      if (signupError.message.includes("already registered")) {
        setError("ဒီ email နဲ့ account တခုရှိပြီးသားပါ");
      } else {
        setError(signupError.message);
      }
    } else if (data?.user?.identities?.length === 0) {
      setError("ဒီ email က account ရှိပြီးသားဖြစ်လို့ log in ဝင်ကြည့်ပါ");
    } else {
      // SUCCESS: Navigate to the OTP verification page
      // We pass the email in 'state' so VerifyOtp.jsx knows who to verify
      navigate("/verify", { state: { email: email.trim() } });
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col font-sans">
      {/* Navigation Bar */}
      <div className="flex items-center px-4 py-3 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="text-[#007AFF] flex items-center gap-1 active:opacity-50"
        >
          <IoChevronBack size={24} />
          <span className="text-[17px]">Login</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-8 pb-10 overflow-y-auto">
        {/* Logo/Icon */}
        <div className="flex flex-col items-center py-6">
          <div className="w-24 h-24 bg-white rounded-[22px] shadow-sm border border-gray-100 flex items-center justify-center mb-3">
            <img
              src={leafIcon}
              alt="Leaf Icon"
              className="w-18 h-18 object-contain"
            />
          </div>
          <h2 className="text-[22px] font-bold text-black">
            Herbal Plant Directory MM
          </h2>
        </div>

        <h1 className="text-[28px] font-bold text-black tracking-tight mb-2 text-center">
          Account ပြုလုပ်ရန်
        </h1>
        <p className="text-gray-500 text-[15px] mb-8 text-center px-4 mt-2">
          Join the community and start saving your favorite plants.
        </p>

        <form onSubmit={handleSignup} className="w-full max-w-sm space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-[12px] animate-pulse">
              <p className="text-[#FF3B30] text-[13px] text-center font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Input Group */}
          <div className="bg-white rounded-[14px] overflow-hidden border border-gray-200 shadow-sm">
            <div className="flex items-center px-4 border-b border-gray-100">
              <IoMailOutline className="text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Email address"
                className="w-full py-3.5 px-3 focus:outline-none text-[17px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex items-center px-4 border-b border-gray-100">
              <IoLockClosedOutline className="text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                className="w-full py-3.5 px-3 focus:outline-none text-[17px]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center px-4">
              <IoShieldCheckmarkOutline className="text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full py-3.5 px-3 focus:outline-none text-[17px]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className={`w-full py-3.5 rounded-[14px] font-bold text-[17px] transition-all shadow-sm
              ${loading ? "bg-gray-300" : "bg-[#007AFF] text-white active:scale-[0.98] active:bg-[#0062CC]"}
            `}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="text-center text-[13px] text-gray-400 px-6 leading-relaxed">
            By signing up, you agree to our{" "}
            <span className="text-[#007AFF]">Terms of Service</span> and{" "}
            <span className="text-[#007AFF]">Privacy Policy</span>.
          </p>

          <div className="text-center pt-2">
            <p className="text-[15px] text-gray-500">
              Account ရှိပြီးသားလား{" "}
              <Link
                to="/login"
                className="text-[#007AFF] font-semibold active:opacity-50"
              >
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
