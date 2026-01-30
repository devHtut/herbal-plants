import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  IoClose,
  IoPersonCircle,
  IoBookmark,
  IoPeople,
  IoInformationCircle,
  IoLogOut,
  IoLogInOutline,
  IoLeaf,
} from "react-icons/io5";
import { FiChevronRight } from "react-icons/fi";

export default function SideMenu({ menuOpen, setMenuOpen }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isContributor, setIsContributor] = useState(false);
  const [profile, setProfile] = useState(null);

  // Re-fetch profile whenever the menu is opened to ensure data is fresh
  useEffect(() => {
    if (menuOpen) {
      getUserAndProfile();
    }
  }, [menuOpen]);

  async function getUserAndProfile() {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    setUser(currentUser);

    if (currentUser) {
      const { data, error } = await supabase
        .from("data_contributors")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (data && !error) {
        setIsContributor(true);
        setProfile(data);
      } else {
        setIsContributor(false);
        setProfile(null);
      }
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsContributor(false);
    setMenuOpen(false);
    navigate("/login");
  }

  const handleNav = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  /**
   * SECURITY: Guarded navigation for Profile Settings
   */
  const handleProfileClick = () => {
    if (isContributor) {
      handleNav("/contributor-settings");
    }
    // Non-contributors stay on the menu; no navigation occurs.
  };

  return (
    <>
      {/* Backdrop Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[40] transition-opacity duration-300"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-[#F2F2F7] shadow-2xl transition-transform duration-300 ease-in-out z-[50] flex flex-col ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 bg-white border-b border-gray-200">
          <h2 className="text-[17px] font-bold text-black">Menu</h2>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-1 bg-gray-100 rounded-full text-gray-500 active:scale-90 transition-transform"
          >
            <IoClose size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {user ? (
            /* PROFILE CARD - Guarded Navigation */
            <div
              onClick={handleProfileClick}
              className={`m-4 p-4 bg-white rounded-[15px] shadow-sm border border-gray-100 flex items-center gap-3 transition-colors group ${
                isContributor
                  ? "active:bg-gray-50 cursor-pointer"
                  : "cursor-default"
              }`}
            >
              <div className="w-15 h-15 rounded-full overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
                {profile?.profile_url ? (
                  <img
                    src={profile.profile_url}
                    alt="profile"
                    className="w-full h-full object-cover"
                    key={profile.profile_url}
                  />
                ) : (
                  <IoPersonCircle className="text-[#007AFF] text-4xl" />
                )}
              </div>

              <div className="overflow-hidden flex-1">
                <p className="text-[15px] font-semibold text-black leading-tight truncate">
                  {profile?.full_name || "Account"}
                </p>
                <p className="text-[12px] text-gray-400 truncate">
                  {user.email}
                </p>

                {/* Visual Role Badge */}
                {isContributor ? (
                  <span className="text-[10px] bg-[#34C759]/10 text-[#34C759] px-2 py-0.5 rounded-full font-bold mt-1 inline-block uppercase tracking-wider">
                    Contributor
                  </span>
                ) : (
                  <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-bold mt-1 inline-block uppercase tracking-wider">
                    plant lover
                  </span>
                )
                }
              </div>

              {/* Only show chevron if navigation is allowed */}
              {isContributor && (
                <FiChevronRight
                  className="text-gray-300 group-active:text-gray-500"
                  size={16}
                />
              )}
            </div>
          ) : (
            /* LOGIN PROMPT */
            <div className="m-4 p-5 bg-white rounded-[20px] shadow-sm border border-gray-100 text-center">
              <p className="text-[15px] text-gray-600 mb-4">
                Create an account to connect with our community and save plants.
              </p>
              <button
                onClick={() => handleNav("/signup")}
                className="w-full bg-[#007AFF] text-white font-bold py-3 rounded-[12px] active:opacity-80 flex items-center justify-center gap-2"
              >
                <IoLogInOutline size={22} />
                Sign up
              </button>
            </div>
          )}

          {/* MENU ITEMS LIST */}
          <div className="mx-4 mt-2 overflow-hidden rounded-[15px] bg-white border border-gray-100 shadow-sm">
            {user && (
              <MenuItem
                icon={<IoBookmark className="text-[#FFCC00]" />}
                label="Saved Plants"
                onClick={() => handleNav("/saved")}
              />
            )}

            {isContributor && (
              <MenuItem
                icon={<IoLeaf className="text-[#34C759]" />}
                label="My Contributions"
                onClick={() => handleNav("/my-contributions")}
              />
            )}

            <MenuItem
              icon={<IoPeople className="text-[#007AFF]" />}
              label="Contributors"
              onClick={() => handleNav("/contributors")}
            />
            <MenuItem
              icon={<IoInformationCircle className="text-[#5856D6]" />}
              label="About Us"
              onClick={() => handleNav("/about")}
              isLast
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-[#F2F2F7] border-t border-gray-200/50">
          {user && (
            <button
              onClick={handleLogout}
              className="w-full bg-white text-[#FF3B30] font-semibold py-3 rounded-[15px] border border-gray-100 flex items-center justify-center gap-2 active:bg-red-50 transition-all shadow-sm mb-4"
            >
              <IoLogOut size={20} />
              Log Out
            </button>
          )}
          <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
            Herbal Plant Directory MM V1.0.0(26)
          </p>
        </div>
      </div>
    </>
  );
}

/**
 * REUSABLE MENU ITEM COMPONENT
 */
function MenuItem({ icon, label, onClick, isLast = false }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-4 active:bg-gray-100 cursor-pointer transition-colors ${
        !isLast ? "border-b border-gray-50" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-[20px]">{icon}</span>
        <span className="text-[16px] font-medium text-gray-800">{label}</span>
      </div>
      <FiChevronRight className="text-gray-300" size={14} />
    </div>
  );
}
