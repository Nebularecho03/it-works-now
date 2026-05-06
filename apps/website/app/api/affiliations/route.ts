import { NextResponse } from "next/server";
import { siteContent } from "@/lib/content/site-content";

export async function GET() {
  try {
    const affiliations = siteContent.professionalAffiliations?.map((affiliation, index) => ({
      id: affiliation.id || `affiliation-${index}`,
      institution: affiliation.institution,
      role: affiliation.role,
      period: affiliation.period,
      logo: affiliation.logo,
      featured: affiliation.featured || false
    })) || [];

    return NextResponse.json({ affiliations });
  } catch (error) {
    console.error('Error fetching affiliations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliations' },
      { status: 500 }
    );
  }
}
