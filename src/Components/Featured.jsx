import React, { useEffect, useState } from "react";
import Card from "./Card";
import defaultProperties from "../assets/property";
import { subscribeToProperties } from "../firebase/properties";
import { Building2 } from "lucide-react";


const MAX_FEATURED = 3;

const propertyKey = (property) => `${property.title}|${property.location}`;


const mergeProperties = (firebaseProperties) => {
  const firebaseKeys = new Set(firebaseProperties.map(propertyKey));
  return [
    ...defaultProperties.filter(
      (property) => !firebaseKeys.has(propertyKey(property)),
    ),
    ...firebaseProperties,
  ];
};


const pickFeatured = (properties) =>
  [...properties]
    .sort((a, b) => (b.available ? 1 : 0) - (a.available ? 1 : 0))
    .slice(0, MAX_FEATURED);

const Featured = () => {
 
  const [properties, setProperties] = useState(null);

  useEffect(() => {
    
    const unsubscribe = subscribeToProperties(
      (list) => setProperties(mergeProperties(list)),
      () => setProperties(defaultProperties),
    );
    return unsubscribe;
  }, []);

  return (
    <>
      <div className="container-main bg-white py-10 md:py-14 max-w-container-max mx-auto px-4 md:px-lg">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div className="px-0 md:px-6">
            <h1 className="text-on-surface">
              Trending Properties
              <Building2 className="inline ml-2" size={30} />
            </h1>
            <p className="text-on-surface-variant text-body-sm mt-1">
              Explore listings from our platform
            </p>
          </div>
          <a href="/properties">
            <span className="text-secondary text-body-sm font-semibold border-b border-secondary pb-px cursor-pointer">
              View All Properties
            </span>
          </a>
        </div>

        {properties === null ? (
          <p className="text-on-surface-variant text-body-sm text-center py-10">
            Loading properties...
          </p>
        ) : properties.length === 0 ? (
          <p className="text-on-surface-variant text-body-sm text-center py-10">
            No properties listed yet. Please check back soon.
          </p>
        ) : (
          <Card properties={pickFeatured(properties)} />
        )}
      </div>
    </>
  );
};

export default Featured;
