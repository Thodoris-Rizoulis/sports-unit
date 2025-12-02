import {
  UserGroupIcon,
  TrophyIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

export function Features() {
  const features = [
    {
      icon: UserGroupIcon,
      title: "Connect with Professionals",
      description:
        "Network with athletes, coaches, and scouts from around the world. Build meaningful relationships in the sports industry.",
    },
    {
      icon: TrophyIcon,
      title: "Showcase Your Achievements",
      description:
        "Highlight your skills, awards, and career milestones. Create a professional profile that stands out.",
    },
    {
      icon: GlobeAltIcon,
      title: "Build Your Network",
      description:
        "Expand your professional connections in the sports industry. Discover opportunities and collaborate globally.",
    },
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16 leading-tight">
          Why Choose Sports Unit?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card p-8 rounded-xl border border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group"
            >
              <feature.icon className="w-14 h-14 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
