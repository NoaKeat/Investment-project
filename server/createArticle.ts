import { createClient } from 'next-sanity';
import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
});

async function run() {
    // נקבל מהטרמינל רק כותרת, תת כותרת ונתיב תמונה
    const [, , title, subtitle, imagePath] = process.argv;

    if (!title || !subtitle || !imagePath) {
        console.error('Usage: npx tsx createArticle.ts "כותרת" "תת כותרת" "נתיב-תמונה"');
        process.exit(1);
    }

    try {
        // קריאת התוכן מקובץ הטקסט שיצרנו
        const rawContent = fs.readFileSync('content.txt', 'utf8');
        const blocks = rawContent.split('\n\n').map(paragraph => ({
            _type: 'block',
            style: 'normal',
            children: [{ _type: 'span', text: paragraph }]
        }));

        console.log("Uploading image...");
        const imageBuffer = fs.readFileSync(path.resolve(process.cwd(), imagePath));
        const asset = await client.assets.upload('image', imageBuffer, { filename: path.basename(imagePath) });

        const doc = {
            _type: 'article',
            title,
            subtitle,
            slug: {
                _type: 'slug',
                // זה הפתרון הכי יציב. לעולם לא יהיו פה תווים אסורים.
                current: `article-${Date.now()}`
            },
            image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
            content: blocks
        };
        console.log("DEBUG: Sending document to Sanity:", JSON.stringify(doc, null, 2));
        const result = await client.create(doc);
        console.log('✅ המאמר עלה בהצלחה! ID:', result._id);
    } catch (err) {
        console.error('❌ שגיאה:', err);
    }
}

run();