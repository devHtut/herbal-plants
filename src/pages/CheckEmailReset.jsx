import { useNavigate, useLocation } from "react-router-dom";
import { IoMailOpenOutline, IoChevronBack } from "react-icons/io5";

export default function CheckEmailReset() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "သင်၏ email";

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col font-sans">
      <div className="flex items-center px-4 py-3 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200">
        <button onClick={() => navigate("/login")} className="text-[#007AFF] flex items-center gap-1 active:opacity-50">
          <IoChevronBack size={24} />
          <span className="text-[17px]">Back to Login</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-8 pt-16">
        <div className="w-24 h-24 bg-white rounded-[24px] shadow-sm flex items-center justify-center mb-8 border border-gray-100">
          <IoMailOpenOutline className="text-[#007AFF] text-5xl animate-bounce" />
        </div>

        <h1 className="text-[28px] font-bold text-black tracking-tight mb-4 text-center">
          Email ကိုဝင်စစ်ကြည့်ပါ
        </h1>
        
        <p className="text-gray-600 text-[16px] text-center mb-8 leading-relaxed">
          ကျနော်တို့ password reset link ကို <br/>
          <span className="font-semibold text-black">{email}</span> သို့ ပို့ပေးထားပါတယ်
        </p>

        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 w-full max-w-sm">
          <h3 className="text-[15px] font-bold text-black mb-2">မရရှိသေးပါက -</h3>
          <ul className="text-[14px] text-gray-500 space-y-2 list-disc ml-4">
            <li>Spam သို့မဟုတ် Junk folder ကိုစစ်ကြည့်ပါ။</li>
            <li>Email address မှန်မမှန် ပြန်စစ်ပါ။</li>
            <li>မိနစ်အနည်းငယ် စောင့်ပြီးမှ ထပ်မံကြိုးစားကြည့်ပါ။</li>
          </ul>
        </div>

        <button
          onClick={() => window.open("https://mail.google.com", "_blank")}
          className="mt-10 bg-white border border-gray-200 text-black font-semibold py-3 px-8 rounded-full shadow-sm active:scale-95 transition-all"
        >
          Open Gmail App
        </button>
      </div>
    </div>
  );
}