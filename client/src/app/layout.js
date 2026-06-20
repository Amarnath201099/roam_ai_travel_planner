import "../app/globals.css";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "RoamAI - AI Travel Planner",
  description:
    "Generate high performance personalized travel itineraries instantly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Updated body classes to use the new light background and dark text */}
      <body className="bg-brand-bg text-brand-text antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
