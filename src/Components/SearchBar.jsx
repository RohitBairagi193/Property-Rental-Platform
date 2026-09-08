import React, { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    city: "",
    type: "",
    budget: "",
  });

  const handleSearch = () => {
    const queryParams = new URLSearchParams();

    if (filters.city) queryParams.append("city", filters.city);
    if (filters.type) queryParams.append("type", filters.type);
    if (filters.budget) queryParams.append("budget", filters.budget);
    navigate(
      `/properties?city=${filters.city}&type=${filters.type}&budget=${filters.budget}`,
    );
  };

  return (
    <>
      <div className="relative z-9 flex flex-col items-center justify-center h-full px-6 text-center spacing-base">
        <h1 className="display-lg text-white max-w-4xl spacing-base mb-4">
          Find Your Perfect Home in India
        </h1>

        <p className="text-white/80 text-body-md max-w-2xl mb-10 leading-body spacing-base">
          Discover premium rentals and luxury properties tailored to your
          lifestyle across the nation's most vibrant cities.
        </p>

        <div className="bg-white rounded-xl p-5 flex flex-col lg:flex-row items-end gap-4 w-full max-w-5xl shadow-modal">
          <div className="flex flex-col gap-1 flex-1 w-full">
            <label className="input-label text-left">City</label>

            <select
              className="input font-bold"
              value={filters.city}
              onChange={(e) =>
                setFilters({ ...filters, city: e.target.value })
              }>
              <option value="">Select City</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Indore">Indore</option>
              <option value="Bhopal">Bhopal</option>
              <option value="Bengaluru">Bengaluru</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 flex-1 w-full">
            <label className="input-label text-left">Property Type</label>

            <select
              className="input font-bold"
              value={filters.type}
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value })
              }>
              <option value="">Select Type</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="PG">PG</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 flex-1 w-full">
            <label className="input-label text-left">Budget</label>

            <select
              className="input font-bold"
              value={filters.budget}
              onChange={(e) =>
                setFilters({ ...filters, budget: e.target.value })
              }>
              <option value="">Select Budget</option>

              <option value="10000-25000">₹10,000 - ₹25,000</option>

              <option value="25000-50000">₹25,000 - ₹50,000</option>

              <option value="50000-100000">₹50,000 - ₹1 Lakh</option>

              <option value="100000+">₹1 Lakh+</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="btn btn-secondary h-11 px-7 whitespace-nowrap w-full lg:w-auto">
            <Search size={18} />
            Search
          </button>
        </div>
      </div>
    </>
  );
};

export default SearchBar;
