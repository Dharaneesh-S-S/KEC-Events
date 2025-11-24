// server/routes/eventRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getClubEvents,
  getUpcomingEvents,
  incrementEventViews,
  updateParticipantsCount,
  getEventParticipants
} from "../controllers/eventController.js";

const router = express.Router();

router
  .route("/")
  .post(protect, upload.array("posters"), createEvent)
  .get(getEvents);

router.route("/upcoming").get(getUpcomingEvents);
router.route("/club/:clubId").get(getClubEvents);

router
  .route("/:id")
  .get(getEventById)
  .put(protect, upload.array("posters"), updateEvent)
  .delete(protect, deleteEvent);

router.patch("/:id/views", incrementEventViews);
router.patch("/:id/participants", updateParticipantsCount);
router.get("/:id/participants", getEventParticipants);

export default router;
