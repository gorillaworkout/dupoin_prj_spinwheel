import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WheelProvider } from "@/context/WheelContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Custom Spinwheel",
  description: "Fully customizable spinwheel with weighted probabilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} antialiased`}>
        <WheelProvider>
          {children}
        </WheelProvider>
      </body>
    </html>
  );
}
