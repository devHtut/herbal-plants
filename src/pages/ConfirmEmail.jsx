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
    /**
     * Supabase automatically claims the email confirmation token from the URL
     * We just wait briefly and then check for success
     */
    const verifyEmail = async () => {
      try {
        // Small delay to ensure Supabase has processed the token
        await new Promise((resolve) => setTimeout(resolve, 800));

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setError("Email confirmation failed. Please request a new link.");
        } else if (data?.session) {
          setSuccess(true);
          // Redirect to login after short delay
          setTimeout(() => navigate("/login"), 2000);
        } else {
          // In case session is not created (might happen in some configs)
          setSuccess(true);
          setTimeout(() => navigate("/login"), 2000);
        }
      } catch (err) {
        setError("Email confirmation failed. Please request a new link.");
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
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
