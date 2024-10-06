import express from "express";
import { config } from "dotenv";

import { connectToDatabase, disconnectFromDatabase } from "./db/connection.js";
import authRoutes from "./routes/auth.routes.js";

config(); // This loads environment variables from a .env

const PORT = 3000; // Server PORT
const app = express();
app.use(express.json()); //parses incoming requests with JSON payloads and makes them available via req.body

connectToDatabase()
  .then(() => {
    const server = app.listen(PORT, () =>
      console.log(
        `Server running on port ${PORT} and connected to the database`
      )
    );

    // Error handling for server listen
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Trying to restart...`);

        // Optional: Terminate the process to restart it cleanly (useful for dev environments)
        process.exit(1);
      } else {
        console.error("Server error:", err);
        disconnectFromDatabase().then(() => {
          console.log("Something went wrong... disconnected from the database");
        });
      }
    });
  })
  .catch((err) => console.error("Database connection error:", err));

app.use("/api/auth", authRoutes);