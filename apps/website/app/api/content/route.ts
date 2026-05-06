import { NextRequest, NextResponse } from 'next/server';

// Mock database - in real implementation, this would be a proper database
let homepageContent = {
  hero: {
    id: '1',
    name: 'Dr. Stephen Asatsa',
    titles: ['Licensed Psychologist', 'Senior Lecturer', 'Research Leader'],
    tagline: 'Senior Lecturer, licensed psychologist, and research leader advancing culturally grounded psychological science.',
    primaryCta: {
      label: 'Book a Consultation',
      url: '/contact'
    },
    secondaryCta: {
      label: 'Contact',
      url: '/contact'
    },
    backgroundImage: '/assets/people/hero.webp',
    profileImage: '/assets/people/profile.webp',
    stats: {
      yearsExperience: '15+',
      clientsHelped: '1000+',
      publications: '50+'
    },
    trustBadges: {
      credentials: {
        title: 'Trusted Credentials',
        description: 'CUEA leadership, licensed practice, international research.',
        badges: ['Licensed', 'Certified']
      },
      contact: {
        phone: '+254 712 345 678',
        email: 'stephen.asatsa@cuea.edu',
        availability: 'Available 24/7'
      }
    },
    // Add fields expected by InteractiveHeroSection component
    headline: 'Culturally Grounded Psychological Science & Research',
    cta_text: 'Book a Consultation',
    cta_url: '/contact',
    background_image_url: '/assets/people/hero.webp',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  about: {
    id: '1',
    fullBiography: 'Dr. Stephen Asatsa is a distinguished psychologist and academic leader with extensive experience in clinical practice, research, and teaching. His work focuses on culturally grounded psychological approaches that integrate indigenous knowledge systems with modern psychological science.',
    shortSummary: 'Expert in psychological services, research leadership, and mentorship with extensive experience in academic strategy and clinical practice.',
    highlights: [
      '15+ years in psychological practice',
      'Expertise in culturally grounded therapy',
      'Published researcher and academic leader',
      'Specialized in community mental health'
    ],
    profileImage: '/assets/people/about.webp',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  services: [
    {
      id: '1',
      title: 'Clinical Psychology',
      description: 'Professional psychological assessment and therapy services tailored to individual needs.',
      bulletPoints: [
        'Individual counseling sessions',
        'Psychological assessments',
        'Evidence-based interventions',
        'Crisis intervention support'
      ],
      icon: 'User',
      order: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Research Consultation',
      description: 'Expert guidance on research methodology, data analysis, and academic publishing.',
      bulletPoints: [
        'Research design consultation',
        'Statistical analysis support',
        'Academic writing assistance',
        'Publication guidance'
      ],
      icon: 'Target',
      order: 2,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  research: [
    {
      id: '1',
      title: 'Luhya Mourning Rituals Study',
      status: 'active',
      description: 'Comprehensive study on traditional mourning practices and their psychological impact.',
      tags: ['cultural psychology', 'indigenous knowledge', 'community health'],
      link: '/research/luhya-mourning',
      order: 1,
      isVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  statistics: [
    {
      id: '1',
      label: 'Years Experience',
      value: '15+',
      description: 'Professional psychological practice',
      order: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      label: 'Clients Helped',
      value: '1000+',
      description: 'Individuals and families supported',
      order: 2,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      label: 'Publications',
      value: '50+',
      description: 'Research papers and articles published',
      order: 3,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  testimonials: [
    {
      id: '1',
      name: 'John Doe',
      role: 'Client',
      message: 'Dr. Asatsa provided exceptional care and guidance during a difficult time.',
      rating: 5,
      isVisible: true,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  affiliations: [
    {
      id: '1',
      organizationName: 'CUEA',
      role: 'Senior Lecturer',
      description: 'Catholic University of Eastern Africa',
      externalLink: 'https://www.cuea.edu',
      logo: '/assets/affiliations/cuea.png',
      order: 1,
      isVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  contact: {
    id: '1',
    phones: ['+254 712 345 678', '+254 734 567 890'],
    emails: ['stephen.asatsa@cuea.edu', 'contact@stephenasatsa.com'],
    address: 'Catholic University of Eastern Africa, Nairobi, Kenya',
    workingHours: 'Monday - Friday: 9:00 AM - 6:00 PM',
    socialLinks: [
      {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/in/stephenasatsa',
        icon: 'linkedin'
      },
      {
        platform: 'Twitter',
        url: 'https://twitter.com/stephenasatsa',
        icon: 'twitter'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  newsletter: {
    id: '1',
    title: 'Stay Updated',
    description: 'Subscribe to our newsletter for the latest research updates and insights.',
    buttonLabel: 'Subscribe',
    placeholder: 'Enter your email address',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  footer: {
    id: '1',
    copyright: '© 2024 Dr. Stephen Asatsa. All rights reserved.',
    quickLinks: [
      { label: 'About', url: '/about' },
      { label: 'Research', url: '/research' },
      { label: 'Contact', url: '/contact' }
    ],
    socialLinks: [
      {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/in/stephenasatsa',
        icon: 'linkedin'
      },
      {
        platform: 'Twitter',
        url: 'https://twitter.com/stephenasatsa',
        icon: 'twitter'
      }
    ],
    additionalInfo: 'Professional psychological services and research leadership.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    if (section) {
      // Return specific section
      const content = homepageContent[section as keyof typeof homepageContent];
      if (!content) {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 });
      }
      return NextResponse.json({ [section]: content });
    }

    // Return all content
    return NextResponse.json(homepageContent);
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json({ error: 'Section and data are required' }, { status: 400 });
    }

    // Update the specific section
    homepageContent[section as keyof typeof homepageContent] = {
      ...homepageContent[section as keyof typeof homepageContent],
      ...data,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ 
      message: 'Content updated successfully',
      [section]: homepageContent[section as keyof typeof homepageContent]
    });
  } catch (error) {
    console.error('Error updating homepage content:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, item } = body;

    if (!section || !item) {
      return NextResponse.json({ error: 'Section and item are required' }, { status: 400 });
    }

    // Add new item to array sections
    if (Array.isArray(homepageContent[section as keyof typeof homepageContent])) {
      const newItem = {
        ...item,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      (homepageContent[section as keyof typeof homepageContent] as any[]).push(newItem);
      
      return NextResponse.json({ 
        message: 'Item added successfully',
        item: newItem
      });
    }

    return NextResponse.json({ error: 'Section does not support adding items' }, { status: 400 });
  } catch (error) {
    console.error('Error adding content item:', error);
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const id = searchParams.get('id');

    if (!section || !id) {
      return NextResponse.json({ error: 'Section and ID are required' }, { status: 400 });
    }

    // Remove item from array sections
    if (Array.isArray(homepageContent[section as keyof typeof homepageContent])) {
      const items = homepageContent[section as keyof typeof homepageContent] as any[];
      const index = items.findIndex(item => item.id === id);
      
      if (index !== -1) {
        items.splice(index, 1);
        return NextResponse.json({ message: 'Item deleted successfully' });
      }
    }

    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  } catch (error) {
    console.error('Error deleting content item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
