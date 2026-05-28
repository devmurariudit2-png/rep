import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/context/theme-context";
import { MockDbProvider } from "@/lib/context/mock-db-context";
import { AiChatFloating } from "@/components/chat/ai-chat-floating";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "REOP - AI operating system for Modern Real Estate in India",
  description: "The premium AI powered operating system for real estate brokers, builders and wealth agencies. Showcase luxury properties, score leads with AI, and automate WhatsApp dialogues.",
  keywords: "real estate platform, GIFT city property, luxury villas Ahmedabad, real estate AI agent, lead scoring real estate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <MockDbProvider>
          <ThemeProvider>
            {children}
            <AiChatFloating />
          </ThemeProvider>
        </MockDbProvider>
      </body>
    </html>
  );
}
