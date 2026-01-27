import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { 
  IoCameraOutline, IoPersonOutline, IoSchoolOutline, 
  IoCallOutline, IoCheckmarkCircleOutline, IoHeart, IoMailOutline 
} from "react-icons/io5";

export default function ContributorProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    academic: "",
    phone: ""
  });

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/login");
      else {
        setUser(session.user);
        checkExistingProfile(session.user.id);
      }
    };
    getSession();
  }, [navigate]);

  const checkExistingProfile = async (userId) => {
    const { data } = await supabase
      .from("data_contributors")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    if (data) navigate("/");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name) {
      alert("Full Name is required");
      return;
    }
    setLoading(true);

    try {
      // 1. Generate username from Full Name automatically
      const generatedUsername = formData.full_name
        .toLowerCase()
        .replace(/\s+/g, '') // remove spaces
        + Math.floor(100 + Math.random() * 900); // add 3 random digits for uniqueness

      let avatarUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, imageFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrl;
      }

      const { error } = await supabase
  .from("data_contributors")
  .upsert({
    id: user.id,
    username: generatedUsername,
    full_name: formData.full_name,
    email: user.email, // Add this line!
    academic: formData.academic,
    phone: formData.phone,
    profile_url: avatarUrl 
  });

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => navigate("/"), 2500);

    } catch (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col font-sans relative">
      
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-white/60 backdrop-blur-md" />
          <div className="bg-white rounded-[30px] p-8 shadow-2xl border border-gray-100 flex flex-col items-center text-center relative animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-[#34C759] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-200">
              <IoCheckmarkCircleOutline className="text-white text-5xl" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">Welcome!</h2>
            <p className="text-gray-500 leading-relaxed">
              ကျေးဇူးတင်ပါတယ် {formData.full_name}။ <br />
              အချက်အလက်များကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။
            </p>
            <div className="mt-6 flex gap-2">
                <IoHeart className="text-red-500 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center px-6 pt-12 pb-10">
        <h1 className="text-[28px] font-bold text-black tracking-tight mb-2">Setup Profile</h1>
        <p className="text-gray-500 text-[15px] mb-8 text-center px-4">
          Data Team မှကြိုဆိုပါတယ် <br/> Profile အချက်အလက်များကို အရင်ဖြည့်စွက်ပေးပါ
        </p>

        {/* Profile Picture */}
        <div className="relative mb-10">
          <div className="w-32 h-32 bg-white rounded-full shadow-md border-4 border-white overflow-hidden flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <IoPersonOutline className="text-gray-300 text-6xl" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-[#007AFF] p-2.5 rounded-full text-white shadow-lg cursor-pointer active:scale-90 transition-transform">
            <IoCameraOutline size={20} />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        <div className="w-full max-w-sm space-y-4">
          {/* Email Info (Non-editable, getting from Auth) */}
          <div className="bg-white rounded-[14px] px-4 py-3.5 flex items-center border border-gray-200 opacity-60">
             <IoMailOutline className="text-gray-400 mr-3" size={20} />
             <div className="flex flex-col">
               <span className="text-[10px] uppercase font-bold text-gray-400">Auth Email</span>
               <span className="text-[16px] text-gray-600">{user?.email}</span>
             </div>
          </div>

          <div className="bg-white rounded-[14px] overflow-hidden border border-gray-200 shadow-sm">
            <div className="flex items-center px-4">
              <span className="w-24 text-[13px] font-semibold text-gray-400 uppercase">Full Name</span>
              <input
                className="w-full py-4 px-3 focus:outline-none text-[17px] text-black"
                placeholder="အမည်အပြည့်အစုံ"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-white rounded-[14px] overflow-hidden border border-gray-200 shadow-sm divide-y divide-gray-100">
            <div className="flex items-center px-4">
              <IoSchoolOutline className="text-gray-300 mr-3" size={20} />
              <input
                className="w-full py-4 focus:outline-none text-[17px] text-black"
                placeholder="Academic / Title (eg. B.M.T.M)"
                value={formData.academic}
                onChange={(e) => setFormData({...formData, academic: e.target.value})}
              />
            </div>
            <div className="flex items-center px-4">
              <IoCallOutline className="text-gray-300 mr-3" size={20} />
              <input
                className="w-full py-4 focus:outline-none text-[17px] text-black"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-4 mt-4 rounded-[18px] font-bold text-[17px] transition-all flex items-center justify-center gap-2
              ${loading ? 'bg-gray-200 text-gray-400' : 'bg-[#007AFF] text-white active:scale-[0.98] shadow-lg shadow-blue-100'}
            `}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
            ) : (
              <>
                <IoCheckmarkCircleOutline size={22} />
                <span>Complete Setup</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}