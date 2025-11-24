// server/models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    date: Date,
    time: String,
    tags: [String],
    venue: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },
    formLink: String,
    formSheetId: String,
    formEmbedCode: String,
    eventType: { type: String, enum: ["super", "sub", "single"], default: "single" },
    parentEvent: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Event', 
      default: null 
    },
    posters: [
      {
        url: String,
        public_id: String
      }
    ],
    views: { type: Number, default: 0 },
    participantsCount: { type: Number, default: 0 },
    teamSize: String,       
    deadline: Date             
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
