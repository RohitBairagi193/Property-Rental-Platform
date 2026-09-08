import {
  Car, Dumbbell, Wifi, ShieldCheck, Zap, Building2,
  Waves, Leaf, Cctv, Phone, Utensils, Wind,
  Sun, TreePine, Lock, Home, Star,Trees
} from 'lucide-react';

const amenityIcons = {
  
  "Parking":          <Car size={14} />,
  "Valet Parking":    <Car size={14} />,
  "Garage":           <Car size={14} />,

  "Gym":              <Dumbbell size={14} />,
  "Swimming Pool":    <Waves size={14} />,
  "Pool":             <Waves size={14} />,
  "Infinity Pool":    <Waves size={14} />,
  "Private Pool":     <Waves size={14} />,
  "Badminton Court":  <Dumbbell size={14} />,
  "Tennis Court":     <Dumbbell size={14} />,
  "Jogging Track":    <Dumbbell size={14} />,

  "WiFi":             <Wifi size={14} />,
  "AC":               <Wind size={14} />,
  "Air Conditioning": <Wind size={14} />,
  "Power Backup":     <Zap size={14} />,
  "Inverter":         <Zap size={14} />,
  "Solar Heater":     <Sun size={14} />,

  "Security":         <ShieldCheck size={14} />,
  "High Security":    <ShieldCheck size={14} />,
  "CCTV":             <ShieldCheck size={14} />,
  "Intercom":         <Phone size={14} />,

  "Garden":           <Leaf size={14} />,
  "Lawn":             <Leaf size={14} />,
  "Balcony":          <Home size={14} />,
  "Terrace":          <Home size={14} />,
  "Park":               <Trees size={14}/>,


  "Lift":             <Building2 size={14} />,
  "Elevator":         <Building2 size={14} />,
  "Clubhouse":        <Building2 size={14} />,


  "Meals":            <Utensils size={14} />,
  "Modular Kitchen":  <Utensils size={14} />,

  "Lake View":        <TreePine size={14} />,
  "Sea View":         <TreePine size={14} />,
};

const DefaultIcon = () => <Star size={14} />;

export default amenityIcons;