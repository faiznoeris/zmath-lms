import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZMATH - Zona Matematika",
  description:
    "Platform pembelajaran matematika dengan fokus pada Barisan dan Deret Aritmatika dan Geometri",
  keywords: "matematika, pembelajaran, barisan, deret, aritmatika, geometri",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
      </head>
      <body className={plusJakartaSans.className}>{children}</body>
    </html>
  );
}
