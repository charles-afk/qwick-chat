import jwt from "jsonwebtoken";
import { app } from "../lib/socket.js";

export const protectRoute = async (req, res, next) => {
  if (!req.session) return res.status(403).json({ message: "Session Expired"});

  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token available' });

  const decoded = jwt.decode(token);
  const now = Math.floor(Date.now() / 1000);
  if (decoded?.exp && decoded?.exp < now) {
    try {
      jwt.verify(req.session.refreshToken, app.locals.secrets.JWT_REFRESH_TOKEN_SECRET);
      token = jwt.sign(
        { _id: req.session.userID }, 
        app.locals.secrets.JWT_ACCESS_TOKEN_SECRET, 
        { expiresIn: app.locals.secrets.JWT_ACCESS_TOKEN_EXPIRE }
      );
      req.fullName = req.session.fullName;
      req.accessToken = token;
      next()
    } catch (error) {
      console.error(error.message);
      return res.status(403).json({ message: 'Token Expired' });
    }
  } else {
    req.fullName = req.session.fullName;
    req.accessToken = token;
    next();
  }
};