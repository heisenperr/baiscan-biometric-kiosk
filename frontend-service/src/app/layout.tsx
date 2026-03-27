import type { Metadata } from "next";
import { Quicksand, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import LiveNotification from "@/components/LiveNotification";
import { cookies } from "next/headers";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BaiScan Admin Dashboard",
  description: "Modern Biometric Management Kiosk System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const hasSessionCookie = cookieStore.has('sb-has-session');

  return (
    <html
      lang="en"
      className={`${quicksand.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider initialHasSession={hasSessionCookie}>
          <SocketProvider>
            <LiveNotification />
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
