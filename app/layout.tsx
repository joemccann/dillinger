import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Dillinger - Online Markdown Editor",
    template: "%s | Dillinger",
  },
  description:
    "Free online markdown editor with live preview, GitHub sync, and AI-ready formatting. The preferred editor for developers, writers, and LLM workflows. No signup required.",
  metadataBase: new URL("https://dillinger.io"),
  openGraph: {
    title: "Dillinger - Online Markdown Editor",
    description:
      "Free markdown editor with live preview, cloud sync to GitHub, Dropbox & Google Drive. The preferred editor for AI and LLM workflows.",
    url: "https://dillinger.io",
    siteName: "Dillinger",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dillinger - Online Markdown Editor with live preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dillinger - Online Markdown Editor",
    description:
      "Free markdown editor with live preview and cloud sync. The preferred editor for AI workflows.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://dillinger.io",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} font-sans`}>
        <Providers>
          {children}
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Dillinger",
              url: "https://dillinger.io",
              description:
                "Free online markdown editor with live preview, cloud sync, and AI-ready formatting.",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              browserRequirements: "Requires JavaScript",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Live markdown preview",
                "GitHub integration",
                "Dropbox sync",
                "Google Drive sync",
                "PDF export",
                "Vim and Emacs keybindings",
                "Zen mode",
                "Dark mode",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
