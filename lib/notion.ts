import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

export interface SlideData {
  id: number
  section: string
  title: string
  content: string
  order: number
  background: string
}

export async function fetchSlides(): Promise<SlideData[]> {
  const response = await notion.databases.query({
    database_id: 'f138c9d7-c20e-4583-8501-75891ef49317',
    sorts: [{ property: 'Order', direction: 'ascending' }],
  })

  return response.results.map((page: any) => {
    const props = page.properties
    return {
      id: props['Slide ID']?.number || 0,
      section: props['Section']?.rich_text?.[0]?.plain_text || '',
      title: props['Title']?.title?.[0]?.plain_text || '',
      content: props['Content']?.rich_text?.[0]?.plain_text || '',
      order: props['Order']?.number || 0,
      background: props['Background']?.rich_text?.[0]?.plain_text || 'bg-gradient-to-br from-slate-50 via-white to-blue-50',
    }
  })
}
