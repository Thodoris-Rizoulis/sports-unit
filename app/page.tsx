import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="bg-background min-h-screen">
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
