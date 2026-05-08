import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const year = searchParams.get('year');
    const status = searchParams.get('status');
    const published = searchParams.get('published') !== 'false'; // Default to true

    const skip = (page - 1) * limit;

    const where: any = { published };
    if (category) where.category = category;
    if (year) where.year = parseInt(year);
    if (status) where.status = status;

    const [publications, total] = await Promise.all([
      prisma.publication.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        },
        orderBy: { year: 'desc' },
        skip,
        take: limit
      }),
      prisma.publication.count({ where })
    ]);

    return NextResponse.json({
      publications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Failed to fetch publications:", error);
    return NextResponse.json(
      { error: "Failed to fetch publications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      authors,
      year,
      abstract,
      content,
      fileUrl,
      coverImage,
      category,
      status = "DRAFT",
      tags = [],
      doi,
      journal,
      authorId
    } = body;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const publication = await prisma.publication.create({
      data: {
        title,
        slug,
        authors,
        year,
        abstract,
        content,
        fileUrl,
        coverImage,
        category,
        status,
        tags,
        doi,
        journal,
        authorId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(publication, { status: 201 });
  } catch (error) {
    console.error("Failed to create publication:", error);
    return NextResponse.json(
      { error: "Failed to create publication" },
      { status: 500 }
    );
  }
}
