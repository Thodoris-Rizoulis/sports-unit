"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginRegisterModal } from "@/components/landing/LoginRegisterModal";

export function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div
            style={{ width: 200, height: 80, position: "relative" }}
            className="mx-auto mb-8"
          >
            <Image
              src="/logo.png"
              alt="Sports Unit Logo"
              fill
              sizes="200px"
              style={{ objectFit: "contain" }}
            />
          </div>
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
            onClick={() => setIsModalOpen(true)}
          >
            Get Started
          </Button>
        </div>
      </section>
      <LoginRegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
