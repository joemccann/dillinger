import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
});

export const metadata: Metadata = {
  title: "Dillinger - Online Markdown Editor",
  description: "The last Markdown editor you'll ever need",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} font-sans`}>
        <StoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
