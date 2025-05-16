const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId; // ✅ Store userId as a string, not an object
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    res.status(401).json({ msg: "Invalid token" });
  }
};
