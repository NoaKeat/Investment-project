const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'h5imnl50',
  dataset: 'production',
  token: 'skdEcztvtxmhkBolO7faopxX7GzoFah942IQNmpN5E4wXXboisFm4jbx0BkUtFME4ioRHzDbHVcPpuE4eDsTahnbTqicY57qJgGkNPntRJqfXsmGqemMEKEPWinTH0frQxZ8QweiMd6mRsiEAyVShq6kLRYSG1iH7o4kw9nyWPFQbyswRxbz',
  apiVersion: '2024-01-01',
  useCdn: false
})

async function createArticle() {
  const title = 'איך מקבלים החלטות השקעה נכונות'

  // 🔥 יצירת slug אוטומטי
  const slug = title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0590-\u05FF-]+/g, '') // תומך בעברית

  const doc = {
    _type: 'article',

    title,

    subtitle: `תחילת הדרך עבדתי בעבודות מזדמנות, ואז הגיע קרע ברצועה בכתף.
פציעה שעצרה אותי פיזית, אבל בעיקר הכריחה אותי לעצור ולבחור מחדש.`,

    // 🔥 זה מה שמפעיל את "להמשך קריאה"
    slug: {
      _type: 'slug',
      current: slug,
    },

    content: [
      {
        _type: 'block',
        _key: 'block1',
        children: [
          {
            _type: 'span',
            _key: 'span1',
            text: 'זה תוכן שנשלח דרך Node',
            marks: []
          }
        ]
      }
    ],

    updatedAt: new Date().toISOString()
  }

  const result = await client.create(doc)

  console.log('נוצר בהצלחה:', result)
}



createArticle()