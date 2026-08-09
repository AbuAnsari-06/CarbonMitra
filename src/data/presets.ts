import { PresetRegion } from "../types";

export interface StateDistrictOption {
  state: string;
  districts: string[];
}

export const INDIAN_STATES_DISTRICTS: StateDistrictOption[] = [
  {
    state: "Tamil Nadu",
    districts: ["Thanjavur", "Tiruvarur", "Nagapattinam", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Erode", "Tirunelveli"]
  },
  {
    state: "Punjab",
    districts: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Sangrur", "Firozpur", "Gurdaspur"]
  },
  {
    state: "Maharashtra",
    districts: ["Yavatmal", "Nagpur", "Nashik", "Pune", "Chhatrapati Sambhajinagar", "Ahmednagar", "Satara", "Kolhapur"]
  },
  {
    state: "Karnataka",
    districts: ["Kodagu (Coorg)", "Chikkamagaluru", "Hassan", "Belagavi", "Mandya", "Mysuru", "Dharwad", "Shimoga"]
  },
  {
    state: "Madhya Pradesh",
    districts: ["Ujjain", "Indore", "Bhopal", "Dewas", "Dhar", "Jabalpur", "Hoshangabad", "Chhindwara"]
  },
  {
    state: "Uttar Pradesh",
    districts: ["Gorakhpur", "Varanasi", "Lucknow", "Bareilly", "Meerut", "Agra", "Aligarh", "Ayodhya"]
  },
  {
    state: "Gujarat",
    districts: ["Anand", "Rajkot", "Junagadh", "Vadodara", "Surat", "Mehsana", "Amreli", "Kheda"]
  },
  {
    state: "Andhra Pradesh",
    districts: ["Guntur", "Krishna", "West Godavari", "East Godavari", "Kurnool", "Anantapur", "Prakasam"]
  },
  {
    state: "Haryana",
    districts: ["Karnal", "Kurukshetra", "Hisar", "Ambala", "Sirsa", "Sonipat", "Panipat"]
  },
  {
    state: "Telangana",
    districts: ["Nalgonda", "Nizamabad", "Karimnagar", "Warangal", "Khammam", "Rangareddy"]
  },
  {
    state: "Kerala",
    districts: ["Wayanad", "Palakkad", "Idukki", "Thrissur", "Kottayam", "Alappuzha"]
  },
  {
    state: "West Bengal",
    districts: ["Burdwan", "Hooghly", "Nadia", "Murshidabad", "North 24 Parganas", "Birbhum"]
  }
];

export const PRESET_REGIONS: PresetRegion[] = [
  {
    id: "tn-rice",
    name: "Kaveri Delta Organic Paddy Field",
    district: "Thanjavur",
    state: "Tamil Nadu",
    crop: "Paddy Rice & Black Gram",
    center: [10.7870, 79.1378],
    samplePolygon: [
      [10.7890, 79.1350],
      [10.7910, 79.1400],
      [10.7850, 79.1420],
      [10.7840, 79.1360]
    ],
    defaultNdvi: 0.71
  },
  {
    id: "punjab-wheat",
    name: "Golden Wheat Boundary - Ludhiana",
    district: "Ludhiana",
    state: "Punjab",
    crop: "Wheat & Mustard",
    center: [30.9010, 75.8573],
    samplePolygon: [
      [30.9030, 75.8550],
      [30.9045, 75.8600],
      [30.9000, 75.8620],
      [30.8985, 75.8565]
    ],
    defaultNdvi: 0.74
  },
  {
    id: "maharashtra-cotton",
    name: "Vidarbha Agroforestry & Cotton Estate",
    district: "Yavatmal",
    state: "Maharashtra",
    crop: "Cotton & Pulses",
    center: [20.3888, 78.1204],
    samplePolygon: [
      [20.3910, 78.1180],
      [20.3925, 78.1230],
      [20.3870, 78.1250],
      [20.3860, 78.1195]
    ],
    defaultNdvi: 0.68
  },
  {
    id: "karnataka-coffee",
    name: "Coorg Agroforestry Coffee & Pepper Plot",
    district: "Kodagu (Coorg)",
    state: "Karnataka",
    crop: "Arabica Coffee & Black Pepper",
    center: [12.4244, 75.7382],
    samplePolygon: [
      [12.4270, 75.7360],
      [12.4285, 75.7410],
      [12.4220, 75.7430],
      [12.4210, 75.7375]
    ],
    defaultNdvi: 0.82
  },
  {
    id: "mp-soybean",
    name: "Malwa Plateau Soil Organic Farm",
    district: "Ujjain",
    state: "Madhya Pradesh",
    crop: "Soybean & Chickpea",
    center: [23.1765, 75.7885],
    samplePolygon: [
      [23.1790, 75.7860],
      [23.1805, 75.7910],
      [23.1740, 75.7930],
      [23.1730, 75.7875]
    ],
    defaultNdvi: 0.65
  },
  {
    id: "up-sugarcane",
    name: "Gangetic Plain Organic Sugarcane Plantation",
    district: "Gorakhpur",
    state: "Uttar Pradesh",
    crop: "Sugarcane & Lentils",
    center: [26.7606, 83.3732],
    samplePolygon: [
      [26.7625, 83.3710],
      [26.7640, 83.3760],
      [26.7580, 83.3780],
      [26.7570, 83.3720]
    ],
    defaultNdvi: 0.77
  },
  {
    id: "gujarat-groundnut",
    name: "Saurashtra Groundnut & Organic Farm",
    district: "Junagadh",
    state: "Gujarat",
    crop: "Groundnut & Sesame",
    center: [21.5222, 70.4579],
    samplePolygon: [
      [21.5240, 70.4550],
      [21.5255, 70.4600],
      [21.5200, 70.4620],
      [21.5190, 70.4560]
    ],
    defaultNdvi: 0.69
  }
];

import { CONTRACT_ADDRESS, POLYGON_SCAN_AMOY_BASE as CONTRACT_POLYGON_SCAN_BASE } from '../lib/contract';

export const DUMMY_CONTRACT_ADDRESS = CONTRACT_ADDRESS;
export const POLYGON_SCAN_AMOY_BASE = CONTRACT_POLYGON_SCAN_BASE;

