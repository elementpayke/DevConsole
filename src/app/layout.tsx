import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { EnvProvider } from "@/lib/env/EnvContext";
import { ThemeProvider } from "@/lib/theme/ThemeContext";

const THEME_INIT_SCRIPT = `try{var m=localStorage.getItem("ep-color-mode");if(m==="dark")document.documentElement.dataset.theme="dark";}catch(e){}`;

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
      className={`${manrope.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
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
