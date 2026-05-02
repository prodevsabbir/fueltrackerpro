export interface ILocation {
  address: string;
  subArea: string;
  area: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface IFuel {
  type: string;
  price: number;
  status: string;
}

export interface IStation {
  _id: string;
  name: string;
  image?: {
    public_id: string;
    secure_url: string;
  };
  location: ILocation;
  status: string;
  fuels: IFuel[];
  facilities: string[];
  rating: number;
  reviewsCount: number;
  verified: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejected?: boolean;
  createdBy: any;
  creatorRole: string;
  lastUpdated: Date;
  primaryCategory: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateStation extends Omit<IStation, "_id" | "isDeleted" | "createdAt" | "updatedAt"> {}
