import React, { useState, useContext, useEffect } from "react";
import { Heart, MapPin, Bed, Bath, Maximize2, IndianRupee } from "lucide-react";
import { MyContext } from "../Context/MyContextProvder";
import { useNavigate } from "react-router-dom";

const CardItems = ({ wishlist }) => {
  const { setWishlist } = useContext(MyContext);
  const navigate = useNavigate("");

  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
    console.log("Removed from wishlist, ID:", id);
  };

  const viewDetails = (wishlist) => {
    navigate("/propertiesdetail", { state: wishlist});
  };
  return (
    <>
      <div className="grid grid-cols-3 gap-6 px-6">
        {Object.keys(wishlist).length === 0 ? (
          <p className="text-2xl font-bold ">No items in wishlist</p>
        ) : (
          wishlist.map((prop, id) => (
            <div key={id} className="card p-0 cursor-pointer group">
              <div className="relative h-50 overflow-hidden">
                <div className="w-full h-full bg-surface-container flex items-center justify-center text-5xl">
                  <img
                    onClick={()=>{viewDetails(prop)}}
                    loading="lazy"
                    src={prop.image}
                    alt={prop.title}
                    className="property-img "
                  />
                </div>
                {prop.available ? (
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
                    removeFromWishlist(prop.id);
                  }}
                  className="absolute top-3 cursor-pointer right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-btn">
                  <Heart
                    size={14}
                    className="text-on-surface-variant fill-red-700 transition-colors"
                  />
                </button>
              </div>

              <div className="p-md">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-on-surface font-semibold text-body-md">
                    {prop.title}
                  </span>
                  <span className="price">
                    <IndianRupee className="inline" size={20} />
                    {prop.price}
                  </span>
                </div>
                <p className="text-on-surface-variant text-body-sm mb-3">
                  <MapPin size={16} className="inline-block mr-1" />{" "}
                  {prop.location}
                </p>
                <div className="h-px bg-surface-container-high mb-3" />
                <div className="flex flex-wrap gap-3">
                  {prop.feats.map((f, i) => (
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
          ))
        )}
      </div>
    </>
  );
};

export default CardItems;
