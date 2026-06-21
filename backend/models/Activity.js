const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    subdivision: { type: mongoose.Schema.Types.ObjectId, ref: "Subdivision", required: true },
    title: { type: String, required: true, trim: true }, // ej: "Acto cívico lunes"
    description: { type: String, default: "" },
    date: { type: Date, required: true },
    // URLs de evidencia (fotos/videos subidos a Drive, Imgur, etc. — se guarda el link)
    mediaUrls: [{ type: String }],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Member" }],
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
