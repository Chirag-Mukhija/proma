"use client";
import Link from "next/link"
import React, { useEffect, useState } from "react";
import { WavyBackground } from "@/components/ui/wavy-background";
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { ArrowRight, Boxes, Users, Zap, Shield } from "lucide-react"
import { useTheme } from "next-themes";

export default function LandingPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <WavyBackground backgroundFill={resolvedTheme === "light" ? "white" : "black"}>
        <section className="relative overflow-hidden pt-32 pb-20 px-6">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-chart-2/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
              Streamline Your <span className="text-primary">Vision</span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              {
                "Collaborate seamlessly, manage projects efficiently, and turn ideas into reality with Proma—your modern enterprise project management solution."
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button asChild size="lg" className="text-lg px-8 h-12">
                <Link href="/dashboard">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 h-12 bg-transparent">
                <Link href="/auth">Continue with Google</Link>
              </Button>
            </div>
          </div>
        </section>

      </WavyBackground>


      {/* Features Section */}
      <section className="px-6 py-20 bg-accent/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-balance">
            Everything you need to succeed
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Boxes, title: "Project Tiles", desc: "Visual dashboard with interactive project cards" },
              { icon: Users, title: "Team Collaboration", desc: "Real-time chat and seamless communication" },
              { icon: Zap, title: "Fast & Efficient", desc: "Built for speed and productivity" },
              { icon: Shield, title: "Secure & Private", desc: "Enterprise-grade security built-in" },
            ].map((feature, idx) => (
              <div key={idx} className="glass-effect rounded-xl p-6 space-y-3 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 Proma. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
