const express = require("express");
const Member = require("../models/Member");
const { requireAuth, requireRole, scopeToOwnSubdivision } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireRole("admin", "coordinador", "coordinador_sub"));

// Lista miembros (filtrado por subdivisión si se pasa ?subdivision=)
router.get("/", async (req, res) => {
  const filter = {};
  if (req.user.role === "coordinador_sub") {
    filter.subdivision = req.user.subdivision;
  } else if (req.query.subdivision) {
    filter.subdivision = req.query.subdivision;
  }
  const members = await Member.find(filter).populate("subdivision", "name color").sort({ name: 1 });
  res.json(members);
});

router.post("/", scopeToOwnSubdivision, async (req, res) => {
  try {
    const { name, grade, subdivision, contact } = req.body;
    const member = await Member.create({
      name,
      grade,
      subdivision,
      contact,
      addedBy: req.user._id,
    });
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", scopeToOwnSubdivision, async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) return res.status(404).json({ error: "No encontrado" });
  if (req.user.role === "coordinador_sub" && String(member.subdivision) !== String(req.user.subdivision)) {
    return res.status(403).json({ error: "Solo puedes editar miembros de tu subdivisión" });
  }
  Object.assign(member, req.body);
  await member.save();
  res.json(member);
});

router.delete("/:id", async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) return res.status(404).json({ error: "No encontrado" });
  if (req.user.role === "coordinador_sub" && String(member.subdivision) !== String(req.user.subdivision)) {
    return res.status(403).json({ error: "Solo puedes eliminar miembros de tu subdivisión" });
  }
  await member.deleteOne();
  res.json({ ok: true });
});

module.exports = router;
