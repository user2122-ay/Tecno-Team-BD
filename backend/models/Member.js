const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    grade: { type: String, default: "" }, // ej: "9no A"
    subdivision: { type: mongoose.Schema.Types.ObjectId, ref: "Subdivision", required: true },
    contact: { type: String, default: "" }, // teléfono o correo, opcional
    active: { type: Boolean, default: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
