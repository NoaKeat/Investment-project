import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: 'h5imnl50',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false
})