import { createMetadata } from "@/lib/site";

export const metadata = createMetadata(
  "About Dr. Stephen Asatsa - Academic Leadership & Cultural Psychology",
  "Learn about Dr. Stephen Asatsa's journey as a Senior Lecturer at Catholic University of Eastern Africa, licensed psychologist, and researcher in indigenous knowledge systems and cultural psychology. Discover his academic leadership, research interests, and professional achievements.",
  "/about"
);
export const revalidate = 3600;

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
