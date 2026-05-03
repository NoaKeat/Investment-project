import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'article',
  title: 'מאמרים',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'כותרת',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),

    // 🔥 SLUG אוטומטי לגמרי
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      // hidden: true, // אפשר להשאיר את זה מוסתר אם אתה רוצה

      // 1. כאן אנחנו מוחקים את ה-initialValue עם ה-Date.now

      // 2. כאן אנחנו מוסיפים את האופציה שמושכת את הערך מהכותרת
      options: {
        source: 'title', // 🔥 זה הקסם: הוא לוקח את הכותרת והופך אותה ל-Slug
        maxLength: 96,
      },

      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'subtitle',
      title: 'כותרת משנה',
      type: 'string'
    }),

    defineField({
      name: 'content',
      title: 'תוכן',
      type: 'array',
      of: [{ type: 'block' }]
    }),

    defineField({
      name: 'image',
      title: 'תמונה',
      type: 'image',
      options: {
        hotspot: true
      }
    })
  ]
})