import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FiArrowLeft, FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";
import { 
  IoBookmark, IoBookmarkOutline, IoPersonOutline, 
  IoCalendarOutline, IoCreateOutline, IoTrashOutline 
} from "react-icons/io5";

export default function PlantDetail({ plants }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find the specific plant from props
  const plant = plants?.find((p) => p.id === id);

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedImg, setSelectedImg] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [status, setStatus] = useState({ show: false, type: "", message: "" });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchUser();
    if (plant) checkSavedStatus();
  }, [id, plant]);

  const isOwner = currentUser?.id === plant?.contributor_id;

  const showPopup = (type, message) => {
    setStatus({ show: true, type, message });
    if (type === "success") {
      setTimeout(() => {
        setStatus({ show: false, type: "", message: "" });
        navigate("/", { replace: true });
      }, 2000);
    } else {
      setTimeout(() => setStatus({ show: false, type: "", message: "" }), 3000);
    }
  };

  async function checkSavedStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("saved_plants")
      .select("id").eq("plant_id", id).eq("user_id", user.id).maybeSingle();
    if (data) setIsSaved(true);
  }

  async function toggleSave() {
    if (!currentUser) { setShowLoginModal(true); return; }
    setIsSaving(true);
    const previousState = isSaved;
    setIsSaved(!previousState);
    if (previousState) {
      await supabase.from("saved_plants").delete().eq("plant_id", id).eq("user_id", currentUser.id);
    } else {
      await supabase.from("saved_plants").insert({ plant_id: id, user_id: currentUser.id });
    }
    setIsSaving(false);
  }

  async function handleDelete() {
    setIsDeleting(true);
    setShowConfirmDelete(false);

    try {
      // 1. Prepare Storage Deletion
      // Assuming your storage bucket is named 'plant-images'
      if (plant.plant_photos && plant.plant_photos.length > 0) {
        const filePaths = plant.plant_photos.map(photo => {
          // Extracts the filename from the URL
          const parts = photo.image_url.split('/');
          return parts[parts.length - 1];
        });

        const { error: storageError } = await supabase
          .storage
          .from('plant-images')
          .remove(filePaths);

        if (storageError) console.error("Storage Error:", storageError);
      }

      // 2. Delete from Database
      // Note: This requires ON DELETE CASCADE on your foreign keys in Postgres
      const { error: dbError } = await supabase
        .from("plants")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      showPopup("success", "အောင်မြင်စွာ ဖျက်လိုက်ပါပြီ");
    } catch (error) {
      console.error("Delete failed:", error);
      showPopup("error", error.message || "ဖျက်နေစဉ် အမှားအယွင်းရှိခဲ့ပါသည်");
      setIsDeleting(false);
    }
  }

  if (!plant) return <div className="p-10 text-center font-medium text-gray-500">Plant not found</div>;

  const formattedDate = plant.created_at
    ? new Date(plant.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : "N/A";

  return (
    <div className="h-screen bg-[#F2F2F7] flex flex-col font-sans relative overflow-hidden">
      
      {/* IMAGE ZOOM OVERLAY */}
      {selectedImg && (
        <div 
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setSelectedImg(null)}
        >
          <button className="absolute top-12 right-6 text-white"><FiX size={32} /></button>
          <img src={selectedImg} className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" alt="zoom" />
        </div>
      )}

      {/* STATUS POP-UP */}
      {status.show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-6 bg-black/20">
          <div className="bg-white rounded-[30px] p-8 shadow-2xl text-center max-w-xs w-full animate-in zoom-in">
             <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${status.type === "success" ? "bg-green-500" : "bg-red-500"} shadow-lg`}>
              {status.type === "success" ? <FiCheckCircle className="text-white text-3xl" /> : <FiAlertCircle className="text-white text-3xl" />}
            </div>
            <h2 className="text-xl font-bold text-black mb-1">{status.type === "success" ? "Done!" : "Error"}</h2>
            <p className="text-gray-500 text-[15px]">{status.message}</p>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
          <div className="bg-white rounded-[28px] p-6 shadow-2xl w-full max-w-[300px] text-center animate-in zoom-in">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoTrashOutline className="text-red-500 text-3xl" />
            </div>
            <h3 className="text-lg font-bold text-black">ဤ plant data ကို ဖျက်မလား?</h3>
            <p className="text-gray-500 text-sm mt-2">သေချာပါသလား? ဤလုပ်ဆောင်ချက်ကို ပြန်ပြင်၍မရပါ။</p>
            <div className="flex flex-col gap-2 mt-6">
              <button onClick={handleDelete} className="w-full py-3.5 bg-red-500 text-white font-bold rounded-2xl active:scale-95">ဖျက်မည်</button>
              <button onClick={() => setShowConfirmDelete(false)} className="w-full py-3.5 bg-gray-100 text-gray-600 font-semibold rounded-2xl">မဖျက်တော့ပါ</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-[#007AFF]"><FiArrowLeft size={24} /></button>
        <h1 className="flex-1 text-center font-semibold text-[17px] text-black truncate px-2">{plant.myanmar_name}</h1>
        {isOwner ? (
          <button onClick={() => navigate(`/edit-plant/${id}`)} className="p-1 text-[#007AFF]"><IoCreateOutline size={26} /></button>
        ) : (
          <button onClick={toggleSave} disabled={isSaving} className="p-1 transition-transform active:scale-125">
            {isSaved ? <IoBookmark size={26} className="text-[#FFCC00]" /> : <IoBookmarkOutline size={26} className="text-gray-400" />}
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-12">
        {plant.plant_photos?.length > 0 && (
          <div className={`grid ${plant.plant_photos.length <= 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
            {plant.plant_photos.map((photo, i) => (
              <img 
                key={i} 
                src={photo.image_url} 
                onClick={() => setSelectedImg(photo.image_url)}
                className="w-full h-48 rounded-[20px] object-cover shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-zoom-in" 
                alt="plant" 
              />
            ))}
          </div>
        )}

        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
          <InfoRow label="Myanmar Name" value={plant.myanmar_name} highlight />
          <InfoRow label="English Name" value={plant.english_name} />
          <InfoRow label="Botanical Name" value={plant.botanical_name} italic />
          <InfoRow label="Scientific Name" value={plant.scientific_name} italic />
        </div>

        <div className="space-y-4">
          {plant.description && <Section title="သွင်ပြင်လက္ခဏာ" content={plant.description} />}
          {plant.location && <Section title="တွေ့ရှိရသောနေရာဒေသ" content={plant.location} />}
          {plant.diseases && <Section title="ပျောက်ကင်းနိုင်‌သောရောဂါများ" content={plant.diseases} />}
          {plant.diseases && <Section title="ကိုးကားချက်" content={plant.reference} />}
        </div>

        {/* Contributor */}
        <div className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 space-y-3 mt-6">
          <div className="flex items-center justify-between text-[15px]">
            <div className="flex items-center gap-2 text-gray-500">
              <IoPersonOutline className="text-[#007AFF]" />
              <span>Contributor</span>
            </div>
            <span className="font-semibold text-black">{plant.data_contributors?.full_name || "Anonymous"}</span>
          </div>
          <div className="flex items-center justify-between text-[15px]">
            <div className="flex items-center gap-2 text-gray-500">
              <IoCalendarOutline className="text-[#007AFF]" />
              <span>Added on</span>
            </div>
            <span className="text-black font-medium">{formattedDate}</span>
          </div>
        </div>

        {/* {isOwner && (
          <div className="mt-4 px-1 pb-10">
            <button onClick={() => setShowConfirmDelete(true)} disabled={isDeleting} className="w-full bg-white text-[#FF3B30] font-semibold py-4 rounded-[20px] border border-red-100 flex items-center justify-center gap-2 active:bg-red-50 shadow-sm">
              <IoTrashOutline size={20} /> {isDeleting ? "Deleting..." : "Delete Contribution"}
            </button>
          </div>
        )} */}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white/90 backdrop-blur-xl rounded-[14px] w-full max-w-[270px] overflow-hidden shadow-2xl animate-in zoom-in">
            <div className="p-5 text-center">
              <h3 className="font-semibold text-[17px]">Log in ဝင်ရန်လိုအပ်ပါသည်</h3>
              <p className="text-[13px] mt-2">နှစ်သက်တဲ့ အပင်အချက်အလက်များကို မှတ်သားထားနိုင်ရန် Log in ဝင်ပေးပါ</p>
            </div>
            <div className="flex border-t border-gray-300">
              <button onClick={() => setShowLoginModal(false)} className="flex-1 py-3 text-[#007AFF] border-r border-gray-300">Cancel</button>
              <button onClick={() => navigate("/signup")} className="flex-1 py-3 text-[#007AFF] font-semibold">Log In</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components kept unchanged for styling
function Section({ title, content }) {
  return (
    <div className="space-y-1.5 px-1">
      <h2 className="text-[13px] font-semibold text-gray-500 uppercase ml-1 tracking-wide">{title}</h2>
      <div className="bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm">
        <p className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, italic = false, highlight = false }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
      <span className="text-[14px] font-medium text-gray-400">{label}</span>
      <span className={`text-[15px] text-right ml-4 ${italic ? 'italic' : ''} ${highlight ? 'font-bold text-black' : 'text-gray-800'}`}>{value}</span>
    </div>
  );
}