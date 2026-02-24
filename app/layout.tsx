import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Nav from "@/components/layout/Nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ROIP - RAG Operations Intelligence Platform",
  description:
    "Enterprise RAG troubleshooting demo built with Next.js, OpenAI Responses API, Pinecone, and Upstash Redis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-bg text-fg antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Nav />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
