import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMail, FiPhone } from "react-icons/fi"; // Added FiMail and FiPhone
import {
  IoInformationCircle,
  IoShieldCheckmark,
  IoChevronForward,
  IoChevronDown,
} from "react-icons/io5";
import leafIcon from '../assets/Herbal_Icon.png';
import profilePic from '../assets/developer_profile.jpg'; // Added missing import

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col font-sans">
      {/* Cupertino Header */}
      <div className="flex items-center px-4 py-3 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-[#007AFF] active:opacity-40 transition-opacity"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-semibold text-[17px] text-black">
          About
        </h1>
        <div className="w-8" />
      </div>

      <div className="p-4 space-y-6">
        {/* App Logo/Branding Section */}
        <div className="flex flex-col items-center py-6">
          <div className="w-24 h-24 bg-white rounded-[22px] shadow-sm border border-gray-100 flex items-center justify-center mb-3">
            <img
              src={leafIcon}
              alt="Leaf Icon"
              className="w-18 h-18 object-contain"
            />
          </div>
          <h2 className="text-[22px] font-bold text-black">
            Herbal Plant Directory MM
          </h2>
          <p className="text-[15px] text-gray-500">Version 1.0.0 (2026)</p>
        </div>

        {/* Mission Section */}
        <div className="space-y-1.5 px-1">
          <h3 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide ml-1">
            Our Mission
          </h3>
          <div className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm">
            <p className="text-[15px] text-gray-800 leading-relaxed">
              မြန်မာနိုင်ငံရှိ ရုက္ခဗေဒဆိုင်ရာ ဗဟုသုတများကို
              ထိန်းသိမ်းစောင့်ရှောက်ရန် ရည်ရွယ်ပါသည်။ သုတေသီများ၊
              ကျောင်းသားများနှင့် သဘာဝပတ်ဝန်းကျင်ကို မြတ်နိုးသူများအတွက်
              ဒေသမျိုးရင်းအပင်များ၏ အချက်အလက်များကို တစ်နေရာတည်းတွင် လွယ်ကူစွာ
              လေ့လာနိုင်စေရန် ရည်မှန်းဆောင်ရွက်နေခြင်း ဖြစ်ပါသည်။
            </p>
            <p className="mt-2 text-[15px] text-gray-800 leading-relaxed">
              This directory is dedicated to preserving botanical knowledge in
              Myanmar. Our goal is to provide a comprehensive, accessible
              database of local plant species for researchers, students, and
              nature lovers.
            </p>
          </div>
        </div>

        {/* Information Group Section */}
        <div className="space-y-1.5 px-1">
          <h3 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide ml-1">
            Information
          </h3>
          <div className="bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-sm">
            <AboutLink
              icon={<IoShieldCheckmark className="text-[#34C759]" />}
              label="Privacy Policy"
              content="Your privacy is important to us. We do not collect personal data without your consent. All herbal information is stored locally or fetched securely."
            />
            <AboutLink
              icon={<IoInformationCircle className="text-[#007AFF]" />}
              label="Terms of Service"
              content="By using this app, you agree that the information provided is for educational purposes only and should not replace professional medical advice."
              isLast
            />
          </div>
        </div>

        {/* Developer Section (2 Columns) */}
        <div className="space-y-1.5 px-1">
          <h3 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide ml-1">Developer</h3>
          <div className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm flex gap-4 items-center">
            {/* Column 1: Profile Pic */}
            <div className="flex-shrink-0">
              <img 
                src={profilePic} 
                alt="Developer" 
                className="w-20 h-20 rounded-full object-cover border-2 border-[#007AFF]/10"
              />
            </div>
            
            {/* Column 2: Info & Buttons */}
            <div className="flex-1 space-y-2">
              <div>
                <h4 className="text-[17px] font-bold text-black">Htut Khaung</h4>
                <p className="text-[13px] text-gray-500">Full Stack</p>
              </div>
              <div className="flex gap-2">
                <a 
                  href="mailto:dev.htutkhaung@gmail.com"
                  className="flex items-center gap-1.5 bg-[#F2F2F7] px-3 py-1.5 rounded-full text-[#007AFF] text-[13px] font-medium active:opacity-50 transition-opacity"
                >
                  <FiMail size={14} /> Email
                </a>
                <a 
                  href="tel:+959772364896"
                  className="flex items-center gap-1.5 bg-[#F2F2F7] px-3 py-1.5 rounded-full text-[#34C759] text-[13px] font-medium active:opacity-50 transition-opacity"
                >
                  <FiPhone size={14} /> Call
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <p className="text-[12px] text-gray-400 text-center px-1 pt-4">
          ဤ Web-app တွင်ဖော်ပြထားသော အချက်အလက်များသည် ပညာပေးရည်ရွယ်ချက်အတွက်သာ ဖြစ်ပါသည်။ အပင်များကို ဆေးဘက်ဆိုင်ရာ ရည်ရွယ်ချက်ဖြင့် အသုံးပြုမည်ဆိုပါက သက်ဆိုင်ရာ ကျွမ်းကျင်ပညာရှင်များနှင့် အမြဲမပြတ် တိုင်ပင်ဆွေးနွေးမှုများ ပြုလုပ်ရန် လိုအပ်ပါသည်။
        </p>

        <p className="text-[12px] text-gray-400 text-center px-1">
          The information provided in this web-app is for educational purposes only.
          Always consult a professional before using plants for medicinal
          purposes.
        </p>

        <p className="text-center text-[12px] text-gray-300 pb-10">
          © 2026 Herbal Plant Directory Myanmar
        </p>
      </div>
    </div>
  );
}

function AboutLink({ icon, label, content, isLast = false, onClick, isAction = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (isAction && onClick) {
      onClick();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`${!isLast ? "border-b border-gray-100" : ""}`}>
      <div
        onClick={handleClick}
        className="flex items-center justify-between px-4 py-3.5 active:bg-gray-50 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="text-[16px] text-black font-medium">{label}</span>
        </div>
        
        {isAction ? (
          <IoChevronForward className="text-gray-300" />
        ) : (
          <IoChevronDown 
            className={`text-gray-300 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
          />
        )}
      </div>

      {isOpen && !isAction && (
        <div className="px-11 pb-4 pr-6">
          <p className="text-[14px] text-gray-600 leading-normal animate-fade-in">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}