const jwt = require("jsonwebtoken");
const generateJWTToken = (payload, options) =>
  jwt.sign(payload, process.env.JWT_SECRET, options);

module.exports = { generateJWTToken };
