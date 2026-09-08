import React, { useState, useContext, useEffect } from "react";
import { Heart, MapPin, Bed, Bath, Maximize2, IndianRupee } from "lucide-react";
import Wishlist from "../Pages/Wishlist";
import { MyContext } from "../Context/MyContextProvder";
import { DetailedProperty } from "../Context/DetailedProperty";
import { useNavigate } from "react-router-dom";

const Card = ({ properties }) => {
  const [isLiked, setIsLiked] = useState([]);
  const { wishlist, setWishlist } = useContext(MyContext);
  const { detailproperty, setDetailProperty } = useContext(DetailedProperty);
  const navigate = useNavigate();

  const addToWishlist = (property) => {
    setWishlist(wishlist ? [...wishlist, property] : [property]);
    console.log("Added to wishlist:", property);
  };

const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
    console.log("Removed from wishlist, ID:", id);
  };

  const toggleLike = (id) => {
    setIsLiked((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const viewDetails = (property) => {
    setDetailProperty(
      detailproperty ? [...detailproperty, property] : [property],
    );
    console.log("Viewing details for:", property);
    navigate("/propertiesdetail", { state: property });
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-6 px-6">
        {properties.map((property, id) => (
          <div key={id} className="card p-0 group">
            <div className="relative h-50 overflow-hidden">
              <div className="w-full h-full curson-zoom-in bg-surface-container flex items-center justify-center text-5xl">
                <img
                  onClick={() => viewDetails(property)}
                  loading="lazy"
                  src={property.image}
                  alt={property.title}
                  className="property-img "
                />
              </div>
              {property.available ? (
                <span className="absolute top-3 left-3 badge badge-primary">
                  Available
                </span>
              ) : (
                <span className="absolute top-3 left-3 badge badge-secondary">
                  Rented
                </span>
              )}

              <button
                onClick={() => {
                  if (isLiked.includes(id)) {
                    toggleLike(id);
                    removeFromWishlist(property.id);
                  } else {
                    toggleLike(id);
                    addToWishlist(property);
                  }
                }}
                className="absolute top-3 cursor-pointer right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-btn">
                {isLiked.includes(id) === true ? (
                  <Heart

                    size={14}
                    className="text-red-700 fill-red-700 transition-colors"
                  />
                ) : (
                  <Heart
                    size={14}
                    className="text-on-surface-variant group-target:fill-red-700  transition-colors"
                  />
                )}
              </button>
            </div>

            <div className="p-md">
              <div className="flex justify-between items-start mb-1">
                <span className="text-on-surface font-semibold text-body-md">
                  {property.title}
                </span>
                <span className="price">
                  <IndianRupee className="inline" size={20} />
                  {property.price}
                </span>
              </div>
              <p className="text-on-surface-variant text-body-sm mb-3">
                <MapPin size={16} className="inline-block mr-1" />{" "}
                {property.location}
              </p>
              <div className="h-px bg-surface-container-high mb-3" />
              <div className="flex flex-wrap gap-3">
                {property.feats.map((f, i) => (
                  <span
                    key={i}
                    className="text-on-surface-variant text-label-caps flex items-center gap-1">
                    {i === 0 ? (
                      <Bed size={16} />
                    ) : i === 1 ? (
                      <Bath size={16} />
                    ) : (
                      <Maximize2 size={16} />
                    )}{" "}
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Card;
