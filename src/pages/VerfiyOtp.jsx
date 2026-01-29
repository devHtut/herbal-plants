import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import { FiHash, FiAlertCircle, FiCheckCircle, FiRefreshCw } from "react-icons/fi";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [timer, setTimer] = useState(60);

  // Signup ကလာရင် type က မပါလာနိုင်လို့ default 'signup' ထားပေးရပါမယ်
  const email = state?.email || "";
  const authType = state?.type || 'signup'; 

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return;

    setLoading(true);
    setError("");

    // 'type' ကို dynamic ဖြစ်အောင် authType သုံးလိုက်ပါတယ်
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: authType, 
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
    } else {
      setIsSuccess(true);
      setLoading(false);
      
      // အောင်မြင်သွားတဲ့အခါ type ပေါ်မူတည်ပြီး သွားရမယ့် Page ခွဲပါမယ်
      setTimeout(() => {
        if (authType === 'recovery') {
          navigate("/update-password");
        } else {
          navigate("/login");
        }
      }, 2000);
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
            <h2 className="text-2xl font-bold text-black">အောင်မြင်ပါသည်!</h2>
            <p className="text-gray-500">
              {authType === 'recovery' ? "Password ပြောင်းရန် ဆက်သွားပါမည်..." : "Login စာမျက်နှာသို့ သွားပါမည်..."}
            </p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiHash className="text-[#007AFF] text-3xl" />
            </div>
            
            <h1 className="text-[24px] font-bold text-black mb-2">Check your email</h1>
            <p className="text-gray-500 text-[15px] mb-8 leading-relaxed">
              We sent a verification code to <br/>
              <span className="text-black font-semibold">{email || "your inbox"}</span>
            </p>

            <form onSubmit={handleVerify} className="space-y-6">
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                maxLength={8}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter Code"
                className="w-full bg-[#F2F2F7] border-none rounded-2xl py-4 text-center text-2xl tracking-[4px] font-bold focus:ring-2 focus:ring-[#007AFF] outline-none"
              />

              {error && (
                <div className="flex items-center justify-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
                  <FiAlertCircle />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-[#007AFF] text-white py-4 rounded-2xl font-bold text-[17px] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? "စစ်ဆေးနေပါသည်..." : "Verify"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-50">
              <button
                onClick={handleResend}
                disabled={timer > 0 || resending}
                className="flex items-center justify-center gap-2 w-full text-[15px] font-semibold text-[#007AFF] disabled:text-gray-400 transition-colors"
              >
                <FiRefreshCw className={resending ? "animate-spin" : ""} />
                {timer > 0 ? `စက္ကန့် ${timer} အကြာတွင် ကုဒ်ပြန်ပို့နိုင်ပါမည်` : "ကုဒ်အသစ် ပြန်ပို့ရန်"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}