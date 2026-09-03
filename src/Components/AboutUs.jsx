import React from "react";
import { Search, Shield, Smartphone } from "lucide-react";

const CHOOSE_DATA = [
  {
    icon: <Search size={24} />,
    title: "Easy Search",
    desc: "Find exactly what you need with our advanced filters and intuitive map based search interface.",
  },
  {
    icon: <Shield size={24} />,
    title: "Verified Properties",
    desc: "Every listing on our platform undergoes a rigorous 20-point verification process for your peace of mind.",
  },
  {
    icon: <Smartphone size={24} />,
    title: "Online Booking",
    desc: "Schedule visits, sign rent agreements, and pay deposits all within our secure digital ecosystem.",
  },
];
const AboutUs = () => {
  return (
    <>
      <div className="container-main text-center">
        <h2 className="display-lg text-3xl text-on-surface mb-2">
          About GharDhundho
        </h2>
        <p className="text-on-surface-variant text-body-sm mb-12">
          We redefine the rental experience with transparency and technology.
        </p>

        <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
          {CHOOSE_DATA.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="card text-center hover:shadow-modal transition-shadow">
              <div className="w-14 h-14 bg-primary-fixed rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
                {icon}
              </div>
              <h3 className="text-on-surface mb-2">{title}</h3>
              <p className="text-on-surface-variant text-body-sm leading-body">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AboutUs;
