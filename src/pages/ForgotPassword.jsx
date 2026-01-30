import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { IoChevronBack, IoMailOutline, IoPaperPlaneOutline } from "react-icons/io5";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleResetRequest(e) {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("အီးမေးလ်လိပ်စာ ထည့်ပေးပါ။");
      return;
    }

    setLoading(true);
    const trimmedEmail = email.trim();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail);

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
    } else {
      // Email ကို localStorage ထဲမှာ သိမ်းထားပါ (Refresh လုပ်ရင် မပျောက်စေရန်)
      localStorage.setItem("pending_email", trimmedEmail);
      
      // OTP Page ကိုသွားပါ
      navigate("/verify-otp", { state: { email: trimmedEmail, type: 'recovery' } });
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col font-sans">
      <div className="flex items-center px-4 py-3 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="text-[#007AFF] flex items-center gap-1 active:opacity-50">
          <IoChevronBack size={24} />
          <span className="text-[17px]">Back</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-12">
        <div className="w-24 h-24 bg-white rounded-[24px] shadow-sm flex items-center justify-center mb-6 border border-gray-100">
          <IoPaperPlaneOutline className="text-[#007AFF] text-5xl" />
        </div>

        <h1 className="text-[28px] font-bold text-black tracking-tight mb-2 text-center">Password ပြန်သတ်မှတ်ရန်</h1>
        <p className="text-gray-500 text-[15px] mb-8 text-center px-4 leading-relaxed">
          သင့် Password ကို reset လုပ်နိုင်ရန် အတည်ပြုကုဒ် (OTP) ပို့ပေးမည် ဖြစ်သောကြောင့် အီးမေးလ်လိပ်စာ ထည့်ပေးပါ။
        </p>

        <form onSubmit={handleResetRequest} className="w-full max-w-sm space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-[12px]">
              <p className="text-[#FF3B30] text-[13px] text-center font-medium">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-[14px] overflow-hidden border border-gray-200 shadow-sm">
            <div className="flex items-center px-4">
              <IoMailOutline className="text-gray-400" size={20} />
              <input
                type="email"
                placeholder="အီးမေးလ်လိပ်စာ"
                className="w-full py-3.5 px-3 focus:outline-none text-[17px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            disabled={loading}
            className={`w-full py-3.5 rounded-[14px] font-bold text-[17px] transition-all shadow-sm
              ${loading ? 'bg-gray-300' : 'bg-[#007AFF] text-white active:scale-[0.98] active:bg-[#0062CC]'}
            `}
          >
            {loading ? "ပို့နေပါသည်..." : "အတည်ပြုကုဒ် ပို့မည်"}
          </button>
        </form>
      </div>
    </div>
  );
}