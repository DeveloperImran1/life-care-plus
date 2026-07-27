import { HeartPulse, Brain, Bone, Baby } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const specialists = [
  {
    name: "Cardiology",
    icon: HeartPulse,
    bgColor: "bg-red-100",
    iconColor: "text-red-500",
  },
  {
    name: "Neurology",
    icon: Brain,
    bgColor: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
  {
    name: "Orthopedic",
    icon: Bone,
    bgColor: "bg-pink-100",
    iconColor: "text-pink-500",
  },
  {
    name: "Pediatric",
    icon: Baby,
    bgColor: "bg-green-100",
    iconColor: "text-green-500",
  },
];

const Specialities = () => {
  return (
    <section className="py-24 ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Our Specialist
            </h2>
            <p className="text-muted-foreground max-w-md mt-2">
              Access to medical experts across all major specialities.
            </p>
          </div>
          <Link
            href="/doctors"
            className="text-primary font-semibold hover:underline mt-4 sm:mt-0"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialists.map((specialist) => (
            <Link
              key={specialist.name}
              href={`/doctors?specialties=${specialist.name}`}
              className="block"
            >
              <Card
                className={cn(
                  "text-center transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:bg-primary hover:text-primary-foreground h-full",
                )}
              >
                <CardContent className="p-6">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4",
                      specialist.bgColor,
                    )}
                  >
                    <specialist.icon
                      className={cn(specialist.iconColor)}
                      size={32}
                    />
                  </div>
                  <h3 className="text-lg font-semibold">{specialist.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Specialities;
