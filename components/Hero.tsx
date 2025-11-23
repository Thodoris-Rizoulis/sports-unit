import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="bg-linear-to-br from-background to-muted/20 py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <Image
          src="/logo.png"
          alt="Sports Unit Logo"
          width={150}
          height={60}
          className="mx-auto mb-8"
        />
        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
          Sports Unit
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
          Connect, showcase, and grow in the professional sports network. Join
          athletes, coaches, and scouts building the future of sports.
        </p>
        <Button
          size="lg"
          className="text-lg px-10 py-4 bg-primary hover:bg-primary/90 transition-colors duration-200"
        >
          Get Started
        </Button>
      </div>
    </section>
  );
}
