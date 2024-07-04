import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "./../lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "../components/ui/toaster";

const IBMPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
  title: "Imaginify - Make Your Imaginations Real!",
  description: "Make Your Image More Clear, Remove Backgrounds and More!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={cn("font-IBMPlex antialiased", IBMPlex.variable)}>
          <main>
            {children}
          </main>
          <Toaster/>
        </body>
      </html>
    </ClerkProvider>
  );
}
