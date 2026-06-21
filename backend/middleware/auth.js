const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifica el JWT guardado en cookie httpOnly y carga el usuario en req.user
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No autenticado" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.active) {
      return res.status(401).json({ error: "Sesión inválida" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Sesión inválida o expirada" });
  }
}

// Restringe una ruta a ciertos roles
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "No tienes permiso para esta acción" });
    }
    next();
  };
}

// Para coordinador_sub: solo puede operar dentro de su propia subdivisión.
// admin y coordinador (profesores generales) pueden operar en cualquiera.
function scopeToOwnSubdivision(req, res, next) {
  const { role, subdivision } = req.user;

  if (role === "admin" || role === "coordinador") return next();

  if (role === "coordinador_sub") {
    const targetSubdivision = req.body.subdivision || req.query.subdivision || req.params.subdivisionId;
    if (!subdivision || (targetSubdivision && String(subdivision) !== String(targetSubdivision))) {
      return res.status(403).json({ error: "Solo puedes gestionar tu propia subdivisión" });
    }
    // Si no se especificó subdivisión en la query/body, se la fijamos automáticamente
    if (!req.body.subdivision && req.method !== "GET") req.body.subdivision = subdivision;
    return next();
  }

  return res.status(403).json({ error: "No tienes permiso para esta acción" });
}

module.exports = { requireAuth, requireRole, scopeToOwnSubdivision };
