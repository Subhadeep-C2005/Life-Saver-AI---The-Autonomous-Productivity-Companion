import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Last-Minute Life Saver | AI Productivity Companion",
  description:
    "An AI-powered productivity companion that helps you tackle urgent tasks, manage priorities, and stay on top of your day — even when time is running out.",
  keywords: ["productivity", "AI assistant", "task management", "hackathon", "focus"],
  authors: [{ name: "The Last-Minute Life Saver Team" }],
  openGraph: {
    title: "The Last-Minute Life Saver",
    description: "AI-powered productivity when you need it most.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'system';
                  var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.remove('light-theme');
                    document.documentElement.classList.add('dark-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark-theme', 'dark');
                    document.documentElement.classList.add('light-theme');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
