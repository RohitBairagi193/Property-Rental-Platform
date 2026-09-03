import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Card from "../Components/Card";
import defaultProperties from "../assets/property";
import Footer from "../Components/Footer";
import { useLocation } from "react-router-dom";
import PageLoader from "../Components/PageLoader";
import usePageLoader from "../assets/usePageLoader";

const Properties = () => {
  const loading = usePageLoader();
  const location = useLocation();
  const [allProperties, setAllProperties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const params = new URLSearchParams(location.search);
  const cityParam = params.get("city") || "";
  const typeParam = params.get("type") || "";
  const budgetParam = params.get("budget") || "";

  const [searchLocal, setSearchLocal] = useState(cityParam);

  const [propertyType, setPropertyType] = useState(
    typeParam ? [typeParam] : [],
  );

  const [maxPrice, setMaxPrice] = useState(300000);

  const [sortOption, setSortOption] = useState("Newest First");

  const [bhkType, setBhkType] = useState(null);

  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    setAllProperties(defaultProperties);
  }, []);

  const propertiesPerPage = 6;

  const filteredProperties = allProperties
    .filter((property) => {
      const matchLocation = property.location
        .toLowerCase()
        .includes(searchLocal.toLowerCase());

      const matchType =
        propertyType.length === 0 || propertyType.includes(property.type);

      const matchPrice = property.price <= maxPrice;

      const propertyBHK = parseInt(property.feats[0]);

      const matchBHK =
        !bhkType || (bhkType >= 3 ? propertyBHK >= 3 : propertyBHK === bhkType);

      const matchAmenities =
        amenities.length === 0 ||
        amenities.every((a) => property.amenities.includes(a));

      return (
        matchLocation && matchType && matchPrice && matchBHK && matchAmenities
      );
    })
    .sort((a, b) => {
      if (sortOption === "Price Low to High") return a.price - b.price;

      if (sortOption === "Price High to Low") return b.price - a.price;

      return b.id - a.id;
    });

  const handleAmenities = (item) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item],
    );
  };

  const handlePropertyType = (type) => {
    setPropertyType((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type],
    );
  };
  const bhkList = [
    ...new Set(allProperties.map((p) => parseInt(p.feats[0]))),
  ].sort((a, b) => a - b);

  useEffect(() => {
    if (budgetParam === "10000-25000") {
      setMaxPrice(25000);
    }

    if (budgetParam === "25000-50000") {
      setMaxPrice(50000);
    }

    if (budgetParam === "50000-100000") {
      setMaxPrice(100000);
    }

    if (budgetParam === "100000+") {
      setMaxPrice(1000000);
    }
  }, [budgetParam]);

  const indexOfLastProperty = currentPage * propertiesPerPage;

  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;

  const currentProperties = filteredProperties.slice(
    indexOfFirstProperty,
    indexOfLastProperty,
  );

  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <div className="container-main mx-auto px-lg pt-20 flex gap-8">
        <div className="w-75 card h-fit sticky top-20">
          <h3 className="mb-4">Filters</h3>

          <div className="mb-4">
            <p className="label-caps mb-2">Property Type</p>

            <div className="flex flex-col gap-2 text-body-sm">
              <label>
                <input
                  type="checkbox"
                  checked={propertyType.includes("Apartment")}
                  onChange={() => handlePropertyType("Apartment")}
                />
                Apartment
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={propertyType.includes("Villa")}
                  onChange={() => handlePropertyType("Villa")}
                />
                Villa
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={propertyType.includes("PG")}
                  onChange={() => handlePropertyType("PG")}
                />
                PG
              </label>
            </div>
          </div>

          <div className="mb-4">
            <p className="label-caps mb-2">Price Range</p>

            <input
              type="range"
              min="10000"
              max="500000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full"
            />

            <p>₹ {maxPrice}</p>

            <div className="flex justify-between text-body-sm mt-1">
              <span>₹10k</span>
              <span>₹5L</span>
            </div>
          </div>

          <div className="mb-4 mt-5">
            <p className="label-caps mb-2">BHK Type</p>

            <div className="flex gap-2 flex-wrap text-body-sm">
              <div className="flex justify-center gap-2">
                {bhkList.map((i) => (
                  <button
                    key={i}
                    onClick={() => setBhkType(i)}
                    className={`bhk w-10 ${
                      bhkType === i ? "btn-primary" : "btn-tertiary"
                    }`}>
                    {`${i}BHK`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="label-caps mb-2">Amenities</p>

            <div className="flex flex-col gap-2 text-body-sm">
              <label>
                <input
                  type="checkbox"
                  onChange={() => handleAmenities("Swimming Pool")}
                />
                Swimming Pool
              </label>

              <label>
                <input
                  type="checkbox"
                  onChange={() => handleAmenities("Car Parking")}
                />
                Car Parking
              </label>

              <label>
                <input
                  type="checkbox"
                  onChange={() => handleAmenities("Garden")}
                />
                Garden
              </label>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2>
                {filteredProperties.length} Properties for{" "}
                {searchLocal === "" ? "All India" : searchLocal}
              </h2>

              <p className="text-body-sm text-on-surface-variant">
                READY TO MOVE • PREMIUM • NEWLY LISTED
              </p>
            </div>

            <div className="flex items-center border px-3 py-2 rounded-md">
              <Search size={16} />

              <input
                placeholder="Search locality..."
                className="ml-2 outline-none"
                value={searchLocal}
                onChange={(e) => setSearchLocal(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <select
              className="input w-50"
              onChange={(e) => setSortOption(e.target.value)}>
              <option>Newest First</option>
              <option>Price Low to High</option>
              <option>Price High to Low</option>
            </select>
          </div>

          {filteredProperties.length > 0 ? (
            <Card properties={currentProperties} />
          ) : (
            <p className="text-on-surface-variant">No properties found</p>
          )}

          <div className="flex justify-center mt-10 gap-2 flex-wrap">
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;

              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-md ${
                      currentPage === page
                        ? "btn btn-primary"
                        : "btn btn-tertiary"
                    }`}>
                    {page}
                  </button>
                );
              }

              if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-2 self-center">
                    ...
                  </span>
                );
              }

              return null;
            })}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Properties;
