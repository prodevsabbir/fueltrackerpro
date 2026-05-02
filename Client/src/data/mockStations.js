/**
 * MOCK_STATIONS 
 * Real-world fuel station names from Dhaka/Bangladesh area.
 */
export const MOCK_STATIONS = [
  {
    _id: "st_001",
    name: "Meghna Model Service Station",
    location: {
      address: "Bijoy Sarani",
      subArea: "Tejgaon",
      area: "Dhaka North",
      city: "Dhaka",
      coordinates: { lat: 23.7600, lng: 90.3900 }
    },
    status: "available",
    fuels: [
      { type: "octane", price: 130.00, status: "available" },
      { type: "petrol", price: 125.00, status: "available" },
      { type: "diesel", price: 110.00, status: "limited" },
      { type: "cng", price: 45.00, status: "available" }
    ],
    facilities: ["water", "washroom", "cafe"],
    rating: 4.8,
    reviewsCount: 124,
    verified: true,
    lastUpdated: new Date().toISOString(),
    primaryCategory: "octane"
  },
  {
    _id: "st_002",
    name: "Trust Filling Station",
    location: {
      address: "Sector 7",
      subArea: "Uttara",
      area: "Dhaka North",
      city: "Dhaka",
      coordinates: { lat: 23.8644, lng: 90.3995 }
    },
    status: "available",
    fuels: [
      { type: "octane", price: 130.00, status: "available" },
      { type: "petrol", price: 125.00, status: "available" },
      { type: "diesel", price: 110.00, status: "available" }
    ],
    facilities: ["water", "washroom"],
    rating: 4.9,
    reviewsCount: 210,
    verified: true,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    primaryCategory: "octane"
  },
  {
    _id: "st_003",
    name: "Karnafuli Filling Station",
    location: {
      address: "Kajipara",
      subArea: "Mirpur",
      area: "Dhaka North",
      city: "Dhaka",
      coordinates: { lat: 23.8197, lng: 90.4226 }
    },
    status: "limited",
    fuels: [
      { type: "octane", price: 130.00, status: "out" },
      { type: "petrol", price: 125.00, status: "available" },
      { type: "diesel", price: 110.00, status: "limited" }
    ],
    facilities: ["water", "washroom"],
    rating: 4.5,
    reviewsCount: 89,
    verified: true,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    primaryCategory: "petrol"
  },
  {
    _id: "st_004",
    name: "SA Filling Station",
    location: {
      address: "Shyamoli Square",
      subArea: "Shyamoli",
      area: "Dhaka North",
      city: "Dhaka",
      coordinates: { lat: 23.7719, lng: 90.3631 }
    },
    status: "out",
    fuels: [
      { type: "octane", price: 130.00, status: "out" },
      { type: "petrol", price: 125.00, status: "out" },
      { type: "diesel", price: 110.00, status: "out" }
    ],
    facilities: ["water"],
    rating: 4.2,
    reviewsCount: 56,
    verified: false,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    primaryCategory: "diesel"
  },
  {
    _id: "st_005",
    name: "Golden Fuel Station",
    location: {
      address: "Wireless Gate",
      subArea: "Mohakhali",
      area: "Dhaka North",
      city: "Dhaka",
      coordinates: { lat: 23.7776, lng: 90.4004 }
    },
    status: "available",
    fuels: [
      { type: "octane", price: 130.00, status: "available" },
      { type: "petrol", price: 125.00, status: "available" }
    ],
    facilities: ["water", "washroom"],
    rating: 4.7,
    reviewsCount: 145,
    verified: true,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    primaryCategory: "octane"
  }
];
