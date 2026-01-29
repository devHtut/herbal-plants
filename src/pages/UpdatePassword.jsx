import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { IoLockClosedOutline, IoShieldCheckmarkOutline } from "react-icons/io5";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Password များ တူညီမှု မရှိပါ။");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password အနည်းဆုံး ၆ လုံး ရှိရပါမည်။");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      alert("Password အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center px-6">
      <div className="bg-white p-8 rounded-[30px] shadow-sm w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Password အသစ် သတ်မှတ်ပါ</h1>
        
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center gap-3">
            <IoLockClosedOutline className="text-gray-400" />
            <input
              type="password"
              placeholder="Password အသစ်"
              className="bg-transparent w-full outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center gap-3">
            <IoShieldCheckmarkOutline className="text-gray-400" />
            <input
              type="password"
              placeholder="Password ကို ထပ်ရိုက်ပါ"
              className="bg-transparent w-full outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-[#007AFF] text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Updating..." : "Password ပြောင်းမည်"}
          </button>
        </form>
      </div>
    </div>
  );
}