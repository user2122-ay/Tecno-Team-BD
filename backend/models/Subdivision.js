const mongoose = require("mongoose");

const subdivisionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    // ícono de lucide-react para mostrar en el frontend (ej: "Camera", "Video", "PenTool")
    icon: { type: String, default: "Sparkles" },
    color: { type: String, default: "#C9A227" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subdivision", subdivisionSchema);
