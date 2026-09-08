import images from "./images";
const trendingutems=[
{
    id: 1,
    title: "The Heritage Villa",
    price: 120000,
    location: "Vijay Nagar, Indore",
    image: images.villa_in_indore,
    feats: ["3 BHK", "2 Bath", "1800 sq.ft"],
    available: true,
    isLiked: false,

    description: "A luxurious heritage villa with elegant interiors and peaceful surroundings.",
    amenities: ["Parking", "Garden", "Security", "Power Backup"],
    owner: "Rohit Sharma",
    memberSince: "Jan 2020",
    serviceFee: 5000,
    securityDeposit: 240000
  },
  {
    id: 15,
    title: "Andheri Hub Flat",
    price: 50000,
    location: "Andheri East, Mumbai",
    image: images.mumbai_5,
    feats: ["1 BHK", "1 Bath", "650 sq.ft"],
    available: true,
    isLiked: false,
    description: "Conveniently located near the metro and airport.",
    amenities: ["Parking", "Power Backup", "CCTV"],
    owner: "Manish Pandey",
    memberSince: "Oct 2022",
    serviceFee: 2500,
    securityDeposit: 100000
  },
   {
    id: 23,
    title: "Gulmohar Greens",
    price: 18000,
    location: "Gulmohar, Bhopal",
    image: images.bhopal_3,
    feats: ["2 BHK", "2 Bath", "1200 sq.ft"],
    available: true,
    isLiked: false,
    description: "Affordable family home in a quiet neighborhood.",
    amenities: ["Security", "CCTV", "Park"],
    owner: "Ravi Shankar",
    memberSince: "Oct 2020",
    serviceFee: 1000,
    securityDeposit: 35000
  }

];


export default trendingutems;