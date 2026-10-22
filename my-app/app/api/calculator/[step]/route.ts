import { NextRequest, NextResponse } from "next/server";
import {
  calculateStep1,
  calculateStep2,
  calculateStep3,
  calculateStep4,
} from "@/lib/calculators/realEstate";
import type {
  Step1Input,
  Step2Input,
  Step3Input,
  Step4Input,
} from "@/components/calculator/types";

// POST /api/calculator/step1 | step2 | step3 | step4
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ step: string }> }
) {
  // context.params הוא Promise בגרסה הזו (שינוי מ-v15)
  const { step } = await params;

  try {
    const body = await req.json();

    switch (step) {
      case "step1": {
        const input = body as Step1Input;
        if (
          typeof input.propertyValue !== "number" ||
          !input.propertyType ||
          !Array.isArray(input.expenses)
        ) {
          return NextResponse.json(
            { error: "שדות חובה חסרים: propertyValue (מספר), propertyType, expenses (מערך)" },
            { status: 400 }
          );
        }
        return NextResponse.json(calculateStep1(input));
      }

      case "step2": {
        const input = body as Step2Input;
        const validMethods = ["spitzer", "full_balloon", "partial_balloon"];
        if (
          typeof input.propertyValue !== "number" ||
          typeof input.totalCost !== "number" ||
          typeof input.mortgageAmount !== "number" ||
          typeof input.interestRate !== "number" ||
          typeof input.loanTermYears !== "number" ||
          !validMethods.includes(input.repaymentMethod)
        ) {
          return NextResponse.json(
            { error: "שדות חובה חסרים: propertyValue, totalCost, mortgageAmount, interestRate, loanTermYears, repaymentMethod" },
            { status: 400 }
          );
        }
        return NextResponse.json(calculateStep2(input));
      }

      case "step3": {
        const input = body as Step3Input;
        if (
          typeof input.totalCost !== "number" ||
          typeof input.monthlyRent !== "number" ||
          typeof input.occupancyRate !== "number" ||
          !Array.isArray(input.expenses)
        ) {
          return NextResponse.json(
            { error: "שדות חובה חסרים: totalCost, monthlyRent, occupancyRate, expenses" },
            { status: 400 }
          );
        }
        return NextResponse.json(calculateStep3(input));
      }

      case "step4": {
        const input = body as Step4Input;
        if (
          typeof input.totalCost !== "number" ||
          typeof input.futureSalePrice !== "number" ||
          typeof input.holdingYears !== "number" ||
          !Array.isArray(input.saleExpenses)
        ) {
          return NextResponse.json(
            { error: "שדות חובה חסרים: totalCost, futureSalePrice, holdingYears, saleExpenses" },
            { status: 400 }
          );
        }
        return NextResponse.json(calculateStep4(input));
      }

      default:
        return NextResponse.json({ error: `שלב לא מוכר: ${step}` }, { status: 404 });
    }
  } catch (error) {
    console.error(`calculator/${step} error:`, error);
    return NextResponse.json({ error: `שגיאת שרת בחישוב ${step}` }, { status: 500 });
  }
}
