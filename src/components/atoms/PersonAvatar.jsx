"use client";
import React from "react";
import Image from "next/image";

const PersonAvatar = ({
  imageUrl,
  altText,
  description,
  width = 150,
  height = 150,
}) => {
  return (
    <>
      <Image
        src={imageUrl}
        alt={altText}
        width={width}
        height={height}
        className="rounded-full object-cover border-4 border-white shadow-md"
        priority
      />
      <div className="flex-1 text-center md:text-left">
        <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto md:mx-0">
          {description}
        </p>
      </div>
    </>
  );
};

export default PersonAvatar;
