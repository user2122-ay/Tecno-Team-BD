const express = require("express");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireRole("admin"));

router.get("/", async (req, res) => {
  const users = await User.find().populate("subdivision", "name").sort({ createdAt: -1 });
  res.json(users);
});

// Asignar rol y, si aplica, subdivisión
router.put("/:id/role", async (req, res) => {
  try {
    const { role, subdivision } = req.body;
    const validRoles = ["admin", "coordinador", "coordinador_sub", "miembro", "pendiente"];
    if (!validRoles.includes(role)) return res.status(400).json({ error: "Rol inválido" });
    if (role === "coordinador_sub" && !subdivision) {
      return res.status(400).json({ error: "Debes asignar una subdivisión a este rol" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, subdivision: role === "coordinador_sub" ? subdivision : null },
      { new: true }
    ).populate("subdivision", "name");

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id/active", async (req, res) => {
  const { active } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { active }, { new: true });
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(user);
});

module.exports = router;
