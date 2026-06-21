const express = require("express");
const Attendance = require("../models/Attendance");
const { requireAuth, requireRole, scopeToOwnSubdivision } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireRole("admin", "coordinador", "coordinador_sub"));

// GET /api/attendance?subdivision=&date=
router.get("/", async (req, res) => {
  const filter = {};
  if (req.user.role === "coordinador_sub") {
    filter.subdivision = req.user.subdivision;
  } else if (req.query.subdivision) {
    filter.subdivision = req.query.subdivision;
  }
  if (req.query.date) filter.date = new Date(req.query.date);

  const records = await Attendance.find(filter)
    .populate("member", "name grade")
    .populate("subdivision", "name")
    .sort({ date: -1 });
  res.json(records);
});

// Registro masivo: marca asistencia de varios miembros para un mismo sábado
// body: { subdivision, date, records: [{ member, present, note }] }
router.post("/", scopeToOwnSubdivision, async (req, res) => {
  try {
    const { subdivision, date, records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: "No se enviaron registros" });
    }

    const ops = records.map((r) => ({
      updateOne: {
        filter: { member: r.member, date: new Date(date) },
        update: {
          $set: {
            member: r.member,
            subdivision,
            date: new Date(date),
            present: r.present,
            note: r.note || "",
            registeredBy: req.user._id,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);
    res.status(201).json({ ok: true, count: ops.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
