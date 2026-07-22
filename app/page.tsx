"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import InstallSection from "@/components/InstallSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import HowItWorks from "@/components/HowItWorks";
import LiveReportPreview from "@/components/LiveReportPreview";
import WhyVettCode from "@/components/WhyVettCode";
import CLIOutputPreview from "@/components/CLIOutputPreview";
import ShareableReports from "@/components/ShareableReports";
import ReportsList from "@/components/ReportsList";
import Footer from "@/components/Footer";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-darker text-white">
      <div className="grid-background">
        <Navbar />
        <HeroSection />
        <InstallSection />
        <FeaturesGrid />
        <HowItWorks />
        <LiveReportPreview />
        <WhyVettCode />
        <CLIOutputPreview />
        <ShareableReports />
        <ReportsList />
        <Footer />
      </div>
    </main>
  );
}
