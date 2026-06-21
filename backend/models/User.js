const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    picture: { type: String },

    // admin           -> Zona, controla todo y asigna roles
    // coordinador      -> profesor(es), ve y gestiona todas las subdivisiones
    // coordinador_sub  -> coordinador de una subdivisión específica
    // miembro          -> cuenta sin permisos de gestión (solo lectura, opcional)
    role: {
      type: String,
      enum: ["admin", "coordinador", "coordinador_sub", "miembro", "pendiente"],
      default: "pendiente",
    },

    // Solo aplica si role === "coordinador_sub"
    subdivision: { type: mongoose.Schema.Types.ObjectId, ref: "Subdivision", default: null },

    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
