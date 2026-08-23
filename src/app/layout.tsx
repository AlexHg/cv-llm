import type { Metadata } from "next";
import { Geist, Geist_Mono, Lato, Montserrat } from "next/font/google";
import { CopilotProvider } from "@/components/copilot-provider";
import "@copilotkit/react-core/v2/styles.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Alejandro Hernández — Agente de CV",
  description:
    "CV Cloud en español y agente conversacional del perfil profesional",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${lato.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <CopilotProvider>{children}</CopilotProvider>
      </body>
    </html>
  );
}
