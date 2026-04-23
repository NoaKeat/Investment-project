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
      hidden: true, // 👈 הלקוח לא רואה

      initialValue: () => ({
        _type: 'slug',
        current: `article-${Date.now()}`, // 👈 ייחודי אוטומטי
      }),

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