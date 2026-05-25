const jwt = require('jsonwebtoken');

// Decodes token and verifies authentic identity context
exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied. Missing Token.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token structure.' });
  }
};

// Enforces structural Role-Based Access Controls (RBAC) across specific dashboards
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access Forbidden. Unauthorized role clearance.' });
    }
    next();
  }
};