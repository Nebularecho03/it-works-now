import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/research-hub-v2/research/projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const status = searchParams.get("status") || "PUBLISHED";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: status
    };

    if (category && category !== "All Categories") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } }
      ];
    }

    // Get projects
    const projects = await prisma.researchProject.findMany({
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
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take: limit
    });

    // Get total count for pagination
    const total = await prisma.researchProject.count({ where });

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/research-hub-v2/research/projects
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      summary,
      content,
      category,
      status,
      image,
      tags,
      funding,
      teamMembers,
      authorId
    } = body;

    // Validate required fields
    if (!title || !summary || !category) {
      return NextResponse.json(
        { error: "Title, summary, and category are required" },
        { status: 400 }
      );
    }

    // Create project
    const project = await prisma.researchProject.create({
      data: {
        title,
        slug,
        summary,
        content,
        category,
        status: status || "DRAFT",
        image,
        tags: tags || [],
        funding,
        teamMembers: teamMembers ? JSON.stringify(teamMembers) : null,
        authorId,
        publishedAt: status === "PUBLISHED" ? new Date() : null
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

    return NextResponse.json(project, { status: 201 });

  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
