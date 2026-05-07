import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const {
      title,
      authors,
      year,
      abstract,
      content,
      category,
      status,
      doi,
      journal
    } = Object.fromEntries(formData.entries());

    if (!file || !title || !authors || !year || !category) {
      return NextResponse.json(
        { error: "File, title, authors, year, and category are required" },
        { status: 400 }
      );
    }

    // Validate file type and size
    if (!file.type.startsWith("application/pdf") && 
        !file.type.startsWith("application/msword") && 
        !file.type.startsWith("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      return NextResponse.json(
        { error: "Only PDF and Word documents are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "publications");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `${timestamp}-${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Create publication record
    const publication = await prisma.publication.create({
      data: {
        title,
        authors,
        year: parseInt(year.toString()),
        abstract,
        content,
        category,
        status: status || "DRAFT",
        fileUrl: `/uploads/publications/${fileName}`,
        doi,
        journal,
        publishedAt: status === "PUBLISHED" ? new Date() : null
      }
    });

    return NextResponse.json({
      message: "Publication uploaded successfully",
      publication: {
        id: publication.id,
        title: publication.title,
        fileUrl: publication.fileUrl,
        status: publication.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
