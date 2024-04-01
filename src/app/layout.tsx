import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
// import { SpeedInsights } from "@vercel/speed-insights/next";
// import { Analytics } from "@vercel/analytics/react";
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
        {/* <SpeedInsights />
        <Analytics /> */}
      </body>

      {/* https://github.com/primefaces/primereact/issues/5187#issuecomment-1795848676 */}
      <Script
        id="primereact-css-patch"
        dangerouslySetInnerHTML={{
          __html: `
            var style = document.createElement('style');
            style.innerHTML = '@layer tailwind-base, primereact, tailwind-utilities;';
            style.setAttribute('type', 'text/css');
            document.querySelector('head').prepend(style);
          `,
        }}
      />
    </html>
  );
}
