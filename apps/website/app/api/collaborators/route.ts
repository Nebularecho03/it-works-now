import { NextResponse } from "next/server";
import { siteContent } from "@/lib/content/site-content";

export async function GET() {
  try {
    const collaborators = siteContent.collaborators?.map((collaborator, index) => ({
      id: collaborator.id || `collaborator-${index}`,
      name: collaborator.name,
      title: collaborator.title,
      institution: collaborator.institution,
      email: collaborator.email,
      image: collaborator.image,
      bio: collaborator.bio,
      featured: collaborator.featured || false
    })) || [];

    return NextResponse.json({ collaborators });
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return NextResponse.json(
      { error: "Failed to fetch collaborators" },
      { status: 500 }
    );
  }
}
