import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCamera, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { IoPersonOutline, IoSchoolOutline, IoCallOutline } from "react-icons/io5";

export default function ContributorSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    academic: "",
    phone: "",
    profile_url: ""
  });
  
  const [newImage, setNewImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    setUser(session.user);

    const { data, error } = await supabase
      .from("data_contributors")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (data && !error) {
      setFormData(data);
      setPreviewUrl(data.profile_url);
    }
    setLoading(false);
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: null, message: "" }), 2500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalImageUrl = formData.profile_url;

      // 1. Upload new image if selected
      if (newImage) {
        const fileExt = newImage.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, newImage, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        finalImageUrl = publicUrl;
      }

      // 2. Update DB
      const { error } = await supabase
        .from("data_contributors")
        .update({
          username: formData.username,
          full_name: formData.full_name,
          academic: formData.academic,
          phone: formData.phone,
          profile_url: finalImageUrl
        })
        .eq("id", user.id);

      if (error) throw error;
      showStatus("success", "Profile updated successfully");
    } catch (err) {
      showStatus("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F2F2F7]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF]"></div></div>;

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col font-sans relative">
      
      {/* Pop-up Overlay */}
      {status.type && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in duration-300 w-full max-w-[280px]">
            {status.type === "success" ? <FiCheckCircle className="text-[#34C759] text-5xl mb-3" /> : <FiAlertCircle className="text-[#FF3B30] text-5xl mb-3" />}
            <p className="font-semibold text-black">{status.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-[#007AFF]"><FiArrowLeft size={24} /></button>
        <h1 className="flex-1 text-center font-semibold text-[17px] text-black">Profile Settings</h1>
        <button onClick={handleSave} disabled={saving} className="text-[#007AFF] font-bold text-[17px] active:opacity-50">
          {saving ? "..." : "Save"}
        </button>
      </div>

      <div className="p-4 flex flex-col items-center">
        {/* Avatar Section */}
        <div className="relative mt-4 mb-8">
          <div className="w-28 h-28 bg-white rounded-full shadow-md border-4 border-white overflow-hidden flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <IoPersonOutline className="text-gray-200 text-5xl" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-[#007AFF] p-2 rounded-full text-white shadow-lg cursor-pointer active:scale-90 transition-transform">
            <FiCamera size={18} />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        {/* Form Groups */}
        <div className="w-full space-y-6">
          <div className="space-y-1">
            <p className="text-[12px] text-gray-500 uppercase ml-4 mb-1">Public Identity</p>
            <div className="bg-white rounded-[14px] border border-gray-200 divide-y divide-gray-100 overflow-hidden">
              <div className="flex items-center px-4 py-3.5">
                <span className="w-24 text-[14px] text-gray-400">Username</span>
                <input className="flex-1 focus:outline-none text-[16px]" value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})} />
              </div>
              <div className="flex items-center px-4 py-3.5">
                <span className="w-24 text-[14px] text-gray-400">Display Name</span>
                <input className="flex-1 focus:outline-none text-[16px]" value={formData.full_name} 
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-gray-500 uppercase ml-4 mb-1">Professional & Contact</p>
            <div className="bg-white rounded-[14px] border border-gray-200 divide-y divide-gray-100 overflow-hidden">
              <div className="flex items-center px-4 py-3.5">
                <IoSchoolOutline className="text-gray-300 mr-3" size={20} />
                <input className="flex-1 focus:outline-none text-[16px]" placeholder="Academic Title (eg. B.M.T.M)" value={formData.academic} 
                  onChange={(e) => setFormData({...formData, academic: e.target.value})} />
              </div>
              <div className="flex items-center px-4 py-3.5">
                <IoCallOutline className="text-gray-300 mr-3" size={20} />
                <input className="flex-1 focus:outline-none text-[16px]" placeholder="Phone Number" value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
          </div>
          
          <p className="text-center text-[13px] text-gray-400 px-6">
            These details will be displayed on the plants you contribute to help users trust the information.
          </p>
        </div>
      </div>
    </div>
  );
}