import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import contactRoute from "./src/routes/contact.js";

// טעינת משתני סביבה
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", contactRoute);

// בדיקה שהשרת רץ
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// הרצת השרת
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});