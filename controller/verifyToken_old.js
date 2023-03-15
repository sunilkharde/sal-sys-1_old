import { verify } from "jsonwebtoken";

// Middleware for verifying JSON Web Tokens set in cookies
const verifyToken = (req, res, next) => {
  const token = req.cookies.jwtToken;
    if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
    
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

export default verifyToken;