import React from 'react'
import properties from '../assets/property'


const totalCities = new Set(
  properties.map((property) => property.location.split(",")[1]?.trim())
).size;
const STATUS_DATA = [
  { num: properties.length, label: "Total Properties" },
  { num: totalCities+`+`, label: "Cities" },
  { num: "10k+", label: "Happy Tenants" },
  { num: "4.8/5", label: "Average Rating" },
];
const StatusBar = () => {
  return (
    <>
        <div className="container-main">
          <div className=" items-center justify-evenly gap-8 h-full grid grid-cols-4 text-center divide-x divide-white/10">
            {STATUS_DATA.map(({ num, label }) => (
              <div key={label} className="px-6 py-2">
                <div className="text-white font-serif text-h1 font-bold">
                  {num}
                </div>
                <div className="text-white/60 text-label-caps uppercase tracking-label-caps mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
    </>
  )
}

export default StatusBar