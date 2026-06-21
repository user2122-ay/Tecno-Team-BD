const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    subdivision: { type: mongoose.Schema.Types.ObjectId, ref: "Subdivision", required: true },
    date: { type: Date, required: true }, // el sábado que se está registrando
    present: { type: Boolean, required: true },
    note: { type: String, default: "" },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Evita duplicar asistencia del mismo miembro el mismo día
attendanceSchema.index({ member: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
