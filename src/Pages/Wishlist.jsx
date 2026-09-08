import React, { useContext } from "react";
import CardItems from "../Components/CardItems";
import { MyContext } from "../Context/MyContextProvder";
import { ArrowBigRight } from "lucide-react";
import Footer from "../Components/Footer";
import PageLoader from "../Components/PageLoader";
import usePageLoader from "../assets/usePageLoader";

const Wishlist = () => {
  const loading = usePageLoader();
  const { wishlist } = useContext(MyContext);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <div className="container-main bg-white pt-20 max-w-container-max mx-auto px-20">
        <div>
          <a
            href="/"
            className="text-md font-bold mb-4  mr-1 cursor-pointer align-middle gap-1">
            Back to Home
          </a>
          <a
            href="/wishlist"
            className="text-md font-bold mb-4  cursor-pointer align-middle gap-1">
            <ArrowBigRight className="inline mr-1" size={18} />
            Wishlist
          </a>
        </div>

        <div className="flex items-end justify-between pt-5 mb-8">
          <div className="px-6">
            <h1 className="text-on-surface">My Wishlist</h1>
            <p className="text-on-surface-variant text-body-sm mt-1">
              Your saved properties for future reference
            </p>
          </div>
        </div>
        <CardItems wishlist={wishlist} />
      </div>
      <Footer />
    </>
  );
};

export default Wishlist;
