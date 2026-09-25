import type { Metadata } from "next";
import "@/styles/globals.css";
import { StationProvider } from "@/context/StationContext";
import { LinkProvider } from "@/context/LinkContext";

export const metadata: Metadata = {
  title: "Antarctic Digital Twin Console",
  description: "Polar research command center for Maitri and Bharati Antarctic research stations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F7F9FB] text-[#0F1B2A] antialiased font-sans">
        <StationProvider>
          <LinkProvider>{children}</LinkProvider>
        </StationProvider>
      </body>
    </html>
  );
}
