import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel - VALORIA SMP",
  description: "Panel Administrasi VALORIA SMP",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        background: "#0a0a1a",
        color: "white",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}
