import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Web Search Agent - AI-Powered Search Assistant",
  description: "An intelligent AI assistant that searches the web in real-time to answer your questions with accurate, cited information.",
  keywords: ["AI", "web search", "assistant", "chatbot", "OpenAI", "Claude"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
