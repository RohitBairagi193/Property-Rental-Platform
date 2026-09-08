import React from "react";
import Card from "./Card";
import trendingItems from "../assets/trendingitems";
import { TrendingUp } from "lucide-react";


const Featured = () => {
  return (
    <>
      <div className="container-main bg-white py-14 max-w-container-max mx-auto px-lg">
        <div className="flex items-end justify-between mb-8">
          <div className="px-6">
            <h1 className="text-on-surface">Trending Properties<TrendingUp className="inline ml-1" size={30}/> </h1>
            <p className="text-on-surface-variant text-body-sm mt-1">
              Handpicked premium listings for you
            </p>
          
          </div>
          <a href="/properties">  <span className="text-secondary text-body-sm font-semibold border-b border-secondary pb-px cursor-pointer">
            View All Properties
          </span></a>
        
        </div>
        <Card properties={trendingItems}/>
      </div>
    </>
  );
};

export default Featured;
