import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all stats in parallel for better performance
    const [
      totalProjects,
      publishedProjects,
      totalPublications,
      publishedPublications,
      totalAwards,
      totalUsers,
      totalMessages
    ] = await Promise.all([
      prisma.researchProject.count(),
      prisma.researchProject.count({ where: { status: "PUBLISHED" } }),
      prisma.publication.count(),
      prisma.publication.count({ where: { status: "PUBLISHED" } }),
      prisma.award.count(),
      prisma.user.count(),
      prisma.message.count()
    ]);

    // Get recent activity
    const recentActivity = await prisma.researchProject.findMany({
      take: 10,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        author: {
          select: {
            name: true
          }
        }
      }
    });

    // Format activity data
    const formattedActivity = recentActivity.map(project => ({
      id: project.id,
      action: project.status.toLowerCase(),
      entity: 'project',
      title: project.title,
      timestamp: project.updatedAt.toISOString(),
      authorName: project.author?.name || 'Unknown'
    }));

    // Calculate quick stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      projectsLast30Days,
      publicationsLast30Days,
      usersLast30Days
    ] = await Promise.all([
      prisma.researchProject.count({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.publication.count({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      })
    ]);

    const quickStats = [
      {
        label: 'Projects',
        value: totalProjects,
        change: projectsLast30Days,
        changeType: 'increase'
      },
      {
        label: 'Publications',
        value: totalPublications,
        change: publicationsLast30Days,
        changeType: 'increase'
      },
      {
        label: 'Awards',
        value: totalAwards,
        change: 0, // Could calculate this if needed
        changeType: 'increase'
      },
      {
        label: 'Users',
        value: totalUsers,
        change: usersLast30Days,
        changeType: 'increase'
      }
    ];

    const stats = {
      totalProjects,
      publishedProjects,
      draftProjects: totalProjects - publishedProjects,
      totalPublications,
      publishedPublications,
      totalAwards,
      totalUsers,
      totalMessages,
      recentActivity: formattedActivity,
      quickStats
    };

    return NextResponse.json({ stats });

  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
