import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-heading" });

import { AdminLayout } from "@/shared/components/layout/AdminLayout";

export const metadata: Metadata = {
  title: "GastroWise Admin Dashboard",
  description: "Quản trị hệ thống GastroWise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${inter.variable} ${plusJakarta.variable} antialiased bg-slate-50 text-slate-900`}
      >
        <AdminLayout>
          {children}
        </AdminLayout>
      </body>
    </html>
  );
}
