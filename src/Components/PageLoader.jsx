import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import loaderAnimation from "../assets/Property Search House Morph 01.json";

const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <DotLottieReact
        src="https://lottie.host/1dfcff09-eff8-4724-84f7-593a8abcca7e/0u4RTC6o1h.lottie"
        loop
        autoplay
        onError={(error) => console.error("Lottie animation error:", error)}
        className="w-40 h-40"
      />
    </div>
  );
};

export default PageLoader;