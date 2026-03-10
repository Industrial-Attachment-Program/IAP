import type { Metadata } from "next";
import { Outfit, Jost } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "IAP Management System",
  description: "Industrial Attachment Program",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${jost.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}



