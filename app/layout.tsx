import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export const metadata = {
  title: "Crypto Monitor",
  description: "Live crypto price tracking in USD and NGN",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-100 text-black">
        <Sidebar />
        <main className="flex-1 flex flex-col text-gray-950">
          <Topbar />
          <div className="p-4 overflow-y-auto text-gray-950">{children}</div>
        </main>
      </body>
    </html>
  );
}
