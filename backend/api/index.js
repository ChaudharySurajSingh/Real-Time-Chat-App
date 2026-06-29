import { app } from "../server.js";
import connectDB from "../config/db.js";

let dbConnectionPromise;

const ensureDatabase = () => {
  if (!dbConnectionPromise) {
    dbConnectionPromise = connectDB();
  }

  return dbConnectionPromise;
};

export default async function handler(req, res) {
  await ensureDatabase();
  return app(req, res);
}
