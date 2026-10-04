import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { EnvProvider } from "@/lib/env/EnvContext";
import { ThemeProvider } from "@/lib/theme/ThemeContext";

const THEME_INIT_SCRIPT = `try{var m=localStorage.getItem("ep-color-mode");if(m==="dark")document.documentElement.dataset.theme="dark";}catch(e){}`;

/** Industry / Console v4: Barlow body, Barlow Condensed headings, IBM Plex Mono. */
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ElementPay Console",
  description: "Manage transactions, Off-ramp, and integrations for ElementPay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${barlowCondensed.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <style
          dangerouslySetInnerHTML={{
            __html: `
:root {
  --font-heading: "D-DIN-Bold", "D-DIN", var(--font-barlow-condensed), "Barlow Condensed", var(--font-barlow), "Barlow", sans-serif;
  --font-body: "D-DIN", var(--font-barlow), "Barlow", system-ui, sans-serif;
}
`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <EnvProvider>{children}</EnvProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
