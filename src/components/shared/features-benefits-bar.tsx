import React from "react";
import { Trophy, ShieldCheck, Truck, Headphones } from "lucide-react";

export function FeaturesBenefitsBar() {
  const features = [
    {
      icon: Trophy,
      title: "High Quality",
      desc: "crafted from top materials",
    },
    {
      icon: ShieldCheck,
      title: "Warranty Protection",
      desc: "Over 2 years",
    },
    {
      icon: Truck,
      title: "Free Shipping",
      desc: "Order over 150 $",
    },
    {
      icon: Headphones,
      title: "24 / 7 Support",
      desc: "Dedicated support",
    },
  ];

  return (
    <section className="w-full bg-surface-subtle py-16 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-center">
        {features.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <div key={i} className="flex items-center gap-4">
              <Icon className="h-12 w-12 text-content-primary stroke-[1.5]" />
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-content-primary">{feat.title}</h3>
                <p className="text-sm text-content-muted font-medium">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
