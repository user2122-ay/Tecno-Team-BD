const express = require("express");
const Activity = require("../models/Activity");
const { requireAuth, requireRole, scopeToOwnSubdivision } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireRole("admin", "coordinador", "coordinador_sub"));

router.get("/", async (req, res) => {
  const filter = {};
  if (req.user.role === "coordinador_sub") {
    filter.subdivision = req.user.subdivision;
  } else if (req.query.subdivision) {
    filter.subdivision = req.query.subdivision;
  }
  const activities = await Activity.find(filter)
    .populate("subdivision", "name color")
    .populate("participants", "name")
    .sort({ date: -1 });
  res.json(activities);
});

router.post("/", scopeToOwnSubdivision, async (req, res) => {
  try {
    const { subdivision, title, description, date, mediaUrls, participants } = req.body;
    const activity = await Activity.create({
      subdivision,
      title,
      description,
      date,
      mediaUrls,
      participants,
      registeredBy: req.user._id,
    });
    res.status(201).json(activity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const activity = await Activity.findById(req.params.id);
  if (!activity) return res.status(404).json({ error: "No encontrada" });
  if (req.user.role === "coordinador_sub" && String(activity.subdivision) !== String(req.user.subdivision)) {
    return res.status(403).json({ error: "Solo puedes eliminar actividades de tu subdivisión" });
  }
  await activity.deleteOne();
  res.json({ ok: true });
});

module.exports = router;
