import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createClient } from '@sanity/client/stega';

// 1. נגדיר את הנתיב המלא
const envPath = path.resolve(__dirname, '.env.local');

console.log("--- DEBUGGING ENV LOADING ---");
console.log("Directory where clean.ts is:", __dirname);
console.log("Looking for file at:", envPath);

// 2. נבדוק אם הקובץ פיזית קיים בנתיב הזה
if (fs.existsSync(envPath)) {
    console.log("✅ הקובץ נמצא! מנסה לטעון...");
    const result = dotenv.config({ path: envPath });
    if (result.error) {
        console.error("❌ dotenv נכשל בטעינה:", result.error);
    } else {
        console.log("✅ dotenv נטען בהצלחה!");
    }
} else {
    console.error("❌ שגיאה: הקובץ לא נמצא בנתיב הזה!");
    console.error("בדוק אם השם הוא באמת .env.local ולא .env.local.txt");
}
console.log("-----------------------------");

// עכשיו נמשיך עם שאר הקוד שלך...
// בדיקה אם המשתנים קיימים לפני היצירה
if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    console.error("❌ שגיאה: לא נמצא PROJECT_ID! ודא שקובץ .env.local נמצא בתיקיית server");
    process.exit(1);
}

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false, // חובה לסקריפטים של כתיבה/מחיקה
});

async function clean() {
    try {
        console.log("מתחבר ל-Sanity...");
        const articles = await client.fetch(`*[_type == "article"]`);
        
        if (articles.length === 0) {
            console.log("לא נמצאו מאמרים.");
            return;
        }

        console.log(`נמצאו ${articles.length} מאמרים. מוחק...`);
        for (const art of articles) {
            await client.delete(art._id);
            console.log(`נמחק: ${art._id}`);
        }
    } catch (err) {
        console.error("שגיאה בהרצה:", err);
    }
}

clean();