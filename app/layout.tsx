import type { Metadata } from "next";
import { Barlow_Condensed, Big_Shoulders, Space_Mono } from "next/font/google";
import "./globals.css";

// Google renombró/fusionó "Big Shoulders Display" dentro de la familia
// variable "Big Shoulders" (ver Documentation/PLAN_DESARROLLO.md).
const bigShoulders = Big_Shoulders({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Club Atlético Los Chasquis",
  description:
    "Calendario de eventos atléticos del Club Atlético Los Chasquis (Tunja, Boyacá): carreras de calle y pruebas de pista y campo. Consulta la información y regístrate en línea.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${bigShoulders.variable} ${barlowCondensed.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-crema text-casi-negro font-body">
        {children}
      </body>
    </html>
  );
}
