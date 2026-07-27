import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  Bone,
  Brain,
  FileText,
  Heart,
  Microscope,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-static";

const DiagnosticsPage = () => {
  const services = [
    {
      icon: Activity,
      title: "Blood Tests",
      description: "Complete blood count, lipid profile, diabetes screening",
      tests: "50+ tests available",
    },
    {
      icon: Heart,
      title: "Cardiac Tests",
      description: "ECG, Echo, stress tests, and cardiac markers",
      tests: "15+ tests available",
    },
    {
      icon: Brain,
      title: "Imaging",
      description: "X-Ray, MRI, CT Scan, Ultrasound",
      tests: "20+ tests available",
    },
    {
      icon: Microscope,
      title: "Pathology",
      description: "Urine, stool, culture tests, and biopsies",
      tests: "40+ tests available",
    },
    {
      icon: Bone,
      title: "Radiology",
      description: "Bone density, mammography, specialized imaging",
      tests: "10+ tests available",
    },
    {
      icon: FileText,
      title: "Health Packages",
      description: "Comprehensive health checkup packages",
      tests: "8+ packages",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      {/* Header Section */}
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" variant="outline">
          Coming Soon
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
          Reliable <span className="text-primary">Diagnostic Services</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Book diagnostic tests online and get reports delivered digitally.
          Trusted labs, accurate results, and home sample collection.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <Card key={index} className="hover:shadow-lg hover:border-primary/50 transition-all group">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription className="pt-2">{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="bg-slate-100">{service.tests}</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Why Choose Us */}
      <Card className="bg-primary/5 border-primary/20 mb-16 overflow-hidden">
        <CardContent className="p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center text-slate-900">
              Why Choose Our Diagnostic Services?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4 items-start">
                <div className="shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-slate-900">Accredited Labs</h3>
                  <p className="text-muted-foreground">
                    Partner labs certified by national and international bodies ensuring 100% accurate results.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-slate-900">Home Sample Collection</h3>
                  <p className="text-muted-foreground">
                    Trained phlebotomists collect samples from your home safely and hygienically.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-slate-900">Digital Reports</h3>
                  <p className="text-muted-foreground">
                    Access your reports online anytime, anywhere through our secure patient portal.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-slate-900">Affordable Pricing</h3>
                  <p className="text-muted-foreground">
                    Competitive rates with special discounts on comprehensive health packages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <div className="text-center pb-8">
        <Card className="inline-block max-w-2xl border-none shadow-xl">
          <CardContent className="p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900">Platform Coming Soon</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              We are partnering with top diagnostic labs to bring you the best
              testing services. Stay tuned!
            </p>
            <Link href="/">
              <Button size="lg" className="px-8 rounded-full font-semibold">
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiagnosticsPage;
