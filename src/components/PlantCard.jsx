import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";

export default function PlantCard({ plant, user }) {
  const navigate = useNavigate();
  const image = plant.plant_photos?.[0]?.image_url;
  const [saved, setSaved] = useState(false);


  return (
    <div className="relative mb-3">
      {/* 1. The Main Card (Navigation Only) */}
      <div
        onClick={() => navigate(`/plants/${plant.id}`)}
        className="flex items-center bg-white active:bg-gray-100 transition-all rounded-[20px] p-3 shadow-sm border border-gray-100 cursor-pointer"
      >
        <img
          src={image || "/placeholder.png"}
          className="w-20 h-20 rounded-[15px] object-cover border border-gray-50"
          alt="plant"
        />

        <div className="ml-4 flex-1 pr-10">
          <h2 className="text-[17px] font-bold text-gray-900 leading-tight">
            {plant.myanmar_name}
          </h2>
          <p className="text-[14px] text-gray-600 mt-1">
            <span className="font-semibold text-gray-800">English Name:</span> {plant.english_name}
          </p>
          {(plant.scientific_name || plant.botanical_name) && (
            <p className="text-[13px] text-gray-500 mt-0.5">
              <span className="font-semibold text-gray-800">
                {plant.scientific_name ? "Scientific Name:" : "Botanical Name:"}
              </span>{" "}
              <span className="italic">{plant.scientific_name || plant.botanical_name}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}