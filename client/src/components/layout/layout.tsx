import { ReactNode } from "react";
import Header from "./header";
import Footer from "./footer";
import MobileNav from "./mobile-nav";
import MascotGuide from "@/components/mascot-guide";
import MascotSettings from "@/components/mascot-settings";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50 pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <MascotGuide />
      <MascotSettings />
    </div>
  );
}
