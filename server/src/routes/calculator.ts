// routes/calculator.ts
// ––– התבנית זהה ל-contact.ts: router.post + try/catch + res.json –––
import express from "express";
import {
  calculateStep1,
  calculateStep2,
  calculateStep3,
  calculateStep4,
} from "../calculators/realEstate.js";
import type {
  Step1Input,
  Step2Input,
  Step3Input,
  Step4Input,
} from "../types/calculator.js";

const router = express.Router();

// POST /api/calculator/step1
router.post("/calculator/step1", async (req, res) => {
  try {
    const input = req.body as Step1Input;
    if (
      typeof input.propertyValue !== "number" ||
      !input.propertyType ||
      !Array.isArray(input.expenses)
    ) {
      res.status(400).json({
        error:
          "שדות חובה חסרים: propertyValue (מספר), propertyType, expenses (מערך)",
      });
      return;
    }
    const result = calculateStep1(input);
    res.json(result);
  } catch (error) {
    console.error("calculator/step1 error:", error);
    res.status(500).json({ error: "שגיאת שרת בחישוב שלב 1" });
  }
});

// POST /api/calculator/step2
router.post("/calculator/step2", async (req, res) => {
  try {
    const input = req.body as Step2Input;
    if (
      typeof input.propertyValue !== "number" ||
      typeof input.mortgageAmount !== "number" ||
      typeof input.interestRate !== "number" ||
      typeof input.loanTermYears !== "number"
    ) {
      res.status(400).json({
        error:
          "שדות חובה חסרים: propertyValue, mortgageAmount, interestRate, loanTermYears",
      });
      return;
    }
    const result = calculateStep2(input);
    res.json(result);
  } catch (error) {
    console.error("calculator/step2 error:", error);
    res.status(500).json({ error: "שגיאת שרת בחישוב שלב 2" });
  }
});

// POST /api/calculator/step3
router.post("/calculator/step3", async (req, res) => {
  try {
    const input = req.body as Step3Input;
    if (
      typeof input.totalCost !== "number" ||
      typeof input.monthlyRent !== "number" ||
      typeof input.occupancyRate !== "number" ||
      !Array.isArray(input.expenses)
    ) {
      res.status(400).json({
        error:
          "שדות חובה חסרים: totalCost, monthlyRent, occupancyRate, expenses",
      });
      return;
    }
    const result = calculateStep3(input);
    res.json(result);
  } catch (error) {
    console.error("calculator/step3 error:", error);
    res.status(500).json({ error: "שגיאת שרת בחישוב שלב 3" });
  }
});

// POST /api/calculator/step4
router.post("/calculator/step4", async (req, res) => {
  try {
    const input = req.body as Step4Input;
    if (
      typeof input.totalCost !== "number" ||
      typeof input.futureSalePrice !== "number" ||
      typeof input.holdingYears !== "number" ||
      !Array.isArray(input.saleExpenses)
    ) {
      res.status(400).json({
        error:
          "שדות חובה חסרים: totalCost, futureSalePrice, holdingYears, saleExpenses",
      });
      return;
    }
    const result = calculateStep4(input);
    res.json(result);
  } catch (error) {
    console.error("calculator/step4 error:", error);
    res.status(500).json({ error: "שגיאת שרת בחישוב שלב 4" });
  }
});

export default router;
