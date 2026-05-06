"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Images,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { siteContent as seedSiteContent, type SiteContent } from "@/lib/content/site-content";
import { seedBlogPosts, seedBlogContent, type BlogData, type BlogPostSummary, type BlogContent } from "@/lib/content/blog-types";
import { Award, ExternalProfile, Collaborator, MediaItem as ResearchMediaItem } from "@/lib/admin/research-hub/types";

type Panel = "overview" | "content" | "research" | "media" | "security" | 
  "testimonials" | "images" | "videos" | "documents" | "uploads" | 
  "admin-users" | "permissions" | "sessions" | "traffic" | "content-performance" | 
  "reports" | "meta-tags" | "sitemap" | "analytics-tracking" | "theme" | 
  "navigation" | "footer" | "backup" | "cache" | "logs" | "contact-forms" | 
  "newsletter" | "notifications" | "blog";

type DashboardPayload = {
  welcome: {
    title: string;
    subtitle: string;
    username: string;
    mfaConfigured: boolean;
  };
  metrics: Array<{ label: string; value: number }>;
  quickActions: Array<{ id: string; label: string; section: Panel }>;
  auditEvents: AuditEvent[];
};

type AuditEvent = {
  id: string;
  action: string;
  actor: string;
  summary: string;
  createdAt: string;
};

type MediaItem = {
  id: string;
  fileName: string;
  url: string;
  altText?: string;
  contentType?: string;
  size: number;
  uploadedAt: string;
};

type AuthUser = {
  username: string;
  displayName: string;
  role: string;
  mfaConfigured: boolean;
  phoneNumber?: string;
  email?: string;
};

const emptyBlogPost: BlogPostSummary = {
  id: "",
  title: "",
  slug: "",
  excerpt: "",
  category: "",
  publishedAt: "",
  author: "",
  status: "draft"
};

const API_BASE = "/api/admin";

const panels: Array<{ id: Panel; label: string; description: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Overview", description: "Status, quick actions, and publishing visibility.", icon: LayoutDashboard },
  { id: "content", label: "Site Content", description: "Hero, story, services, quote, and contact info.", icon: Sparkles },
  { id: "research", label: "Research Data", description: "Projects, publications, testimonials, and advanced collections.", icon: FileText },
  { id: "media", label: "Media Library", description: "Upload image and PDF assets for website.", icon: Images },
  { id: "security", label: "Security", description: "Authentication posture, sessions, and audit history.", icon: ShieldCheck },
];

const advancedKeys = [
  "awards",
  "conferences", 
  "invitedTalks",
  "externalProfiles",
  "collaborators",
  "media",
  "gallery",
] as const;

type AdvancedKey = (typeof advancedKeys)[number];

function toLines(value: string[]) {
  return value.join("\n");
}

function fromLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </label>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="space-y-6 p-6">
      <div className="space-y-1">
        <h2 className="font-display text-3xl">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </Card>
  );
}

interface AdminWorkbenchProps {
  user?: {
    username: string;
    displayName: string;
    role: string;
  };
  activePanel: Panel;
  onPanelChange: (panel: string) => void;
}

export function AdminWorkbench({ user: externalUser, activePanel: externalActivePanel, onPanelChange: externalOnPanelChange }: AdminWorkbenchProps) {
  const [activePanel, setActivePanel] = useState<Panel>(externalActivePanel || "overview");
  const [user, setUser] = useState<AuthUser | null>(externalUser ? {
    username: externalUser.username,
    displayName: externalUser.displayName,
    role: externalUser.role,
    mfaConfigured: false
  } : null);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [siteContent, setSiteContent] = useState<SiteContent>(seedSiteContent);
  const [blogData, setBlogData] = useState<BlogData>({
    blogPosts: seedBlogPosts,
    blogContentBySlug: seedBlogContent,
    blogCategories: ["Cultural Psychology", "Mental Health", "Research Methods", "Community Engagement"]
  });
  const [advancedDrafts, setAdvancedDrafts] = useState<Record<AdvancedKey, string>>(() => ({
    awards: prettyJson(seedSiteContent.awards || []),
    conferences: prettyJson(seedSiteContent.conferences || []),
    invitedTalks: prettyJson(seedSiteContent.invitedTalks || []),
    externalProfiles: prettyJson(seedSiteContent.externalProfiles || []),
    collaborators: prettyJson(seedSiteContent.collaborators || []),
    media: prettyJson(seedSiteContent.media || []),
    gallery: prettyJson(seedSiteContent.gallery || []),
  }));
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [booting, setBooting] = useState(true);
  const [pendingAction, setPendingAction] = useState<"content" | "blog" | "upload" | "auth" | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loginForm, setLoginForm] = useState({ username: "admin", password: "", otp: "" });
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");

  const request = async <T,>(path: string, init?: RequestInit) => {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const payloadText = await response.text();

    if (!response.ok) {
      if (contentType.includes("application/json")) {
        const data = JSON.parse(payloadText) as { error?: string };
        throw new Error(data.error || "Request failed");
      }
      throw new Error(payloadText.slice(0, 180) || "Request failed");
    }

    if (!contentType.includes("application/json")) {
      throw new Error(`Expected JSON from ${path}, got ${contentType || "unknown content type"}`);
    }
    return JSON.parse(payloadText) as T;
  };

  const syncAdvancedDrafts = (content: SiteContent) => {
    setAdvancedDrafts({
      awards: prettyJson(content.awards || []),
      conferences: prettyJson(content.conferences || []),
      invitedTalks: prettyJson(content.invitedTalks || []),
      externalProfiles: prettyJson(content.externalProfiles || []),
      collaborators: prettyJson(content.collaborators || []),
      media: prettyJson(content.media || []),
      gallery: prettyJson(content.gallery || []),
    });
  };

  const loadWorkspace = async () => {
    const [dashboardData, siteData, blogPayload, mediaPayload, auditPayload] = await Promise.all([
      request<DashboardPayload>("/dashboard"),
      request<{ content: SiteContent }>("/content/site"),
      request<{ content: BlogData }>("/content/blog"),
      request<{ items: MediaItem[] }>("/media"),
      request<{ events: AuditEvent[] }>("/audit"),
    ]);

    setDashboard(dashboardData);
    setSiteContent(siteData.content);
    syncAdvancedDrafts(siteData.content);
    setBlogData(blogPayload.content);
    setMediaItems(mediaPayload.items);
    setAuditEvents(auditPayload.events);
  };

  const updateBlogPost = (index: number, field: string, value: string) => {
    setBlogData((current) => {
      const blogPosts = [...current.blogPosts];
      blogPosts[index] = { ...blogPosts[index], [field]: value };
      return { ...current, blogPosts };
    });
  };

  const updateBlogBody = (slug: string, body: string, previousSlug?: string) => {
    setBlogData((current) => {
      const blogContentBySlug = { ...current.blogContentBySlug };
      
      if (previousSlug && previousSlug !== slug) {
        delete blogContentBySlug[previousSlug];
      }
      
      blogContentBySlug[slug] = {
        ...blogContentBySlug[slug],
        content: body,
        updatedAt: new Date().toISOString()
      };
      
      return { ...current, blogContentBySlug };
    });
  };

  const blogRows = blogData.blogPosts.map((post) => ({
    ...post,
    body: toLines(blogData.blogContentBySlug[post.slug] ? [blogData.blogContentBySlug[post.slug].content] : []),
  }));

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction("auth");
    setStatusMessage("");
    setErrorMessage("");

    try {
      const result = await request<{ authenticated: boolean; user: AuthUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });
      
      setUser(result.user);
      setStatusMessage("Signed in successfully.");
      await loadWorkspace();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign-in failed.";
      setErrorMessage(message);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleLogout() {
    setPendingAction("auth");
    setStatusMessage("");
    setErrorMessage("");

    try {
      await request("/auth/logout", { method: "POST", body: "{}" });
      setUser(null);
      setDashboard(null);
      setStatusMessage("Signed out.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign-out failed.";
      setErrorMessage(message);
    } finally {
      setPendingAction(null);
    }
  }

  async function refreshWorkspace() {
    setStatusMessage("");
    setErrorMessage("");
    try {
      await loadWorkspace();
      setStatusMessage("Admin data refreshed.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Refresh failed.";
      setErrorMessage(message);
    }
  }

  async function updatePhoneNumber() {
    setPendingAction("auth");
    setStatusMessage("");
    setErrorMessage("");

    try {
      await request("/user/phone", {
        method: "POST",
        body: JSON.stringify({ phoneNumber }),
      });
      setStatusMessage("Phone number updated successfully.");
      if (user) {
        setUser({ ...user, phoneNumber });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update phone number.";
      setErrorMessage(message);
    } finally {
      setPendingAction(null);
    }
  }

  async function updateEmail() {
    setPendingAction("auth");
    setStatusMessage("");
    setErrorMessage("");

    try {
      await request("/user/email", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setStatusMessage("Email updated successfully.");
      if (user) {
        setUser({ ...user, email });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update email.";
      setErrorMessage(message);
    } finally {
      setPendingAction(null);
    }
  }

  async function updateDisplayName() {
    setPendingAction("auth");
    setStatusMessage("");
    setErrorMessage("");

    try {
      await request("/user/display-name", {
        method: "POST",
        body: JSON.stringify({ displayName }),
      });
      setStatusMessage("Display name updated successfully.");
      if (user) {
        setUser({ ...user, displayName });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update display name.";
      setErrorMessage(message);
    } finally {
      setPendingAction(null);
    }
  }

  async function saveSiteContent() {
    setPendingAction("content");
    setStatusMessage("");
    setErrorMessage("");

    try {
      const payload: SiteContent = {
        ...siteContent,
        awards: JSON.parse(advancedDrafts.awards || '[]'),
        conferences: JSON.parse(advancedDrafts.conferences || '[]'),
        invitedTalks: JSON.parse(advancedDrafts.invitedTalks || '[]'),
        externalProfiles: JSON.parse(advancedDrafts.externalProfiles || '[]'),
        collaborators: JSON.parse(advancedDrafts.collaborators || '[]'),
        media: JSON.parse(advancedDrafts.media || '[]'),
        gallery: JSON.parse(advancedDrafts.gallery || '[]'),
      };

      await request("/content/site", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setSiteContent(payload);
      setStatusMessage("Site content saved to live JSON data source.");
      await loadWorkspace();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Content save failed.";
      setErrorMessage(message);
    } finally {
      setPendingAction(null);
    }
  }

  async function saveBlogData() {
    setPendingAction("blog");
    setStatusMessage("");
    setErrorMessage("");

    try {
      await request("/content/blog", {
        method: "PUT",
        body: JSON.stringify(blogData),
      });
      setStatusMessage("Blog library saved.");
      await loadWorkspace();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Blog save failed.";
      setErrorMessage(message);
    } finally {
      setPendingAction(null);
    }
  }

  async function uploadMedia(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setPendingAction("upload");
    setStatusMessage("");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      setMediaItems((prev) => [...prev, result]);
      setStatusMessage("File uploaded successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed.";
      setErrorMessage(message);
    } finally {
      setPendingAction(null);
    }
  }

  const welcome = dashboard?.welcome;

  if (booting) {
    return (
      <section className="section-space">
        <div className="container-shell">
          <Card className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading the admin control room...
          </Card>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="section-space">
        <div className="container-shell grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="space-y-6 p-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Python-backed admin</p>
              <h1 className="font-display text-5xl">Secure website operations without clutter.</h1>
              <p className="max-w-2xl text-muted-foreground">
                This new admin is designed for fast content updates, blog publishing, image uploads, and a stronger
                security posture. The frontend lives here in Next.js, while the control API runs from a Python service.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-5">
                <p className="text-sm font-semibold">What you can do</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Edit hero copy, update services, manage research entries, publish blog posts, upload assets, and
                  review audit history.
                </p>
              </Card>
              <Card className="p-5">
                <p className="text-sm font-semibold">How auth works</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Signed sessions are issued by the Python service. If `ADMIN_TOTP_SECRET` is configured, one-time code
                  verification is enforced too.
                </p>
              </Card>
            </div>
            <Card className="space-y-2 border-dashed p-5">
              <p className="text-sm font-semibold">Run backend service</p>
              <code className="block rounded-2xl bg-slate-950 px-4 py-3 text-xs text-white">
                cd /home/kopen/Documents/website && python -m backend
              </code>
            </Card>
          </Card>
          <form className="space-y-4" onSubmit={handleLogin}>
            <Field label="Username">
              <Input
                value={loginForm.username}
                onChange={(event) => setLoginForm((current) => ({ ...current, username: event.target.value }))}
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
              />
            </Field>
            <Field label="One-time code" hint="Required only when `ADMIN_TOTP_SECRET` is configured.">
              <Input
                inputMode="numeric"
                value={loginForm.otp}
                onChange={(event) => setLoginForm((current) => ({ ...current, otp: event.target.value }))}
              />
            </Field>
            <Button className="w-full" type="submit" disabled={pendingAction === "auth"}>
              {pendingAction === "auth" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LockKeyhole className="mr-2 h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>
          </form>
          {errorMessage ? (
            <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</Card>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="section-space">
      <div className="container-shell space-y-6">
        <Card className="overflow-hidden">
          <div className="grid gap-6 border-b border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(214,145,72,0.18),_transparent_34%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(251,245,236,0.96))] p-6 lg:grid-cols-[1.25fr_0.75fr] lg:p-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Admin control room</p>
                <h1 className="font-display text-5xl">{welcome?.title || "Website operations"}</h1>
                <p className="max-w-3xl text-muted-foreground">{welcome?.subtitle}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => window.history.back()} title="Go back">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => window.history.forward()} title="Go forward">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => void refreshWorkspace()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh data
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/">View public site</Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Quick actions</p>
                  <p className="text-sm text-muted-foreground">Common admin tasks</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {dashboard?.quickActions.map((action) => {
                  const Icon = panels.find((p) => p.id === action.section)?.icon || LayoutDashboard;
                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="justify-start"
                      onClick={() => setActivePanel(action.section)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6 lg:grid-cols-[260px_1fr]">
            <aside className="space-y-3">
              {panels.map((panel) => {
                const Icon = panel.icon;
                const active = activePanel === panel.id;
                return (
                  <button
                    key={panel.id}
                    type="button"
                    onClick={() => setActivePanel(panel.id)}
                    className={`w-full rounded-[24px] border px-4 py-4 text-left transition-colors ${
                      active
                        ? "border-accent/40 bg-accent/10 shadow-soft"
                        : "border-border/70 hover:bg-muted/70"
                    }`}
                  >
                    <span className="rounded-2xl bg-white/80 p-2">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{panel.label}</p>
                      <p className="text-xs text-muted-foreground">{panel.description}</p>
                    </div>
                  </button>
                );
              })}
            </aside>

            <div className="space-y-6">
              {statusMessage ? (
                <Card className="border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{statusMessage}</Card>
              ) : null}
              {errorMessage ? (
                <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</Card>
              ) : null}

              {activePanel === "overview" ? (
                <SectionCard title="Dashboard Overview" description="System status and recent activity">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Welcome to the admin dashboard.</p>
                    <p className="text-sm text-muted-foreground">Select a panel from the sidebar to begin managing content.</p>
                  </div>
                </SectionCard>
              ) : null}

              {activePanel === "content" ? (
                <>
                  <SectionCard title="Homepage essentials" description="These are the high-frequency fields an admin will update most often.">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Hero name">
                        <Input
                          value={siteContent.hero.name}
                          onChange={(event) =>
                            setSiteContent((current) => ({
                              ...current,
                              hero: { ...current.hero, name: event.target.value },
                            }))
                          }
                        />
                      </Field>
                      <Field label="Hero eyebrow">
                        <Input
                          value={siteContent.hero.eyebrow}
                          onChange={(event) =>
                            setSiteContent((current) => ({
                              ...current,
                              hero: { ...current.hero, eyebrow: event.target.value },
                            }))
                          }
                        />
                      </Field>
                      <div className="md:col-span-2">
                        <Field label="Hero headline">
                          <Textarea
                            value={siteContent.hero.headline}
                            onChange={(event) =>
                              setSiteContent((current) => ({
                                ...current,
                                hero: { ...current.hero, headline: event.target.value },
                              }))
                            }
                          />
                        </Field>
                      </div>
                      <div className="md:col-span-2">
                        <Field label="Hero subheadline">
                          <Textarea
                            value={siteContent.hero.subheadline}
                            onChange={(event) =>
                              setSiteContent((current) => ({
                                ...current,
                                hero: { ...current.hero, subheadline: event.target.value },
                              }))
                            }
                          />
                        </Field>
                      </div>
                      <div className="grid gap-4 lg:grid-cols-3">
                        <Field label="Primary CTA label">
                          <Input
                            value={siteContent.hero.primaryCta.label}
                            onChange={(event) =>
                              setSiteContent((current) => ({
                                ...current,
                                hero: { ...current.hero, primaryCta: { ...current.hero.primaryCta, label: event.target.value } },
                              }))
                            }
                          />
                        </Field>
                        <Field label="Primary CTA link">
                          <Input
                            value={siteContent.hero.primaryCta.href}
                            onChange={(event) =>
                              setSiteContent((current) => ({
                                ...current,
                                hero: { ...current.hero, primaryCta: { ...current.hero.primaryCta, href: event.target.value } },
                              }))
                            }
                          />
                        </Field>
                        <Field label="Publications CTA label">
                          <Input
                            value={siteContent.hero.publicationsCta.label}
                            onChange={(event) =>
                              setSiteContent((current) => ({
                                ...current,
                                hero: { ...current.hero, publicationsCta: { ...current.hero.publicationsCta, label: event.target.value } },
                              }))
                            }
                          />
                        </Field>
                        <Field label="Publications CTA link">
                          <Input
                            value={siteContent.hero.publicationsCta.href}
                            onChange={(event) =>
                              setSiteContent((current) => ({
                                ...current,
                                hero: { ...current.hero, publicationsCta: { ...current.hero.publicationsCta, href: event.target.value } },
                              }))
                            }
                          />
                        </Field>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Bio and quote" description="Short and long-form content that supports homepage and about sections.">
                    <Field label="Short biography">
                      <Textarea
                        value={siteContent.aboutShort}
                        onChange={(event) => setSiteContent((current) => ({ ...current, aboutShort: event.target.value }))}
                      />
                    </Field>
                    <Field label="Full biography paragraphs" hint="One paragraph per line break block.">
                      <Textarea
                        value={toLines(siteContent.aboutFull)}
                        onChange={(event) => setSiteContent((current) => ({ ...current, aboutFull: fromLines(event.target.value) }))}
                      />
                    </Field>
                    <div className="grid gap-4 md:grid-cols-[1fr_280px]">
                      <Field label="Quote text">
                        <Textarea
                          value={siteContent.quote.text}
                          onChange={(event) =>
                            setSiteContent((current) => ({
                              ...current,
                              quote: { ...current.quote, text: event.target.value },
                            }))
                          }
                        />
                      </Field>
                      <Field label="Quote author">
                        <Input
                          value={siteContent.quote.author}
                          onChange={(event) =>
                            setSiteContent((current) => ({
                              ...current,
                              quote: { ...current.quote, author: event.target.value },
                            }))
                          }
                        />
                      </Field>
                    </div>
                  </SectionCard>

                  <SectionCard title="Services editor" description="Each service card can be updated independently and reordered manually.">
                    <div className="space-y-4">
                      {siteContent.services.map((service, index) => (
                        <Card key={`${service.title}-${index}`} className="space-y-4 p-5">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-semibold">Service {index + 1}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setSiteContent((current) => ({
                                  ...current,
                                  services: current.services.filter((_, itemIndex) => itemIndex !== index),
                                }))
                              }
                            >
                              Remove
                            </Button>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Title">
                              <Input
                                value={service.title}
                                onChange={(event) =>
                                  setSiteContent((current) => {
                                    const services = [...current.services];
                                    services[index] = { ...services[index], title: event.target.value };
                                    return { ...current, services };
                                  })
                                }
                              />
                            </Field>
                            <Field label="Bullets" hint="One bullet per line.">
                              <Textarea
                                value={toLines(service.bullets)}
                                onChange={(event) =>
                                  setSiteContent((current) => {
                                    const services = [...current.services];
                                    services[index] = { ...services[index], bullets: fromLines(event.target.value) };
                                    return { ...current, services };
                                  })
                                }
                              />
                            </Field>
                            <div className="md:col-span-2">
                              <Field label="Description">
                                <Textarea
                                  value={service.description}
                                  onChange={(event) =>
                                    setSiteContent((current) => {
                                      const services = [...current.services];
                                      services[index] = { ...services[index], description: event.target.value };
                                      return { ...current, services };
                                    })
                                  }
                                />
                              </Field>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setSiteContent((current) => ({
                          ...current,
                          services: [
                            ...current.services,
                            { title: "New service", description: "Describe service offering.", bullets: ["Key outcome"] },
                          ],
                        }))
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add service
                    </Button>
                  </SectionCard>

                  <SectionCard title="Contact channels" description="Details used across contact page, footer, and booking calls to action.">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Address lines" hint="One line per row.">
                        <Textarea
                          value={toLines(siteContent.contact.addressLines)}
                          onChange={(event) =>
                            setSiteContent((current) => ({
                              ...current,
                              contact: { ...current.contact, addressLines: fromLines(event.target.value) },
                            }))
                          }
                        />
                      </Field>
                      <Field label="Phone numbers" hint="One number per row.">
                        <Textarea
                          value={toLines(siteContent.contact.phones)}
                          onChange={(event) =>
                            setSiteContent((current) => ({
                              ...current,
                              contact: { ...current.contact, phones: fromLines(event.target.value) },
                            }))
                          }
                        />
                      </Field>
                      <Field label="WhatsApp link">
                        <Input
                          value={siteContent.contact.whatsapp}
                          onChange={(event) =>
                            setSiteContent((current) => ({
                              ...current,
                              contact: { ...current.contact, whatsapp: event.target.value },
                            }))
                          }
                        />
                      </Field>
                      <Field label="Booking URL">
                        <Input
                          value={siteContent.contact.bookingUrl}
                          onChange={(event) =>
                            setSiteContent((current) => ({
                              ...current,
                              contact: { ...current.contact, bookingUrl: event.target.value },
                            }))
                          }
                        />
                      </Field>
                      <div className="md:col-span-2">
                        <Field label="Map embed URL">
                          <Textarea
                            value={siteContent.contact.mapEmbed}
                            onChange={(event) =>
                              setSiteContent((current) => ({
                                ...current,
                                contact: { ...current.contact, mapEmbed: event.target.value },
                              }))
                            }
                          />
                        </Field>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-semibold">Social links</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setSiteContent((current) => ({
                                ...current,
                                contact: {
                                  ...current.contact,
                                  socialLinks: [
                                    ...current.contact.socialLinks,
                                    { label: "Platform", href: "https://" },
                                  ],
                                },
                              }))
                            }
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add social link
                          </Button>
                        </div>

                        {siteContent.contact.socialLinks.map((social, index) => (
                          <Card key={`${social.label}-${index}`} className="grid gap-4 p-4 md:grid-cols-[220px_1fr_auto]">
                            <Input
                              value={social.label}
                              onChange={(event) =>
                                setSiteContent((current) => {
                                  const socialLinks = [...current.contact.socialLinks];
                                  socialLinks[index] = { ...socialLinks[index], label: event.target.value };
                                  return { ...current, contact: { ...current.contact, socialLinks } };
                                })
                              }
                            />
                            <Input
                              value={social.href}
                              onChange={(event) =>
                                setSiteContent((current) => {
                                  const socialLinks = [...current.contact.socialLinks];
                                  socialLinks[index] = { ...socialLinks[index], href: event.target.value };
                                  return { ...current, contact: { ...current.contact, socialLinks } };
                                })
                              }
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setSiteContent((current) => ({
                                  ...current,
                                  contact: {
                                    ...current.contact,
                                    socialLinks: current.contact.socialLinks.filter((_, itemIndex) => itemIndex !== index),
                                  },
                                }))
                              }
                            >
                              Remove
                            </Button>
                          </Card>
                        ))}
                      </div>

                      <Button onClick={() => void saveSiteContent()} disabled={pendingAction === "content"}>
                        {pendingAction === "content" ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save site content
                          </>
                        )}
                      </Button>
                    </div>
                  </SectionCard>
                </>
              ) : null}

              {activePanel === "research" ? (
                <>
                  <SectionCard title="Research projects" description="Structured cards for research, grants, status, and public links.">
                    <div className="space-y-4">
                      {siteContent.researchProjects.map((project, index) => (
                        <Card key={`${project.title}-${index}`} className="space-y-5 p-5">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-semibold">Project {index + 1}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setSiteContent((current) => ({
                                  ...current,
                                  researchProjects: current.researchProjects.filter((_, itemIndex) => itemIndex !== index),
                                }))
                              }
                            >
                              Remove
                            </Button>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Title">
                              <Input
                                value={project.title}
                                onChange={(event) =>
                                  setSiteContent((current) => {
                                    const researchProjects = [...current.researchProjects];
                                    researchProjects[index] = { ...researchProjects[index], title: event.target.value };
                                    return { ...current, researchProjects };
                                  })
                                }
                              />
                            </Field>
                            <Field label="Category">
                              <Input
                                value={project.category}
                                onChange={(event) =>
                                  setSiteContent((current) => {
                                    const researchProjects = [...current.researchProjects];
                                    researchProjects[index] = { ...researchProjects[index], category: event.target.value };
                                    return { ...current, researchProjects };
                                  })
                                }
                              />
                            </Field>
                            <Field label="Status">
                              <Input
                                value={project.status}
                                onChange={(event) =>
                                  setSiteContent((current) => {
                                    const researchProjects = [...current.researchProjects];
                                    researchProjects[index] = { ...researchProjects[index], status: event.target.value };
                                    return { ...current, researchProjects };
                                  })
                                }
                              />
                            </Field>
                            <Field label="Funding">
                              <Input
                                value={project.funding || ""}
                                onChange={(event) =>
                                  setSiteContent((current) => {
                                    const researchProjects = [...current.researchProjects];
                                    researchProjects[index] = { ...researchProjects[index], funding: event.target.value };
                                    return { ...current, researchProjects };
                                  })
                                }
                              />
                            </Field>
                            <Field label="Link" hint="Optional external project URL.">
                              <Input
                                value={project.link || ""}
                                onChange={(event) =>
                                  setSiteContent((current) => {
                                    const researchProjects = [...current.researchProjects];
                                    researchProjects[index] = { ...researchProjects[index], link: event.target.value };
                                    return { ...current, researchProjects };
                                  })
                                }
                              />
                            </Field>
                            <div className="md:col-span-2">
                              <Field label="Summary">
                                <Textarea
                                  value={project.summary}
                                  onChange={(event) =>
                                    setSiteContent((current) => {
                                      const researchProjects = [...current.researchProjects];
                                      researchProjects[index] = { ...researchProjects[index], summary: event.target.value };
                                      return { ...current, researchProjects };
                                    })
                                  }
                                />
                              </Field>
                              <div className="md:col-span-2">
                                <Field label="Detail bullets" hint="One bullet per line.">
                                  <Textarea
                                    value={toLines(project.details || [])}
                                    onChange={(event) =>
                                      setSiteContent((current) => {
                                        const researchProjects = [...current.researchProjects];
                                        researchProjects[index] = { ...researchProjects[index], details: fromLines(event.target.value) };
                                        return { ...current, researchProjects };
                                      })
                                    }
                                  />
                                </Field>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setSiteContent((current) => ({
                          ...current,
                          researchProjects: [
                            ...current.researchProjects,
                            {
                              title: "New research project",
                              summary: "Describe project focus and impact.",
                              category: "Category",
                              status: "Draft",
                              funding: "",
                              details: [],
                              link: "",
                            },
                          ],
                        }))
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add project
                    </Button>
                  </SectionCard>

                  <SectionCard title="Publications and testimonials" description="Keep public credibility assets current without touching code.">
                    <div className="grid gap-6 xl:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-semibold">Publications</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setSiteContent((current) => ({
                                ...current,
                                publications: [
                                  ...current.publications,
                                  { title: "New publication", year: "2026", type: "Article", summary: "", fileUrl: "" },
                                ],
                              }))
                            }
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add publication
                          </Button>
                        </div>

                        {siteContent.publications.map((publication, index) => (
                          <Card key={`${publication.title}-${index}`} className="space-y-4 p-4">
                            <Input
                              value={publication.title}
                              onChange={(event) =>
                                setSiteContent((current) => {
                                  const publications = [...current.publications];
                                  publications[index] = { ...publications[index], title: event.target.value };
                                  return { ...current, publications };
                                })
                              }
                            />
                            <div className="grid gap-4 md:grid-cols-2">
                              <Input
                                value={publication.year}
                                onChange={(event) =>
                                  setSiteContent((current) => {
                                    const publications = [...current.publications];
                                    publications[index] = { ...publications[index], year: event.target.value };
                                    return { ...current, publications };
                                  })
                                }
                              />
                              <Input
                                value={publication.type}
                                onChange={(event) =>
                                  setSiteContent((current) => {
                                    const publications = [...current.publications];
                                    publications[index] = { ...publications[index], type: event.target.value };
                                    return { ...current, publications };
                                  })
                                }
                              />
                              <div className="md:col-span-2">
                                <Field label="Summary">
                                  <Textarea
                                    value={publication.summary}
                                    onChange={(event) =>
                                      setSiteContent((current) => {
                                        const publications = [...current.publications];
                                        publications[index] = { ...publications[index], summary: event.target.value };
                                        return { ...current, publications };
                                      })
                                    }
                                  />
                                </Field>
                                <div className="md:col-span-2">
                                  <Field label="File URL">
                                    <Input
                                      value={publication.fileUrl || ""}
                                      onChange={(event) =>
                                        setSiteContent((current) => {
                                          const publications = [...current.publications];
                                          publications[index] = { ...publications[index], fileUrl: event.target.value };
                                          return { ...current, publications };
                                        })
                                      }
                                    />
                                  </Field>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-semibold">Testimonials</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setSiteContent((current) => ({
                                ...current,
                                testimonials: [
                                  ...current.testimonials,
                                  { name: "New testimonial", role: "Role", quote: "", image: "" },
                                ],
                              }))
                            }
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add testimonial
                          </Button>
                        </div>

                        {siteContent.testimonials.map((testimonial, index) => (
                          <Card key={`${testimonial.name}-${index}`} className="space-y-4 p-4">
                            <Input
                              value={testimonial.name}
                              onChange={(event) =>
                                setSiteContent((current) => {
                                  const testimonials = [...current.testimonials];
                                  testimonials[index] = { ...testimonials[index], name: event.target.value };
                                  return { ...current, testimonials };
                                })
                              }
                            />
                            <Input
                              value={testimonial.role}
                              onChange={(event) =>
                                setSiteContent((current) => {
                                  const testimonials = [...current.testimonials];
                                  testimonials[index] = { ...testimonials[index], role: event.target.value };
                                  return { ...current, testimonials };
                                })
                              }
                            />
                            <Textarea
                              value={testimonial.quote}
                              onChange={(event) =>
                                setSiteContent((current) => {
                                  const testimonials = [...current.testimonials];
                                  testimonials[index] = { ...testimonials[index], quote: event.target.value };
                                  return { ...current, testimonials };
                                })
                              }
                            />
                            <Input
                              value={testimonial.image}
                              onChange={(event) =>
                                setSiteContent((current) => {
                                  const testimonials = [...current.testimonials];
                                  testimonials[index] = { ...testimonials[index], image: event.target.value };
                                  return { ...current, testimonials };
                                })
                              }
                            />
                          </Card>
                        ))}
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Advanced collections" description="These JSON editors cover more structured content that changes less frequently.">
                    <div className="grid gap-5 xl:grid-cols-2">
                      {advancedKeys.map((key) => (
                        <Field
                          key={key}
                          label={key}
                          hint="Leave valid JSON here. This is fallback editor for complex collections."
                        >
                          <Textarea
                            className="min-h-[220px] font-mono text-xs"
                            value={advancedDrafts[key]}
                            onChange={(event) =>
                              setAdvancedDrafts((current) => ({
                                ...current,
                                [key]: event.target.value,
                              }))
                            }
                          />
                        </Field>
                      ))}
                    </div>

                    <Button onClick={() => void saveSiteContent()} disabled={pendingAction === "content"}>
                      {pendingAction === "content" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save research and advanced content
                        </>
                      )}
                    </Button>
                  </SectionCard>
                </>
              ) : null}

              {activePanel === "blog" ? (
                <>
                  <SectionCard title="Blog post manager" description="Draft and revise articles with metadata and post body paragraphs together.">
                    <div className="space-y-5">
                      {blogRows.map((post, index) => (
                        <Card key={`${post.slug || "post"}-${index}`} className="space-y-5 p-5">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-semibold">Post {index + 1}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setBlogData((current) => {
                                  const nextPosts = current.blogPosts.filter((_, itemIndex) => itemIndex !== index);
                                  const nextContent = { ...current.blogContentBySlug };
                                  delete nextContent[post.slug];
                                  return { ...current, blogPosts: nextPosts, blogContentBySlug: nextContent };
                                })
                              }
                            >
                              Remove
                            </Button>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Title">
                              <Input value={post.title} onChange={(event) => updateBlogPost(index, "title", event.target.value)} />
                            </Field>
                            <Field label="Slug">
                              <Input
                                value={post.slug}
                                onChange={(event) => {
                                  const nextSlug = event.target.value;
                                  const previousSlug = blogData.blogPosts[index]?.slug;
                                  updateBlogPost(index, "slug", nextSlug);
                                  updateBlogBody(nextSlug, post.body, previousSlug);
                                }}
                              />
                            </Field>
                            <Field label="ID">
                              <Input value={post.id} onChange={(event) => updateBlogPost(index, "id", event.target.value)} />
                            </Field>
                            <Field label="Category">
                              <Input value={post.category} onChange={(event) => updateBlogPost(index, "category", event.target.value)} />
                            </Field>
                            <Field label="Publish date" hint="Use YYYY-MM-DD.">
                              <Input
                                value={post.publishedAt}
                                onChange={(event) => updateBlogPost(index, "publishedAt", event.target.value)}
                              />
                            </Field>
                            <Field label="Featured image URL">
                              <Input
                                value={post.featuredImage || ""}
                                onChange={(event) => updateBlogPost(index, "featuredImage", event.target.value)}
                              />
                            </Field>
                            <div className="md:col-span-2">
                              <Field label="Excerpt">
                                <Textarea value={post.excerpt} onChange={(event) => updateBlogPost(index, "excerpt", event.target.value)} />
                              </Field>
                              <div className="md:col-span-2">
                                <Field label="Article body" hint="One paragraph per line.">
                                  <Textarea
                                    value={post.body}
                                    onChange={(event) => updateBlogBody(post.slug, event.target.value)}
                                  />
                                </Field>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const timestamp = Date.now();
                          const nextId = `post-${timestamp}`;
                          const nextSlug = `new-post-${timestamp}`;

                          setBlogData((current) => ({
                            ...current,
                            blogPosts: [...current.blogPosts, { ...emptyBlogPost, id: nextId, slug: nextSlug }],
                            blogContentBySlug: {
                              ...current.blogContentBySlug,
                              [nextSlug]: {
                                id: nextId,
                                title: "",
                                content: "",
                                excerpt: "",
                                slug: nextSlug,
                                category: "",
                                publishedAt: new Date().toISOString(),
                                status: "draft",
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                              }
                            }
                          }));
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add blog post
                      </Button>
                      <Button onClick={() => void saveBlogData()} disabled={pendingAction === "blog"}>
                        {pendingAction === "blog" ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save blog content
                          </>
                        )}
                      </Button>
                    </div>
                  </SectionCard>
                </>
              ) : null}

              {activePanel === "media" ? (
                <>
                  <SectionCard title="Media library" description="Upload image and PDF assets into public website folder without leaving admin.">
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                      <Field label="Upload file" hint="Accepted types: JPG, PNG, WEBP, GIF, PDF up to 10MB.">
                        <Input type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.pdf" onChange={(event) => void uploadMedia(event)} />
                      </Field>
                      <Button variant="outline" onClick={() => void refreshWorkspace()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh library
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {mediaItems.map((item) => (
                        <Card key={item.id} className="space-y-3 p-4">
                          <div className="aspect-[4/3] overflow-hidden rounded-[20px] border border-border/70 bg-muted">
                            {item.contentType?.startsWith("image/") ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img alt={item.altText || item.fileName} className="h-full w-full object-cover" src={item.url} />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Document asset</div>
                            )}
                          </div>
                          <div>
                            <p className="truncate text-sm font-semibold">{item.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(item.size / 1024)} KB • {new Date(item.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Input readOnly value={item.url} />
                        </Card>
                      ))}
                    </div>
                  </SectionCard>
                </>
              ) : null}

              {activePanel === "security" ? (
                <>
                  <SectionCard title="Authentication posture" description="Keep admin restricted to trusted operators only.">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="p-5">
                        <p className="text-sm font-semibold">Current session</p>
                        <p className="text-sm text-muted-foreground">
                          Signed in as <span className="font-semibold text-foreground">{user.username}</span> with role{" "}
                          <span className="font-semibold text-foreground">{user.role}</span>.
                        </p>
                      </Card>
                      <Card className="p-5">
                        <p className="text-sm font-semibold">MFA status</p>
                        <p className="text-sm text-muted-foreground">
                          {user.mfaConfigured
                            ? "One-time code verification is configured in the backend."
                            : "MFA is not configured yet. Set `ADMIN_TOTP_SECRET` before production use."}
                        </p>
                      </Card>
                    </div>
                    <Card className="space-y-4 p-5">
                      <p className="text-sm font-semibold">Profile Information</p>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Display Name</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              placeholder="Enter your display name"
                              className="flex-1 border px-3 py-2 text-sm rounded-md"
                            />
                            <Button
                              onClick={updateDisplayName}
                              disabled={pendingAction === "auth"}
                              size="sm"
                            >
                              {pendingAction === "auth" ? "Saving..." : "Update"}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Address</label>
                          <div className="flex gap-2">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Enter your email"
                              className="flex-1 border px-3 py-2 text-sm rounded-md"
                            />
                            <Button
                              onClick={updateEmail}
                              disabled={pendingAction === "auth"}
                              size="sm"
                            >
                              {pendingAction === "auth" ? "Saving..." : "Update"}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number</label>
                          <div className="flex gap-2">
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="Enter your phone number"
                              className="flex-1 border px-3 py-2 text-sm rounded-md"
                            />
                            <Button
                              onClick={updatePhoneNumber}
                              disabled={pendingAction === "auth"}
                              size="sm"
                            >
                              {pendingAction === "auth" ? "Saving..." : "Update"}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your contact information can be used for account recovery and notifications.
                      </p>
                    </Card>
                    <Card className="space-y-3 border-dashed p-5">
                      <p className="text-sm font-semibold">Recommended production hardening</p>
                      <p className="text-sm text-muted-foreground">
                        Move off fallback password immediately, define `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and
                        `ADMIN_TOTP_SECRET`, restrict `ADMIN_ALLOWED_ORIGIN`, and run Python service behind HTTPS.
                      </p>
                    </Card>
                  </SectionCard>

                  <SectionCard title="Audit timeline" description="Every login, logout, save, and upload appears here for traceability.">
                    <div className="space-y-3">
                      {auditEvents.map((event) => (
                        <Card key={event.id} className="flex items-center justify-between gap-4 p-4">
                          <div>
                            <p className="text-sm font-semibold">{event.summary}</p>
                            <p className="text-xs text-muted-foreground">
                              {event.action} • {event.actor}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</p>
                        </Card>
                      ))}
                    </div>
                  </SectionCard>
                </>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
