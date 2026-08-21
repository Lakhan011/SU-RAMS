// ============================================================
// CMS Admin Panel — Mock Data
// ============================================================

export const stats = [
  { label: "Total Posts", value: 1284, change: 12.5, icon: "FileText" as const },
  { label: "Total Users", value: 8492, change: 8.2, icon: "Users" as const },
  { label: "Comments", value: 3621, change: -2.4, icon: "MessageSquare" as const },
  { label: "Page Views", value: 284930, change: 18.7, icon: "Eye" as const },
];

export const recentActivity = [
  { id: 1, user: "Sarah Chen", avatar: "SC", action: "published", target: "Getting Started with Next.js 15", time: "2026-06-04T11:30:00Z", type: "post" as const },
  { id: 2, user: "James Wilson", avatar: "JW", action: "commented on", target: "Design System Best Practices", time: "2026-06-04T10:45:00Z", type: "comment" as const },
  { id: 3, user: "Maria Rodriguez", avatar: "MR", action: "uploaded", target: "hero-banner.jpg", time: "2026-06-04T09:20:00Z", type: "media" as const },
  { id: 4, user: "David Park", avatar: "DP", action: "updated", target: "About Us", time: "2026-06-04T08:15:00Z", type: "page" as const },
  { id: 5, user: "Emily Brown", avatar: "EB", action: "created user", target: "alex@example.com", time: "2026-06-03T16:30:00Z", type: "user" as const },
  { id: 6, user: "Alex Turner", avatar: "AT", action: "deleted", target: "Old Draft Post", time: "2026-06-03T14:00:00Z", type: "post" as const },
];

export const topContent = [
  { id: 1, title: "Complete Guide to Modern CSS", views: 24580, comments: 142, status: "published" as const },
  { id: 2, title: "React Server Components Deep Dive", views: 18320, comments: 98, status: "published" as const },
  { id: 3, title: "Building Scalable APIs with Node.js", views: 15640, comments: 76, status: "published" as const },
  { id: 4, title: "TypeScript Tips and Tricks", views: 12890, comments: 64, status: "published" as const },
  { id: 5, title: "Web Performance Optimization", views: 10250, comments: 53, status: "published" as const },
];

export const trafficData = [
  { name: "Jan", views: 4000, visitors: 2400 },
  { name: "Feb", views: 3000, visitors: 1398 },
  { name: "Mar", views: 5000, visitors: 3200 },
  { name: "Apr", views: 4780, visitors: 2908 },
  { name: "May", views: 5890, visitors: 3800 },
  { name: "Jun", views: 6390, visitors: 4300 },
  { name: "Jul", views: 5490, visitors: 3400 },
  { name: "Aug", views: 6000, visitors: 3900 },
  { name: "Sep", views: 7000, visitors: 4600 },
  { name: "Oct", views: 6500, visitors: 4100 },
  { name: "Nov", views: 7200, visitors: 4800 },
  { name: "Dec", views: 8100, visitors: 5200 },
];

export const trafficSources = [
  { name: "Organic Search", value: 42, color: "#6366f1" },
  { name: "Direct", value: 28, color: "#10b981" },
  { name: "Social Media", value: 18, color: "#f59e0b" },
  { name: "Referral", value: 8, color: "#3b82f6" },
  { name: "Email", value: 4, color: "#ef4444" },
];

export type PostStatus = "published" | "draft" | "archived" | "scheduled";

export interface Post {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  authorAvatar: string;
  category: string;
  status: PostStatus;
  date: string;
  views: number;
  comments: number;
  featuredImage?: string;
}

export const posts: Post[] = [
  { id: 1, title: "Complete Guide to Modern CSS", excerpt: "Learn everything about modern CSS including Grid, Flexbox, and custom properties...", author: "Sarah Chen", authorAvatar: "SC", category: "CSS", status: "published", date: "2026-06-04", views: 24580, comments: 142 },
  { id: 2, title: "React Server Components Deep Dive", excerpt: "Understanding the new paradigm of React Server Components and how they change...", author: "James Wilson", authorAvatar: "JW", category: "React", status: "published", date: "2026-06-03", views: 18320, comments: 98 },
  { id: 3, title: "Building Scalable APIs with Node.js", excerpt: "Best practices for building production-ready APIs that can handle millions...", author: "Maria Rodriguez", authorAvatar: "MR", category: "Backend", status: "draft", date: "2026-06-02", views: 0, comments: 0 },
  { id: 4, title: "TypeScript Tips and Tricks", excerpt: "Advanced TypeScript patterns that will make your code more type-safe...", author: "David Park", authorAvatar: "DP", category: "TypeScript", status: "published", date: "2026-06-01", views: 12890, comments: 64 },
  { id: 5, title: "Web Performance Optimization", excerpt: "Strategies for improving Core Web Vitals and delivering blazing fast pages...", author: "Emily Brown", authorAvatar: "EB", category: "Performance", status: "scheduled", date: "2026-06-10", views: 0, comments: 0 },
  { id: 6, title: "Introduction to AI-Powered Development", excerpt: "How AI tools are reshaping the development workflow and boosting productivity...", author: "Alex Turner", authorAvatar: "AT", category: "AI", status: "draft", date: "2026-05-28", views: 0, comments: 0 },
  { id: 7, title: "Tailwind CSS v4 Migration Guide", excerpt: "Step by step guide to migrating your project from Tailwind CSS v3 to v4...", author: "Sarah Chen", authorAvatar: "SC", category: "CSS", status: "published", date: "2026-05-25", views: 10250, comments: 53 },
  { id: 8, title: "Database Design Patterns", excerpt: "Common database design patterns for modern applications including NoSQL...", author: "James Wilson", authorAvatar: "JW", category: "Backend", status: "archived", date: "2026-05-20", views: 8420, comments: 37 },
];

export interface CMSPage {
  id: number;
  title: string;
  slug: string;
  status: "published" | "draft";
  template: string;
  author: string;
  lastModified: string;
  parent?: string;
  order: number;
}

export const pages: CMSPage[] = [
  { id: 1, title: "Home", slug: "/", status: "published", template: "Homepage", author: "Sarah Chen", lastModified: "2026-06-04", order: 1 },
  { id: 2, title: "About Us", slug: "/about", status: "published", template: "Default", author: "David Park", lastModified: "2026-06-03", order: 2 },
  { id: 3, title: "Our Team", slug: "/about/team", status: "published", template: "Default", author: "David Park", lastModified: "2026-06-01", parent: "About Us", order: 1 },
  { id: 4, title: "Careers", slug: "/about/careers", status: "draft", template: "Default", author: "Emily Brown", lastModified: "2026-05-28", parent: "About Us", order: 2 },
  { id: 5, title: "Services", slug: "/services", status: "published", template: "Landing", author: "Maria Rodriguez", lastModified: "2026-06-02", order: 3 },
  { id: 6, title: "Contact", slug: "/contact", status: "published", template: "Contact", author: "Sarah Chen", lastModified: "2026-05-30", order: 4 },
  { id: 7, title: "Privacy Policy", slug: "/privacy", status: "published", template: "Legal", author: "James Wilson", lastModified: "2026-05-15", order: 5 },
  { id: 8, title: "Terms of Service", slug: "/terms", status: "published", template: "Legal", author: "James Wilson", lastModified: "2026-05-15", order: 6 },
];

export interface MediaItem {
  id: number;
  name: string;
  type: "image" | "video" | "document" | "audio";
  size: string;
  dimensions?: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  color: string;
}

export const mediaItems: MediaItem[] = [
  { id: 1, name: "hero-banner.jpg", type: "image", size: "2.4 MB", dimensions: "1920x1080", url: "#", uploadedBy: "Sarah Chen", uploadedAt: "2026-06-04", color: "#6366f1" },
  { id: 2, name: "team-photo.png", type: "image", size: "1.8 MB", dimensions: "1200x800", url: "#", uploadedBy: "David Park", uploadedAt: "2026-06-03", color: "#10b981" },
  { id: 3, name: "product-demo.mp4", type: "video", size: "45.2 MB", dimensions: "1920x1080", url: "#", uploadedBy: "Alex Turner", uploadedAt: "2026-06-02", color: "#f59e0b" },
  { id: 4, name: "whitepaper.pdf", type: "document", size: "3.1 MB", url: "#", uploadedBy: "James Wilson", uploadedAt: "2026-06-01", color: "#ef4444" },
  { id: 5, name: "logo-dark.svg", type: "image", size: "24 KB", dimensions: "200x60", url: "#", uploadedBy: "Maria Rodriguez", uploadedAt: "2026-05-30", color: "#3b82f6" },
  { id: 6, name: "podcast-ep12.mp3", type: "audio", size: "28.5 MB", url: "#", uploadedBy: "Emily Brown", uploadedAt: "2026-05-28", color: "#8b5cf6" },
  { id: 7, name: "infographic.png", type: "image", size: "890 KB", dimensions: "800x2400", url: "#", uploadedBy: "Sarah Chen", uploadedAt: "2026-05-25", color: "#ec4899" },
  { id: 8, name: "annual-report.pdf", type: "document", size: "5.6 MB", url: "#", uploadedBy: "James Wilson", uploadedAt: "2026-05-22", color: "#ef4444" },
  { id: 9, name: "thumbnail-grid.jpg", type: "image", size: "340 KB", dimensions: "600x400", url: "#", uploadedBy: "David Park", uploadedAt: "2026-05-20", color: "#14b8a6" },
  { id: 10, name: "background-pattern.svg", type: "image", size: "12 KB", dimensions: "100x100", url: "#", uploadedBy: "Maria Rodriguez", uploadedAt: "2026-05-18", color: "#f97316" },
  { id: 11, name: "tutorial-video.mp4", type: "video", size: "120 MB", url: "#", uploadedBy: "Alex Turner", uploadedAt: "2026-05-15", color: "#f59e0b" },
  { id: 12, name: "style-guide.pdf", type: "document", size: "2.2 MB", url: "#", uploadedBy: "Emily Brown", uploadedAt: "2026-05-12", color: "#ef4444" },
];

export interface Category {
  id: number;
  name: string;
  slug: string;
  postCount: number;
  children?: Category[];
}

export const categories: Category[] = [
  { id: 1, name: "Technology", slug: "technology", postCount: 45, children: [
    { id: 11, name: "Web Development", slug: "web-development", postCount: 28 },
    { id: 12, name: "Mobile", slug: "mobile", postCount: 12 },
    { id: 13, name: "DevOps", slug: "devops", postCount: 5 },
  ]},
  { id: 2, name: "Design", slug: "design", postCount: 32, children: [
    { id: 21, name: "UI/UX", slug: "ui-ux", postCount: 18 },
    { id: 22, name: "Graphics", slug: "graphics", postCount: 14 },
  ]},
  { id: 3, name: "Business", slug: "business", postCount: 21 },
  { id: 4, name: "Tutorials", slug: "tutorials", postCount: 38 },
  { id: 5, name: "News", slug: "news", postCount: 15 },
];

export const tags = [
  { id: 1, name: "React", postCount: 24 },
  { id: 2, name: "Next.js", postCount: 18 },
  { id: 3, name: "TypeScript", postCount: 22 },
  { id: 4, name: "CSS", postCount: 16 },
  { id: 5, name: "JavaScript", postCount: 30 },
  { id: 6, name: "Node.js", postCount: 14 },
  { id: 7, name: "Tailwind", postCount: 12 },
  { id: 8, name: "API", postCount: 8 },
  { id: 9, name: "Database", postCount: 10 },
  { id: 10, name: "Performance", postCount: 7 },
  { id: 11, name: "Security", postCount: 5 },
  { id: 12, name: "Testing", postCount: 9 },
  { id: 13, name: "Docker", postCount: 6 },
  { id: 14, name: "AI", postCount: 11 },
  { id: 15, name: "Open Source", postCount: 4 },
];

export interface Comment {
  id: number;
  author: string;
  avatar: string;
  email: string;
  content: string;
  post: string;
  date: string;
  status: "approved" | "pending" | "spam";
}

export const comments: Comment[] = [
  { id: 1, author: "John Smith", avatar: "JS", email: "john@example.com", content: "This is an incredibly helpful guide! I've been looking for a comprehensive CSS resource like this for a while.", post: "Complete Guide to Modern CSS", date: "2026-06-04T11:30:00Z", status: "approved" },
  { id: 2, author: "Alice Johnson", avatar: "AJ", email: "alice@example.com", content: "Could you cover CSS Container Queries in more detail? They're becoming really important for component-based design.", post: "Complete Guide to Modern CSS", date: "2026-06-04T10:15:00Z", status: "approved" },
  { id: 3, author: "Bob Williams", avatar: "BW", email: "bob@example.com", content: "Great article! One question though — how do Server Components handle state management differently?", post: "React Server Components Deep Dive", date: "2026-06-03T16:45:00Z", status: "pending" },
  { id: 4, author: "Carol Davis", avatar: "CD", email: "carol@example.com", content: "The API rate limiting section was super useful. Implementing it in our production service right now.", post: "Building Scalable APIs with Node.js", date: "2026-06-03T14:20:00Z", status: "approved" },
  { id: 5, author: "SpamBot3000", avatar: "SB", email: "spam@badsite.com", content: "Check out our amazing deals at cheap-pills-online.com! Best prices guaranteed!!!", post: "TypeScript Tips and Tricks", date: "2026-06-03T12:00:00Z", status: "spam" },
  { id: 6, author: "Eve Martinez", avatar: "EM", email: "eve@example.com", content: "Would love to see a follow-up article on Core Web Vitals specifically for SPAs.", post: "Web Performance Optimization", date: "2026-06-02T09:30:00Z", status: "pending" },
  { id: 7, author: "Frank Lee", avatar: "FL", email: "frank@example.com", content: "The section on discriminated unions was a game changer for me. Thanks!", post: "TypeScript Tips and Tricks", date: "2026-06-01T18:00:00Z", status: "approved" },
  { id: 8, author: "Grace Kim", avatar: "GK", email: "grace@example.com", content: "This migration guide saved me hours of work. The breaking changes section was especially helpful.", post: "Tailwind CSS v4 Migration Guide", date: "2026-05-31T11:15:00Z", status: "pending" },
];

export type UserRole = "admin" | "editor" | "author" | "subscriber";
export type UserStatus = "active" | "inactive" | "suspended";

export interface User {
  id: number;
  name: string;
  avatar: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinDate: string;
  lastActive: string;
  posts: number;
}

export const users: User[] = [
  { id: 1, name: "Sarah Chen", avatar: "SC", email: "sarah@example.com", role: "admin", status: "active", joinDate: "2024-01-15", lastActive: "2026-06-04T11:30:00Z", posts: 48 },
  { id: 2, name: "James Wilson", avatar: "JW", email: "james@example.com", role: "editor", status: "active", joinDate: "2024-03-22", lastActive: "2026-06-04T10:45:00Z", posts: 35 },
  { id: 3, name: "Maria Rodriguez", avatar: "MR", email: "maria@example.com", role: "author", status: "active", joinDate: "2024-06-10", lastActive: "2026-06-03T16:20:00Z", posts: 22 },
  { id: 4, name: "David Park", avatar: "DP", email: "david@example.com", role: "editor", status: "active", joinDate: "2024-08-05", lastActive: "2026-06-04T08:15:00Z", posts: 29 },
  { id: 5, name: "Emily Brown", avatar: "EB", email: "emily@example.com", role: "author", status: "active", joinDate: "2025-01-20", lastActive: "2026-06-02T14:30:00Z", posts: 15 },
  { id: 6, name: "Alex Turner", avatar: "AT", email: "alex@example.com", role: "subscriber", status: "inactive", joinDate: "2025-04-12", lastActive: "2026-05-15T09:00:00Z", posts: 0 },
  { id: 7, name: "Lisa Wang", avatar: "LW", email: "lisa@example.com", role: "author", status: "active", joinDate: "2025-06-01", lastActive: "2026-06-04T07:45:00Z", posts: 8 },
  { id: 8, name: "Michael Scott", avatar: "MS", email: "michael@example.com", role: "subscriber", status: "suspended", joinDate: "2025-08-15", lastActive: "2026-04-20T12:00:00Z", posts: 0 },
  { id: 9, name: "Nina Patel", avatar: "NP", email: "nina@example.com", role: "editor", status: "active", joinDate: "2025-09-10", lastActive: "2026-06-03T18:30:00Z", posts: 19 },
  { id: 10, name: "Oliver Reed", avatar: "OR", email: "oliver@example.com", role: "subscriber", status: "active", joinDate: "2025-11-22", lastActive: "2026-06-01T10:15:00Z", posts: 0 },
];

export interface MenuItem {
  id: number;
  label: string;
  url: string;
  icon?: string;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  { id: 1, label: "Home", url: "/" },
  { id: 2, label: "About", url: "/about", children: [
    { id: 21, label: "Our Team", url: "/about/team" },
    { id: 22, label: "Careers", url: "/about/careers" },
  ]},
  { id: 3, label: "Services", url: "/services" },
  { id: 4, label: "Blog", url: "/blog" },
  { id: 5, label: "Contact", url: "/contact" },
];

export interface Role {
  id: number;
  name: string;
  description: string;
  usersCount: number;
  permissions: Record<string, boolean>;
}

export const roles: Role[] = [
  { id: 1, name: "Administrator", description: "Full access to all settings and content", usersCount: 2, permissions: { "manage_posts": true, "publish_posts": true, "manage_pages": true, "manage_media": true, "manage_users": true, "manage_settings": true, "manage_roles": true, "moderate_comments": true, "view_analytics": true, "manage_menus": true } },
  { id: 2, name: "Editor", description: "Can manage and publish all content", usersCount: 3, permissions: { "manage_posts": true, "publish_posts": true, "manage_pages": true, "manage_media": true, "manage_users": false, "manage_settings": false, "manage_roles": false, "moderate_comments": true, "view_analytics": true, "manage_menus": true } },
  { id: 3, name: "Author", description: "Can write and manage own posts", usersCount: 3, permissions: { "manage_posts": true, "publish_posts": false, "manage_pages": false, "manage_media": true, "manage_users": false, "manage_settings": false, "manage_roles": false, "moderate_comments": false, "view_analytics": false, "manage_menus": false } },
  { id: 4, name: "Subscriber", description: "Can read content and manage profile", usersCount: 2, permissions: { "manage_posts": false, "publish_posts": false, "manage_pages": false, "manage_media": false, "manage_users": false, "manage_settings": false, "manage_roles": false, "moderate_comments": false, "view_analytics": false, "manage_menus": false } },
];

export const permissionLabels: Record<string, string> = {
  manage_posts: "Manage Posts",
  publish_posts: "Publish Posts",
  manage_pages: "Manage Pages",
  manage_media: "Manage Media",
  manage_users: "Manage Users",
  manage_settings: "Manage Settings",
  manage_roles: "Manage Roles",
  moderate_comments: "Moderate Comments",
  view_analytics: "View Analytics",
  manage_menus: "Manage Menus",
};

export const analyticsData = {
  pageViews: trafficData,
  sources: trafficSources,
  topPages: [
    { page: "/blog/modern-css-guide", views: 24580, uniqueVisitors: 18420, bounceRate: 32, avgTime: "4:32" },
    { page: "/blog/react-server-components", views: 18320, uniqueVisitors: 14200, bounceRate: 28, avgTime: "5:15" },
    { page: "/blog/scalable-apis-nodejs", views: 15640, uniqueVisitors: 12100, bounceRate: 35, avgTime: "3:48" },
    { page: "/blog/typescript-tips", views: 12890, uniqueVisitors: 9800, bounceRate: 30, avgTime: "4:05" },
    { page: "/", views: 10250, uniqueVisitors: 8900, bounceRate: 45, avgTime: "1:22" },
    { page: "/services", views: 8100, uniqueVisitors: 6500, bounceRate: 38, avgTime: "2:45" },
  ],
  demographics: [
    { country: "United States", visitors: 42, flag: "🇺🇸" },
    { country: "United Kingdom", visitors: 18, flag: "🇬🇧" },
    { country: "Germany", visitors: 12, flag: "🇩🇪" },
    { country: "India", visitors: 10, flag: "🇮🇳" },
    { country: "Canada", visitors: 8, flag: "🇨🇦" },
    { country: "Others", visitors: 10, flag: "🌍" },
  ],
};
