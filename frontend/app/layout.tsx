import type { Metadata } from "next";
import "@/styles/globals.css";
import { StationProvider } from "@/context/StationContext";
import { LinkProvider } from "@/context/LinkContext";
import { OperationalIntelligenceProvider } from "@/context/OperationalIntelligenceContext";

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
      <body className="bg-ops-bg text-ops-text antialiased font-sans">
        <StationProvider>
          <OperationalIntelligenceProvider>
            <LinkProvider>{children}</LinkProvider>
          </OperationalIntelligenceProvider>
        </StationProvider>
      </body>
    </html>
  );
}
