import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FiArrowLeft } from "react-icons/fi";
import {
  IoPersonCircle,
  IoSchool,
  IoCall,
  IoChevronForward,
  IoMail,
} from "react-icons/io5";

export default function Contributors() {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContributors();
  }, []);

  async function fetchContributors() {
    // Fetching the profile_url we just added to the table
    const { data, error } = await supabase
      .from("data_contributors")
      .select("*")
      .order("full_name", { ascending: true });

    if (!error) {
      setContributors(data);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="h-screen bg-[#F2F2F7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-[#007AFF] active:opacity-40 transition-opacity"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-semibold text-[17px] text-black">
          Contributors
        </h1>
        <div className="w-8" />
      </div>

      <div className="p-4 space-y-6">
        <div className="px-1">
          <h2 className="text-[32px] font-bold text-black tracking-tight">
            Team
          </h2>
          <p className="text-[15px] text-gray-500">
            The people behind the botanical data.
          </p>
        </div>

        <div className="space-y-3">
          {contributors.length === 0 ? (
            <div className="bg-white rounded-[20px] p-8 text-center border border-gray-100">
              <p className="text-gray-400">No contributors yet.</p>
            </div>
          ) : (
            contributors.map((person) => (
              <div
                key={person.id}
                className="bg-white rounded-[22px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center gap-4 active:scale-[0.98] transition-all duration-200"
              >
                {/* Real Profile Picture with fallback */}
                <div className="relative w-16 h-16 flex-shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                    {person.profile_url ? (
                      <img
                        src={person.profile_url}
                        alt={person.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <IoPersonCircle className="text-gray-200 w-full h-full" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[17px] font-bold text-black truncate">
                    {person.full_name}
                  </h3>
                  <p className="text-[13px] text-[#007AFF] font-medium mb-1">
                    @{person.username}
                  </p>

                  <div className="flex flex-col gap-0.5">
                    {/* Academic Title */}
                    {person.academic && (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <IoSchool size={13} className="text-gray-400" />
                        <span className="text-[12px] truncate italic">
                          {person.academic}
                        </span>
                      </div>
                    )}

                    {/* Email Display (Requires Email column in DB) */}
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <IoMail size={13} className="text-gray-400" />
                      <span className="text-[12px] truncate">
                        {person.email || "Email Hidden"}
                      </span>
                    </div>

                    {/* Phone Display */}
                    {person.phone && (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <IoCall size={13} className="text-gray-400" />
                        <span className="text-[12px]">{person.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* <IoChevronForward className="text-gray-300" size={20} /> */}
              </div>
            ))
          )}
        </div>
      </div>

      <footer className="mt-auto p-10 text-center">
        <p className="text-[13px] text-gray-400 leading-relaxed">
          ဤပရောဂျက်သည် data-team၏ ဝီရိယစိုက်ထုတ်ကူညီမှု <br />
          များကြောင့် အောင်မြင်စွာ ဆောင်ရွက်နိုင်ခြင်း ဖြစ်သည်။
        </p>
        <p className="mt-2 text-[13px] text-gray-400 leading-relaxed">
          This project is made possible by the <br />
          contributions of our dedicated volunteers.
        </p>
      </footer>
    </div>
  );
}
