import React, { useEffect, useState } from "react";
import defaultProperties from "../assets/property";
import { subscribeToProperties } from "../firebase/properties";

const propertyKey = (property) => `${property.title}|${property.location}`;

// Same merge the Properties page uses: static listings + Firebase listings,
// with duplicates (same title + location) removed.
const mergeProperties = (firebaseProperties) => {
  const firebaseKeys = new Set(firebaseProperties.map(propertyKey));
  return [
    ...defaultProperties.filter(
      (property) => !firebaseKeys.has(propertyKey(property)),
    ),
    ...firebaseProperties,
  ];
};

// Location is "Area, City" (or just "City"). Cities are compared
// case-insensitively, so "indore" and "Indore" count once.
const countCities = (properties) => {
  const cities = new Set();
  properties.forEach(({ location }) => {
    const parts = String(location || "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const city = (parts[1] ?? parts[0])?.toLowerCase();
    if (city) cities.add(city);
  });
  return cities.size;
};

const StatusBar = () => {
  // null = still loading, so we show "—" instead of a misleading 0.
  const [properties, setProperties] = useState(null);

  useEffect(() => {
    // Live listener: the numbers update by themselves when a property is
    // added, edited or deleted, and stop listening when the component unmounts.
    const unsubscribe = subscribeToProperties(
      (list) => setProperties(mergeProperties(list)),
      () => setProperties(defaultProperties),
    );
    return unsubscribe;
  }, []);

  const STATUS_DATA = [
    { num: properties ? properties.length : "—", label: "Total Properties" },
    { num: properties ? countCities(properties) : "—", label: "Cities" },
    { num: "10k+", label: "Happy Tenants" },
    { num: "4.8/5", label: "Average Rating" },
  ];

  return (
    <>
      <div className="container-main">
        <div className=" items-center justify-evenly gap-y-6 gap-x-4 md:gap-8 h-full grid grid-cols-2 md:grid-cols-4 text-center md:divide-x md:divide-white/10">
          {STATUS_DATA.map(({ num, label }) => (
            <div key={label} className="px-2 md:px-6 py-2">
              <div className="text-white font-serif text-h2 md:text-h1 font-bold">
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
  );
};

export default StatusBar;
