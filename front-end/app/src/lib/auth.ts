import jwt from "jsonwebtoken";

const SECRET = process.env.SECRET_KEY;

export function getSession(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET);
    return decoded as any;
  } catch (err) {
    console.log("JWT ERROR:", err); // 👈 THIS WILL SHOW REAL ISSUE
    return null;
  }
}