"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, Camera, User } from "lucide-react";

interface ProfileImageUploadProps {
  currentImage?: string;
  userName: string;
  userRole: "ADMIN" | "RESEARCHER" | "USER";
  onImageChange: (imageUrl: string) => void;
  className?: string;
}

export default function ProfileImageUpload({ 
  currentImage, 
  userName, 
  userRole, 
  onImageChange,
  className = ""
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage || "");
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, or GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);

    // Upload to server (mock implementation)
    setTimeout(() => {
      // In production, this would be an actual API call
      console.log('Uploading image:', file.name);
      onImageChange(result);
      setIsUploading(false);
    }, 1500);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case "ADMIN":
        return "from-purple-500 to-pink-500";
      case "RESEARCHER":
        return "from-blue-500 to-cyan-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getInitials = () => {
    return userName
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Upload Button Overlay */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div
        className={`relative w-full h-full cursor-pointer group transition-all duration-300 ${
          isHovered ? "scale-105" : ""
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleUploadClick}
      >
        {/* Current Image or Fallback */}
        {previewUrl ? (
          <div className="w-full h-full relative overflow-hidden rounded-2xl">
            <img
              src={previewUrl}
              alt={`${userName} profile`}
              className="w-full h-full object-cover"
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Fallback Avatar */
          <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${getRoleColor()} flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:shadow-xl transition-all duration-300`}>
            {getInitials()}
            <Camera className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}

        {/* Loading State */}
        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <p className="text-xs text-gray-600 whitespace-nowrap">
          Click to upload photo<br />
          JPG, PNG, GIF • Max 5MB
        </p>
      </div>
    </div>
  );
}
