"use client";

export function HeroVideo() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 z-10" /> {/* Dark overlay */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover opacity-80"
      >
        <source src="/dexdrip promo.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
