import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  FiArrowLeft,
  FiCamera,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { IoTrashOutline } from "react-icons/io5";

export default function EditPlantInfo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0); // Track upload progress
  const [status, setStatus] = useState({ type: null, message: "" });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const [formData, setFormData] = useState({
    myanmar_name: "",
    english_name: "",
    botanical_name: "",
    scientific_name: "",
    description: "",
    location: "",
    diseases: "",
  });

  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [removedPhotos, setRemovedPhotos] = useState([]);

  const MAX_PHOTOS = 6;
  const currentTotalPhotos = existingPhotos.length + newPhotos.length;

  useEffect(() => {
    fetchPlantData();
  }, [id]);

  // Prevent accidental tab closure while saving
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (saving) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saving]);

  async function fetchPlantData() {
    const { data, error } = await supabase
      .from("plants")
      .select(`*, plant_photos(*)`)
      .eq("id", id)
      .single();

    if (data && !error) {
      setFormData({
        myanmar_name: data.myanmar_name || "",
        english_name: data.english_name || "",
        botanical_name: data.botanical_name || "",
        scientific_name: data.scientific_name || "",
        description: data.description || "",
        location: data.location || "",
        diseases: data.diseases || "",
      });
      setExistingPhotos(data.plant_photos || []);
    }
    setLoading(false);
  }

  const extractPath = (urlStr) => {
    try {
      const url = new URL(urlStr);
      const pathParts = url.pathname.split("plant-images/");
      return pathParts.length > 1 ? decodeURIComponent(pathParts[1]) : null;
    } catch (e) {
      const parts = urlStr.split("/");
      return parts[parts.length - 1];
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          if (width > 1000) {
            height *= 1000 / width;
            width = 1000;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const attempt = (q) => {
            canvas.toBlob(
              (blob) => {
                if (blob.size <= 409600 || q <= 0.2) {
                  resolve(
                    new File([blob], `${Date.now()}.jpg`, {
                      type: "image/jpeg",
                    }),
                  );
                } else {
                  attempt(q - 0.1);
                }
              },
              "image/jpeg",
              q,
            );
          };
          attempt(0.7);
        };
      };
    });
  };

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (currentTotalPhotos + files.length > MAX_PHOTOS) {
      showStatus("error", `ဓာတ်ပုံအများဆုံး ${MAX_PHOTOS} ပုံသာ တင်နိုင်ပါသည်`);
      return;
    }
    setSaving(true);
    setProgress(10);
    const compressed = await Promise.all(
      files.map((file) => compressImage(file)),
    );
    setNewPhotos([...newPhotos, ...compressed]);
    setSaving(false);
    setProgress(0);
  };

  const showStatus = (type, message) => {
    setStatus({ type, message });
    if (type === "success") {
      setTimeout(() => navigate("/", { replace: true }), 2000);
    } else {
      setTimeout(() => setStatus({ type: null, message: "" }), 3000);
    }
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setProgress(5);

    try {
      // 1. Delete removed photos
      if (removedPhotos.length > 0) {
        const { data: toDelete } = await supabase
          .from("plant_photos")
          .select("image_url")
          .in("id", removedPhotos);
        if (toDelete) {
          const paths = toDelete
            .map((p) => extractPath(p.image_url))
            .filter(Boolean);
          if (paths.length > 0)
            await supabase.storage.from("plant-images").remove(paths);
        }
        await supabase.from("plant_photos").delete().in("id", removedPhotos);
      }
      setProgress(20);

      // 2. Upload new photos (Incrementally update progress)
      for (let i = 0; i < newPhotos.length; i++) {
        const file = newPhotos[i];
        const fileName = `${id}-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("plant-images")
          .upload(fileName, file);
        if (upErr) throw upErr;

        const {
          data: { publicUrl },
        } = supabase.storage.from("plant-images").getPublicUrl(fileName);
        await supabase
          .from("plant_photos")
          .insert({ plant_id: id, image_url: publicUrl });

        // Distribute 60% of the bar across all uploads
        const uploadChunk = 60 / newPhotos.length;
        setProgress(20 + Math.round(uploadChunk * (i + 1)));
      }

      // 3. Update Text Data
      setProgress(90);
      const { error: updateError } = await supabase
        .from("plants")
        .update(formData)
        .eq("id", id);
      if (updateError) throw updateError;

      setProgress(100);
      showStatus("success", "ပြင်ဆင်မှု အောင်မြင်ပါသည်");
    } catch (err) {
      showStatus("error", err.message);
    } finally {
      setSaving(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleDeletePlant = async () => {
    setSaving(true);
    setProgress(30);
    setShowConfirmDelete(false);
    try {
      if (existingPhotos.length > 0) {
        const allPaths = existingPhotos
          .map((p) => extractPath(p.image_url))
          .filter(Boolean);
        if (allPaths.length > 0) {
          await supabase.storage.from("plant-images").remove(allPaths);
        }
      }
      setProgress(70);
      const { error } = await supabase.from("plants").delete().eq("id", id);
      if (error) throw error;

      setProgress(100);
      showStatus("success", "အောင်မြင်စွာ ဖျက်လိုက်ပါပြီ");
    } catch (err) {
      showStatus("error", "Error: " + err.message);
      setSaving(false);
      setProgress(0);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF]"></div>
      </div>
    );

  return (
    <div className="h-screen bg-[#F2F2F7] flex flex-col font-sans relative overflow-hidden">
      {/* PROGRESS OVERLAY - Restricts user interaction during save */}
      {saving && (
        <div className="fixed inset-0 z-[150] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-[280px] space-y-6 text-center">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#007AFF] rounded-full border-t-transparent animate-spin"></div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-black">Saving Content</h3>
              <p className="text-gray-500 text-[15px]">
                သိမ်းဆည်းနေပါသည် ခေတ္တစောင့်ပေးပါ
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#007AFF] h-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-[14px] font-bold text-[#007AFF]">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STATUS POP-UP */}
      {status.type && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-8 shadow-2xl flex flex-col items-center text-center w-full max-w-[280px]">
            {status.type === "success" ? (
              <FiCheckCircle className="text-[#34C759] text-6xl mb-4" />
            ) : (
              <FiAlertCircle className="text-[#FF3B30] text-6xl mb-4" />
            )}
            <h2 className="text-xl font-bold text-black">
              {status.type === "success" ? "Success" : "Error"}
            </h2>
            <p className="text-gray-500 mt-2 text-[15px]">{status.message}</p>
          </div>
        </div>
      )}

      {/* DELETE DIALOG */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
          <div className="bg-white rounded-[28px] p-6 shadow-2xl w-full max-w-[300px] text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoTrashOutline className="text-red-500 text-3xl" />
            </div>
            <h3 className="text-lg font-bold text-black">
              Delete This Contribution?
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              ဤအပင်အချက်အလက်ကို ဖျက်ရန် သေချာပါသလား?
            </p>
            <div className="flex flex-col gap-2 mt-6">
              <button
                onClick={handleDeletePlant}
                className="w-full py-3.5 bg-red-500 text-white font-bold rounded-2xl"
              >
                Delete Now
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="w-full py-3.5 bg-gray-100 text-gray-600 font-semibold rounded-2xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-[#007AFF]"
          disabled={saving}
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-semibold text-[17px] text-black">
          Edit Contribution
        </h1>
        <button
          onClick={handleUpdate}
          disabled={saving}
          className="text-[#007AFF] font-bold text-[17px]"
        >
          {saving ? "..." : "Done"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-10">
        {/* Photo Grid Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-4">
            <p className="text-[13px] text-gray-500 uppercase">Photos</p>
            <p
              className={`text-[12px] font-bold ${currentTotalPhotos >= MAX_PHOTOS ? "text-red-500" : "text-gray-400"}`}
            >
              {currentTotalPhotos} / {MAX_PHOTOS}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {existingPhotos.map((photo) => (
              <div key={photo.id} className="relative aspect-square">
                <img
                  src={photo.image_url}
                  className="w-full h-full object-cover rounded-xl border border-gray-100"
                  alt="existing"
                />
                <button
                  onClick={() => {
                    setRemovedPhotos([...removedPhotos, photo.id]);
                    setExistingPhotos(
                      existingPhotos.filter((p) => p.id !== photo.id),
                    );
                  }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md"
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}
            {newPhotos.map((file, i) => (
              <div key={i} className="relative aspect-square">
                <img
                  src={URL.createObjectURL(file)}
                  className="w-full h-full object-cover rounded-xl border border-blue-200"
                  alt="new"
                />
                <button
                  onClick={() =>
                    setNewPhotos(newPhotos.filter((_, idx) => idx !== i))
                  }
                  className="absolute -top-1 -right-1 bg-gray-500 text-white rounded-full p-1 shadow-md"
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}
            {currentTotalPhotos < MAX_PHOTOS && (
              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl text-gray-400 cursor-pointer">
                <FiCamera size={24} />
                <span className="text-[10px] mt-1">Add Photo</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                  disabled={saving}
                />
              </label>
            )}
          </div>
        </div>

        {/* Input Fields */}
        <div className="bg-white rounded-[20px] overflow-hidden border border-gray-200 divide-y divide-gray-50 shadow-sm">
          <EditRow
            label="Myanmar"
            value={formData.myanmar_name}
            onChange={(v) => setFormData({ ...formData, myanmar_name: v })}
          />
          <EditRow
            label="English"
            value={formData.english_name}
            onChange={(v) => setFormData({ ...formData, english_name: v })}
          />
          <EditRow
            label="Botanical"
            value={formData.botanical_name}
            onChange={(v) => setFormData({ ...formData, botanical_name: v })}
          />
          <EditRow
            label="Scientific"
            value={formData.scientific_name}
            onChange={(v) => setFormData({ ...formData, scientific_name: v })}
          />
        </div>

        <div className="space-y-4">
          <TextAreaField
            label="သွင်ပြင်လက္ခဏာ"
            value={formData.description}
            onChange={(v) => setFormData({ ...formData, description: v })}
          />
          <TextAreaField
            label="တွေ့ရှိရသောနေရာ"
            value={formData.location}
            onChange={(v) => setFormData({ ...formData, location: v })}
          />
          <TextAreaField
            label="ပျောက်ကင်းနိုင်သောရောဂါများ"
            value={formData.diseases}
            onChange={(v) => setFormData({ ...formData, diseases: v })}
          />
          <TextAreaField
            label="ကိုးကားချက်"
            value={formData.reference}
            onChange={(v) => setFormData({ ...formData, reference: v })}
          />
        </div>

        <div className="pt-4 space-y-3">
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="w-full bg-[#007AFF] text-white font-bold py-4 rounded-[20px] shadow-lg shadow-blue-100 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            onClick={() => setShowConfirmDelete(true)}
            disabled={saving}
            className="w-full bg-white text-red-600 text-[20px] font-semibold py-4 rounded-[14px] active:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <IoTrashOutline size={24} />
            <span>Delete Contribution</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function EditRow({ label, value, onChange }) {
  return (
    <div className="flex items-center px-4 py-4">
      <span className="w-24 text-[14px] text-gray-400 font-medium">
        {label}
      </span>
      <input
        className="flex-1 bg-transparent text-[16px] text-black focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange }) {
  return (
    <div className="space-y-1.5 px-1">
      <label className="text-[13px] font-semibold text-gray-500 uppercase ml-4">
        {label}
      </label>
      <textarea
        rows="4"
        className="w-full bg-white rounded-[22px] p-4 text-[16px] text-gray-800 border border-gray-200 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
