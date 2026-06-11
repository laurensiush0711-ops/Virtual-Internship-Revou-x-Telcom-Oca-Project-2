import { fetchSlides, type SlideData } from '@/lib/notion'
import SlidePresentation from './components/SlidePresentation'

export const revalidate = 60

export default async function Page() {
  let slides: SlideData[] = []
  try {
    slides = await fetchSlides()
  } catch (e) {
    console.error('Failed to fetch slides from Notion:', e)
  }
  return <SlidePresentation initialSlides={slides} />
}
