import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PrimeReactProvider } from "primereact/api";

import "./globals.css";

import "primereact/resources/themes/nano/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CompoKit",
  description: "a set of tools for music composer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className={inter.className}>
        <PrimeReactProvider>{children}</PrimeReactProvider>
      </body>
    </html>
  );
}
