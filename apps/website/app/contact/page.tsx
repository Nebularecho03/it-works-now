import DynamicContactSection from "@/components/contact/dynamic-contact-section";

export const metadata = {
  title: 'Contact Dr. Stephen Asatsa - Professional Psychology Services',
  description: 'Get in touch with Dr. Stephen Asatsa for professional psychological services, research collaboration, or mentorship opportunities. Licensed psychologist with expertise in cultural psychology.',
  keywords: ['psychology', 'counseling', 'mental health', 'Dr. Stephen Asatsa', 'Kenya psychologist'],
};

export const revalidate = 3600;

export default function ContactPage() {
  return <DynamicContactSection />;
}
