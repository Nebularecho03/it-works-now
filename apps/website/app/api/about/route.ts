import { NextResponse } from "next/server";
import { proxyAdminRequest } from "@/components/api/client";

export async function GET() {
  try {
    const response = await proxyAdminRequest(new Request("http://localhost"), "/api/about");
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Return default content if backend is not available
    return NextResponse.json({
      aboutFull: [
        "Dr. Stephen Asatsa is a Senior Lecturer and Head of Department of Psychology at the Catholic University of Eastern Africa. He integrates academic leadership with clinical practice.",
        "As a licensed psychologist registered by the Kenya Counselors and Psychologists Board, he co-founded BeautifulMind Consultants to advance mental health services in Kenya.",
        "His research focuses on indigenous knowledge systems, decolonization of psychology, thanatology, and cultural evolution. He advocates for culturally grounded psychological practice.",
        "Dr. Asatsa serves on governing councils including SRCD and represents Africa for the European Association of Personality Psychology."
      ],
      quote: {
        text: "The good life is one inspired by love and guided by knowledge.",
        author: "Bertrand Russell"
      }
    });
  }
}
