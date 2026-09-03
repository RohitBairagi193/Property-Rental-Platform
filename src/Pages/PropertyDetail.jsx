import {
  AirVent,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowUpDown,
  Bath,
  Bed,
  Building2,
  Car,
  Contact,
  Contact2,
  Dumbbell,
  IndianRupee,
  Map,
  MapPin,
  Maximize,
  Maximize2,
  Maximize2Icon,
  MaximizeIcon,
  User,
  UserRound,
  Wifi,
} from "lucide-react";
import images from "../assets/images";
import Footer from "../Components/Footer";
import { useContext } from "react";
import { DetailedProperty } from "../Context/DetailedProperty";
import CardItems from "../Components/CardItems";
import { useLocation, useNavigate } from "react-router-dom";
import properties from "../assets/property";
import DetailedCard from "../Components/DetailedCard";
import PageLoader from "../Components/PageLoader";
import usePageLoader from "../assets/usePageLoader";

const PropertyDetail = () => {
  const loading = usePageLoader();

  const location = useLocation();
  const prop = location.state;

  if (loading) {
    return <PageLoader />;
  }
  if (!prop) {
    return (
      <div className="container-main px-gutter pt-40 text-center">
        {" "}
        <a
          href="/"
          className="text-md font-bold mb-4 ml-10 cursor-pointer align-middle gap-1">
          <ArrowBigLeft className="inline" size={18} /> Back to Home
        </a>
        <a
          href="/properties"
          className="text-md font-bold mb-4 ml-290 cursor-pointer align-middle gap-1">
          Back to listings
          <ArrowBigRight className="inline" size={18} />
        </a>
        <p className="text-2xl font-bold">Property not found</p>
      </div>
    );
  }
  return (
    <>
      <DetailedCard item={prop} />
    </>
  );
};

export default PropertyDetail;
