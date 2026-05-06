import { NextResponse } from "next/server";
import { siteContent } from "@/lib/content/site-content";

export async function GET() {
  try {
    // Return gallery photos from site content
    const photos = siteContent.gallery?.map((item, index) => ({
      id: item.id || `photo-${index}`,
      src: item.src || item.image || item.url,
      alt: item.alt || item.title || `Gallery photo ${index + 1}`,
      caption: item.caption || item.description,
      category: item.category || 'general',
      featured: item.featured || false
    })) || [];

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching gallery photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery photos' },
      { status: 500 }
    );
  }
}
