import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { IoCheckmarkCircle, IoArrowForward } from "react-icons/io5";

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" || session) {
      setSuccess(true);
      setVerifying(false);
      setTimeout(() => navigate("/login"), 2000);
    }
  });

  // Fallback timeout in case the link is expired/invalid
  const timeout = setTimeout(() => {
    if (verifying) {
      setVerifying(false);
      setError("Verification timed out or link is invalid.");
    }
  }, 5000);

  return () => {
    subscription.unsubscribe();
    clearTimeout(timeout);
  };
}, [navigate]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center px-6 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-4 border-[#007AFF] border-t-transparent rounded-full"></div>
          <p className="text-gray-400 text-sm font-medium">Verifying email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center px-6 font-sans">
      <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100 w-full max-w-sm text-center">
        {success ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <IoCheckmarkCircle className="text-[#34C759] text-6xl" />
              </div>
            </div>

            <h1 className="text-[24px] font-bold text-black mb-2 tracking-tight">
              Email Verified
            </h1>
            <p className="text-gray-500 text-[15px] mb-8 leading-relaxed">
              Your account is now active. Redirecting to login...
            </p>
          </>
        ) : (
          <p className="text-red-500 text-center text-[15px]">
            {error || "Email confirmation failed."}
          </p>
        )}

        {/* Optional: keep a manual button just in case */}
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-[#007AFF] text-white py-3.5 rounded-[14px] font-bold text-[17px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md"
        >
          Go to Login
          <IoArrowForward size={20} />
        </button>
      </div>

      <p className="mt-8 text-gray-400 text-[13px]">Herbal Plant Directory MM</p>
    </div>
  );
}
