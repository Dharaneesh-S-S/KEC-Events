import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: String,
  role: String,
  email: [String],
  phone: [String],
  position: String,
});

const clubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true }, // Make sure this exists
    description: String,
    logoUrl: String,
    gallery: [String],
    contactInfo: [contactSchema],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Club", clubSchema);