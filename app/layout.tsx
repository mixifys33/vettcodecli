import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "VettCode CLI - Find Real Vulnerabilities",
  description: "AI-powered code analysis that finds real vulnerabilities, not just warnings. Scan your codebase instantly.",
  keywords: "security scanner, code analysis, vulnerability detection, CLI tool, static analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} font-mono antialiased`}>
        {children}
        <Toaster 
          position="top-center"
          theme="dark"
          richColors
          closeButton
          expand={false}
          duration={4000}
        />
      </body>
    </html>
  );
}
