import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiX,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

export default function AddPlantInfo() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Status Pop-up States
  const [status, setStatus] = useState({ show: false, type: "", message: "" });

  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [formData, setFormData] = useState({
    myanmar_name: "",
    english_name: "",
    botanical_name: "",
    scientific_name: "",
    description: "",
    location: "",
    diseases: "",
    reference: "",
  });

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) navigate("/login");
      else setUser(user);
    };
    checkUser();
  }, [navigate]);

  const showPopup = (type, message) => {
    setStatus({ show: true, type, message });
    if (type === "success") {
      setTimeout(() => navigate("/"), 2500);
    } else {
      setTimeout(() => setStatus({ ...status, show: false }), 3000);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // 1. Lower the resolution.
          // 1000px is more than enough for a mobile app screen.
          const MAX_WIDTH = 1000;
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // 2. The recursive loop to ensure size < 400KB
          const minSize = 400 * 1024; // 400KB in bytes

          const attemptCompression = (q) => {
            canvas.toBlob(
              (blob) => {
                // If the file is small enough OR quality has dropped too low (0.2)
                if (blob.size <= minSize || q <= 0.2) {
                  // Create a clean file object
                  // Note: We don't worry about the name here, we randomize it on upload
                  resolve(
                    new File(
                      [blob],
                      "upload.jpg", 
                      { type: "image/jpeg" },
                    ),
                  );
                } else {
                  // Reduce quality by 0.1 and try again
                  attemptCompression(q - 0.1);
                }
              },
              "image/jpeg",
              q,
            );
          };

          attemptCompression(0.7); // Initial start at 70% quality
        };
      };
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (previews.length + files.length > 6) {
      showPopup("error", "Maximum 6 photos allowed");
      return;
    }
    setLoading(true);
    const compressedFiles = await Promise.all(
      files.map((file) => compressImage(file)),
    );
    setImageFiles((prev) => [...prev, ...compressedFiles]);
    setPreviews((prev) => [
      ...prev,
      ...compressedFiles.map((file) => URL.createObjectURL(file)),
    ]);
    setLoading(false);
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Check if all text fields are filled
    const isFormIncomplete = Object.values(formData).some(
      (value) => value.trim() === "",
    );
    if (isFormIncomplete) {
      showPopup("error", "အချက်အလက်အားလုံး ဖြည့်စွက်ရန် လိုအပ်ပါသည်");
      return;
    }

    // Check if at least one photo is uploaded
    if (imageFiles.length === 0) {
      showPopup("error", "အနည်းဆုံး ဓာတ်ပုံတစ်ပုံ တင်ပေးပါ");
      return;
    }

    setLoading(true);

    try {
      const { data: plantData, error: plantError } = await supabase
        .from("plants")
        .insert([{ ...formData, contributor_id: user.id }])
        .select()
        .single();

      if (plantError) throw plantError;

      const photoInserts = await Promise.all(
        imageFiles.map(async (file) => {
          // FIX: Generate a clean, random filename. 
          // Avoids issues with Myanmar characters or spaces in original filename.
          const fileExt = "jpg";
          const randomName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${user.id}/${randomName}`;

          const { error: uploadError } = await supabase.storage
            .from("plant-images")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("plant-images").getPublicUrl(filePath);

          return { plant_id: plantData.id, image_url: publicUrl };
        }),
      );

      if (photoInserts.length > 0) {
        const { error: photoError } = await supabase
          .from("plant_photos")
          .insert(photoInserts);
        if (photoError) throw photoError;
      }

      showPopup("success", "အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ");
    } catch (error) {
      console.error("Upload error:", error);
      showPopup("error", error.message || "Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#F2F2F7] flex flex-col font-sans relative overflow-hidden">
      {/* Dynamic Status Pop-up */}
      {status.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() =>
              status.type !== "success" && setStatus({ ...status, show: false })
            }
          />
          <div className="bg-white rounded-[30px] p-8 shadow-2xl border border-gray-100 flex flex-col items-center text-center relative max-w-xs w-full animate-in zoom-in duration-300">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${status.type === "success" ? "bg-green-500 shadow-green-100" : "bg-red-500 shadow-red-100"} shadow-lg`}
            >
              {status.type === "success" ? (
                <FiCheckCircle className="text-white text-3xl" />
              ) : (
                <FiAlertCircle className="text-white text-3xl" />
              )}
            </div>
            <h2 className="text-xl font-bold text-black mb-2">
              {status.type === "success" ? "Done!" : "Wait!"}
            </h2>
            <p className="text-gray-500 text-[15px]">{status.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-[#007AFF] active:opacity-50"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-semibold text-[17px] text-black">
          Add New Plant
        </h1>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="text-[#007AFF] font-bold text-[17px] active:opacity-50 disabled:opacity-30"
        >
          {loading ? "..." : "Save"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-12">
        {/* Photo Grid */}
        <div className="space-y-1.5 px-1">
          <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide ml-1">
            Photos (All Required)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {previews.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  className="w-full h-40 rounded-[20px] object-cover shadow-sm border border-gray-100"
                  alt="preview"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white backdrop-blur-md"
                >
                  <FiX size={16} />
                </button>
              </div>
            ))}
            {previews.length < 6 && (
              <label className="flex flex-col items-center justify-center w-full h-40 bg-white border-2 border-dashed border-gray-200 rounded-[20px] cursor-pointer hover:bg-gray-50 transition-colors">
                <FiPlus size={28} className="text-[#007AFF] mb-1" />
                <span className="text-gray-400 text-[12px]">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={loading}
                />
              </label>
            )}
          </div>
        </div>

        {/* Input Rows */}
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
          <InputRow
            label="Myanmar Name"
            placeholder="Required"
            value={formData.myanmar_name}
            onChange={(v) => setFormData({ ...formData, myanmar_name: v })}
          />
          <InputRow
            label="English Name"
            placeholder="Required"
            value={formData.english_name}
            onChange={(v) => setFormData({ ...formData, english_name: v })}
          />
          <InputRow
            label="Botanical Name"
            placeholder="Required"
            value={formData.botanical_name}
            onChange={(v) => setFormData({ ...formData, botanical_name: v })}
          />
          <InputRow
            label="Scientific Name"
            placeholder="Required"
            value={formData.scientific_name}
            onChange={(v) => setFormData({ ...formData, scientific_name: v })}
          />
        </div>

        {/* Textareas */}
        <div className="space-y-4">
          <EditableSection
            title="သွင်ပြင်လက္ခဏာ (Description)"
            placeholder="Describe the plant..."
            value={formData.description}
            onChange={(v) => setFormData({ ...formData, description: v })}
          />
          <EditableSection
            title="တွေ့ရှိရသောနေရာဒေသ (Location)"
            placeholder="Where to find it..."
            value={formData.location}
            onChange={(v) => setFormData({ ...formData, location: v })}
          />
          <EditableSection
            title="ပျောက်ကင်းနိုင်‌သောရောဂါများ (Diseases)"
            placeholder="Treatable diseases..."
            value={formData.diseases}
            onChange={(v) => setFormData({ ...formData, diseases: v })}
          />
          <EditableSection
            title="Reference"
            placeholder="Reference source..."
            value={formData.reference}
            onChange={(v) => setFormData({ ...formData, reference: v })}
          />
        </div>
      </div>
    </div>
  );
}

function InputRow({ label, placeholder, value, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
      <span className="text-[14px] font-medium text-gray-400 whitespace-nowrap">
        {label}
      </span>
      <input
        className="text-[15px] text-right ml-4 text-black focus:outline-none placeholder-gray-300 w-full"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function EditableSection({ title, placeholder, value, onChange }) {
  return (
    <div className="space-y-1.5 px-1">
      <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide ml-1">
        {title}
      </h2>
      <div className="bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm">
        <textarea
          className="w-full text-[15px] text-gray-800 leading-relaxed focus:outline-none min-h-[80px] resize-none"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}