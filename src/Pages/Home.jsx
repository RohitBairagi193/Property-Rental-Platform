import React from "react";
import Featured from "../Components/Featured";
import SearchBar from "../Components/SearchBar";
import StatusBar from "../Components/StatusBar";
import images from "../assets/images";
import Footer from "../Components/Footer";
import PageLoader from "../Components/PageLoader";
import usePageLoader from "../assets/usePageLoader";
import AboutUs from "../Components/AboutUs";

const Home = () => {
  const loading = usePageLoader();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <main className="w-full">
      <section className="relative section">
        <img
          src={images.luxury_indian_home}
          alt="Luxury Indian Home"
          className="overflow-hidden absolute inset-0 w-full h-217.5 object-cover"
        />
        <div className="overflow-hidden absolute inset-0 bg-primary-container/50 backdrop-blur-[1px]" />
        <SearchBar />
      </section>

      <section className="bg-primary h-50 relative w-full py-8 align-middle justify-center flex">
        <StatusBar />
      </section>

      <section className="bg-white">
        <Featured />
      </section>

      <section className="bg-surface py-14">
      <AboutUs />
      </section>
      <Footer />
    </main>
  );
};

export default Home;
