const express = require("express");
const Subdivision = require("../models/Subdivision");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// Cualquier usuario con rol asignado puede ver las subdivisiones
router.get("/", async (req, res) => {
  const subdivisions = await Subdivision.find().sort({ name: 1 });
  res.json(subdivisions);
});

// Solo admin y coordinador general pueden crear nuevas subdivisiones
router.post("/", requireRole("admin", "coordinador"), async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    const sub = await Subdivision.create({
      name,
      description,
      icon,
      color,
      createdBy: req.user._id,
    });
    res.status(201).json(sub);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "Ya existe una subdivisión con ese nombre" });
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", requireRole("admin", "coordinador"), async (req, res) => {
  const sub = await Subdivision.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!sub) return res.status(404).json({ error: "No encontrada" });
  res.json(sub);
});

router.delete("/:id", requireRole("admin"), async (req, res) => {
  await Subdivision.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
