import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import { FiHash, FiAlertCircle, FiCheckCircle, FiRefreshCw } from "react-icons/fi";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();
  
  const [email, setEmail] = useState(state?.email || localStorage.getItem("pending_email") || "");
  const authType = state?.type || 'signup'; 
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (state?.email) {
      localStorage.setItem("pending_email", state.email);
    }
  }, [state]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("အီးမေးလ်လိပ်စာ မရှိပါ။ အစကပြန်လုပ်ပေးပါ။");
      return;
    }
    if (otp.length < 6) return;

    setLoading(true);
    setError("");

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: authType, 
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
    } else {
      setIsSuccess(true);
      setLoading(false);
      localStorage.removeItem("pending_email");
      
      // Extended timer to 3000ms so users can read the Myanmar text
      setTimeout(() => {
        if (authType === 'recovery') {
          navigate("/update-password");
        } else {
          navigate("/login");
        }
      }, 3000);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    setError("");

    const { error: resendError } = await supabase.auth.resend({
      type: authType,
      email: email,
    });

    if (resendError) {
      setError(resendError.message);
    } else {
      setTimer(60);
      alert("အတည်ပြုကုဒ် အသစ် ပို့ပေးပြီးပါပြီ။");
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center px-6 font-sans">
      <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100 w-full max-w-sm text-center">
        {isSuccess ? (
          <div className="space-y-4 animate-in zoom-in duration-300">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <FiCheckCircle className="text-[#34C759] text-6xl" />
              </div>
            </div>
            
            {/* Conditional Success Message */}
            {authType === 'signup' ? (
              <>
                <h2 className="text-xl font-bold text-black leading-tight">
                  Account ပြုလုပ်ခြင်း အောင်မြင်ပါသည်။
                </h2>
                <p className="text-gray-500 text-[15px]">
                  ဤ email နှင့် password ကိုသုံးပြီး Login ဝင်ပေးပါ
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-black">အောင်မြင်ပါသည်!</h2>
                <p className="text-gray-500">ခဏအတွင်း ဆက်သွားပါမည်...</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiHash className="text-[#007AFF] text-3xl" />
            </div>
            <h1 className="text-[24px] font-bold text-black mb-2">Check your email</h1>
            <p className="text-gray-500 text-[15px] mb-8">
              Code ကို <span className="text-black font-semibold">{email || "your email"}</span> သို့ ပို့ထားပါသည်။
            </p>

            <form onSubmit={handleVerify} className="space-y-6">
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                maxLength={8}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="OTP Code"
                className="w-full bg-[#F2F2F7] border-none rounded-2xl py-4 text-center text-2xl tracking-[4px] font-bold outline-none focus:ring-2 focus:ring-[#007AFF]"
              />

              {error && (
                <div className="bg-red-50 p-3 rounded-xl flex items-center justify-center gap-2 text-red-500 text-sm border border-red-100">
                  <FiAlertCircle />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-[#007AFF] text-white py-4 rounded-2xl font-bold text-[17px] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? "စစ်ဆေးနေပါသည်..." : "အတည်ပြုမည်"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-50">
              <button
                onClick={handleResend}
                disabled={timer > 0 || resending}
                className="flex items-center justify-center gap-2 w-full text-[15px] font-semibold text-[#007AFF] disabled:text-gray-400"
              >
                <FiRefreshCw className={resending ? "animate-spin" : ""} />
                {timer > 0 ? `စက္ကန့် ${timer} ကြာလျှင် ကုဒ်ပြန်ပို့နိုင်ပါမည်` : "ကုဒ်အသစ် ပြန်ပို့ရန်"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}