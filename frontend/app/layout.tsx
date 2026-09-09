import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import VideoBackground from "@/components/VideoBackground";

export const metadata = {
  title: "Reset Path — GitHub CV Rebuilder & Interview AI",
  description:
    "Rebuild your CV for any company using your real GitHub projects. Get tailored project suggestions, tech stack match scores, and interview preparation powered by Reset Path AI.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased relative">
        <ThemeProvider>
          {/* Full-screen video background — clearly visible and responsive to theme */}
          <VideoBackground />

          {/* Ambient glow orbs */}
          <div
            className="fixed top-0 left-1/4 -z-10 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-colors duration-1000"
            style={{ background: "var(--glow-top)" }}
          />
          <div
            className="fixed bottom-0 right-1/4 -z-10 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-colors duration-1000"
            style={{ background: "var(--glow-bottom)" }}
          />

          <Navbar />
          <main className="min-h-[calc(100vh-65px)]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
