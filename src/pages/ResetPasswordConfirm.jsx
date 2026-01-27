import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  IoLockClosedOutline,
  IoShieldCheckmarkOutline,
  IoSaveOutline,
} from "react-icons/io5";

export default function ResetPasswordConfirm() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    /**
     * IMPORTANT:
     * Do NOT manually check getSession() here.
     * Supabase needs time to claim the token from the email link.
     */
    const timer = setTimeout(() => {
      setVerifying(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(
        error.message ||
          "Your reset link is invalid or has expired. Please request a new one."
      );
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    }

    setLoading(false);
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-4 border-[#007AFF] border-t-transparent rounded-full"></div>
          <p className="text-gray-400 text-sm font-medium">
            Verifying reset link...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col font-sans">
      <div className="flex-1 flex flex-col items-center px-6 pt-16">
        <div className="w-20 h-20 bg-white rounded-[22px] shadow-sm flex items-center justify-center mb-6 border border-gray-100 text-[#007AFF]">
          <IoLockClosedOutline size={40} />
        </div>

        <h1 className="text-[28px] font-bold text-black tracking-tight mb-2 text-center">
          New Password
        </h1>

        {success ? (
          <div className="w-full max-w-sm bg-white p-6 rounded-[22px] shadow-sm border border-gray-100 text-center">
            <div className="text-[#34C759] text-5xl mb-4">✅</div>
            <h3 className="text-lg font-bold mb-1 font-myanmar">
              Password ပြောင်းလဲပြီးပါပြီ
            </h3>
            <p className="text-gray-500 text-sm">
              Login စာမျက်နှာသို့ ခဏနေပြန်သွားပါမည်...
            </p>
          </div>
        ) : (
          <form onSubmit={handlePasswordUpdate} className="w-full max-w-sm space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 p-3 rounded-[12px]">
                <p className="text-[#FF3B30] text-[13px] text-center font-medium">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="w-full text-[#007AFF] text-xs mt-2 font-bold underline"
                >
                  Request new link
                </button>
              </div>
            )}

            <div className="bg-white rounded-[14px] overflow-hidden border border-gray-200 shadow-sm">
              <div className="flex items-center px-4 border-b border-gray-100">
                <IoLockClosedOutline className="text-gray-400" size={20} />
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full py-3.5 px-3 focus:outline-none text-[17px]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center px-4">
                <IoShieldCheckmarkOutline className="text-gray-400" size={20} />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full py-3.5 px-3 focus:outline-none text-[17px]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              disabled={loading}
              className={`w-full py-3.5 rounded-[14px] font-bold text-[17px] transition-all flex items-center justify-center gap-2
                ${
                  loading
                    ? "bg-gray-300"
                    : "bg-[#007AFF] text-white active:scale-[0.98] shadow-md"
                }
              `}
            >
              <IoSaveOutline size={20} />
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
