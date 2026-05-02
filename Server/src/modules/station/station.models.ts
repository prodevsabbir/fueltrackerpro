import mongoose, { Schema } from "mongoose";
import { IStation } from "./station.interface";

const fuelSchema = new Schema({
  type: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: "available" }
}, { _id: false });

const locationSchema = new Schema({
  address: { type: String, required: true },
  subArea: { type: String, required: true },
  area: { type: String, required: true },
  city: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  geo: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: false } // [lng, lat]
  }
}, { _id: false });

locationSchema.index({ "geo.coordinates": '2dsphere' }, { sparse: true });

const stationSchema = new Schema<IStation>({
  name: { type: String, required: true },
  image: {
    public_id: { type: String },
    secure_url: { type: String }
  },
  location: { type: locationSchema, required: true },
  status: { type: String, default: "available" },
  fuels: { type: [fuelSchema], default: [] },
  facilities: { type: [String], default: [] },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  lastUpdated: { type: Date, default: Date.now },
  primaryCategory: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  creatorRole: { type: String },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export const StationModel = mongoose.model<IStation>("Station", stationSchema);
