import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { 
  IoLockClosedOutline, 
  IoShieldCheckmarkOutline, 
  IoEyeOutline, 
  IoEyeOffOutline,
  IoCheckmarkCircle,
  IoAlertCircle
} from "react-icons/io5";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" }); // "success" or "error"

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "Password များ တူညီမှု မရှိပါ။" });
      return;
    }
    if (newPassword.length < 6) {
      setStatus({ type: "error", message: "Password အနည်းဆုံး ၆ လုံး ရှိရပါမည်။" });
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setStatus({ type: "error", message: updateError.message });
      setLoading(false);
    } else {
      setStatus({ type: "success", message: "Password အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။" });
      setLoading(false);
      
      // Auto navigate after success
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center px-6 font-sans">
      <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100 w-full max-w-sm relative overflow-hidden">
        
        {/* SUCCESS POP-UP OVERLAY */}
        {status.type === "success" && (
          <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
            <IoCheckmarkCircle className="text-[#34C759] text-7xl mb-4" />
            <h2 className="text-xl font-bold text-black mb-2">အောင်မြင်ပါသည်</h2>
            <p className="text-gray-500 text-[15px]">{status.message}</p>
            <div className="mt-6 w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#34C759] animate-progress-shrink origin-left"></div>
            </div>
          </div>
        )}

        <h1 className="text-[22px] font-bold text-center mb-8 text-black">
          Password အသစ် သတ်မှတ်ပါ
        </h1>
        
        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Error Message Pop-up Design */}
          {status.type === "error" && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
              <IoAlertCircle className="text-[#FF3B30] text-xl shrink-0" />
              <p className="text-[#FF3B30] text-[13px] font-medium">{status.message}</p>
            </div>
          )}

          {/* New Password Field */}
          <div className="bg-[#F2F2F7] rounded-2xl p-4 flex items-center gap-3 border border-transparent focus-within:border-[#007AFF] focus-within:bg-white transition-all">
            <IoLockClosedOutline className="text-gray-400 text-xl" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password အသစ်"
              className="bg-transparent w-full outline-none text-[16px]"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 active:text-[#007AFF]"
            >
              {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>

          {/* Confirm Password Field */}
          <div className="bg-[#F2F2F7] rounded-2xl p-4 flex items-center gap-3 border border-transparent focus-within:border-[#007AFF] focus-within:bg-white transition-all">
            <IoShieldCheckmarkOutline className="text-gray-400 text-xl" />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Password ကို ထပ်ရိုက်ပါ"
              className="bg-transparent w-full outline-none text-[16px]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-gray-400 active:text-[#007AFF]"
            >
              {showConfirm ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>

          <div className="pt-4">
            <button
              disabled={loading || status.type === "success"}
              className={`w-full py-4 rounded-2xl font-bold text-[17px] shadow-lg transition-all active:scale-[0.98]
                ${loading ? "bg-gray-300 shadow-none" : "bg-[#007AFF] text-white shadow-blue-100"}
              `}
            >
              {loading ? "Updating..." : "Password ပြောင်းမည်"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}