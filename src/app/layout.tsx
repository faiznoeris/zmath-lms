import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { Header, LoadingBar } from "../components";
import MuiThemeProvider from "../components/MuiThemeProvider";
import ClientProviders from "../components/ClientProviders";

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
      <body className={plusJakartaSans.className}>
        <ClientProviders>
          <MuiThemeProvider>
            <LoadingBar />
            <Header />
            <main>{children}</main>
          </MuiThemeProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
