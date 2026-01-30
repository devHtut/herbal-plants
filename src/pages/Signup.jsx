import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import {
  IoChevronBack,
  IoMailOutline,
  IoLockClosedOutline,
  IoShieldCheckmarkOutline,
  IoEyeOutline,
  IoEyeOffOutline,
} from "react-icons/io5";
import leafIcon from '../assets/Herbal_Icon.png';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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

    // 1. Client-side Validations
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

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify`,
        },
      });

      // 2. Handle Supabase Errors
      if (signupError) {
        // Handle Rate Limiting (Status 429)
        if (signupError.status === 429 || signupError.message.toLowerCase().includes("rate limit")) {
          setError("မိနစ်အနည်းငယ်အကြာမှ Sign up ပြန်လုပ်ပေးပါ");
        } 
        // Handle Already Registered
        else if (signupError.message.includes("already registered") || signupError.status === 400) {
          setError("ဒီ email နှင့် account ဖွင့်ပြီးသားဖြစ်ပါသဖြင့် Login ဝင်ပေးပါ");
        } 
        else {
          setError(signupError.message);
        }
      } 
      // 3. Handle Identity Conflicts (User already exists but Supabase returns success for security)
      else if (data?.user?.identities?.length === 0) {
        setError("ဒီ email နှင့် account ဖွင့်ပြီးသားဖြစ်ပါသဖြင့် Login ဝင်ပေးပါ");
      } 
      else {
        // Success: Proceed to OTP
        localStorage.setItem("pending_email", email.trim());
        navigate("/verify-otp", { state: { email: email.trim() } });
      }
    } catch (err) {
      setError("တစ်ခုခုမှားယွင်းနေပါသည်။ ခဏအကြာမှ ထပ်မံကြိုးစားပေးပါ။");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col font-sans">
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

      <div className="flex-1 flex flex-col items-center px-6 pt-8 pb-10 overflow-y-auto">
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
          {/* Custom Animated Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-[12px] animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-[#FF3B30] text-[13px] text-center font-medium leading-relaxed">
                {error}
              </p>
            </div>
          )}

          <div className="bg-white rounded-[14px] overflow-hidden border border-gray-200 shadow-sm">
            {/* Email Input */}
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

            {/* Password Input */}
            <div className="flex items-center px-4 border-b border-gray-100">
              <IoLockClosedOutline className="text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 6 chars)"
                className="w-full py-3.5 px-3 focus:outline-none text-[17px]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 px-2"
              >
                {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
              </button>
            </div>

            {/* Confirm Password Input */}
            <div className="flex items-center px-4">
              <IoShieldCheckmarkOutline className="text-gray-400" size={20} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full py-3.5 px-3 focus:outline-none text-[17px]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 px-2"
              >
                {showConfirmPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className={`w-full py-3.5 rounded-[14px] font-bold text-[17px] transition-all shadow-sm
              ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-[#007AFF] text-white active:scale-[0.98] active:bg-[#0062CC]"}
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