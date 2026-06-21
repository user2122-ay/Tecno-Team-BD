const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
};

// POST /api/auth/google  { credential }  <- token que entrega el botón de Google
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: "Falta el token de Google" });

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      const isFirstAdmin = payload.email === process.env.ADMIN_EMAIL;
      user = await User.create({
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        role: isFirstAdmin ? "admin" : "pendiente",
      });
    } else {
      // mantiene la foto/nombre actualizados
      user.name = payload.name;
      user.picture = payload.picture;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, cookieOptions);

    res.json({ user: sanitize(user) });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "No se pudo verificar la cuenta de Google" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: sanitize(req.user) });
});

function sanitize(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    role: user.role,
    subdivision: user.subdivision,
  };
}

module.exports = router;
