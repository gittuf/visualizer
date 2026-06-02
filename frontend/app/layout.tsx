import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Gittuf Visualizer",
  description:
    "Visualize and analyze gittuf's security metadata structure across repository commits",
  generator: "v0.dev",
  applicationName: "Gittuf Visualizer",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
