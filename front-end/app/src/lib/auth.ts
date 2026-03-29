import jwt from "jsonwebtoken";

const SECRET = "my-secret-key"; // ⚠️ MUST match login

export function getSession(token: string) {
  try {
    console.log("VERIFYING TOKEN...");

    const decoded = jwt.verify(token, SECRET);

    console.log("DECODED:", decoded); // 👈 IMPORTANT

    return decoded as any;
  } catch (err) {
    console.log("JWT ERROR:", err); // 👈 THIS WILL SHOW REAL ISSUE
    return null;
  }
}