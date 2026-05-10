import admin from "firebase-admin";
import path from "path";
import { readFileSync } from "fs";

const serviceAccountPath = path.resolve(process.cwd(), "src/config/firebase-service-account.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;