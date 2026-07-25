import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Building2, Globe, HandHeart, Heart, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-static";

const NGOsPage = () => {
  const ngoCategories = [
    { icon: Heart, title: "Health & Wellness", desc: "Organizations providing free medical camps and health education", count: "25+ NGOs" },
    { icon: HandHeart, title: "Patient Support", desc: "Financial aid and support for critical patients", count: "15+ NGOs" },
    { icon: Users, title: "Community Health", desc: "Grassroots healthcare initiatives in underserved areas", count: "30+ NGOs" },
    { icon: Building2, title: "Medical Facilities", desc: "Free clinics and community hospitals", count: "20+ Orgs" },
    { icon: Award, title: "Medical Research", desc: "Organizations funding medical research and innovation", count: "10+ Inst." },
    { icon: Globe, title: "International Aid", desc: "Global health organizations working in the country", count: "12+ NGOs" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-emerald-900 text-emerald-50 py-20 lg:py-28 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#10b981 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-4 py-1 text-sm">
              Community Partner Network
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white">
              Uniting for Better <br />
              <span className="text-emerald-400">Healthcare Access.</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-100 max-w-2xl mx-auto">
              Connect with healthcare NGOs providing free or subsidized medical services. 
              Together, we are making quality healthcare accessible for everyone.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8">
                Find an NGO
              </Button>
              <Button size="lg" variant="outline" className="text-emerald-900 rounded-full px-8 bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white">
                Partner With Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="container mx-auto px-4 -mt-10 relative z-20">
        <Card className="shadow-xl border-none">
          <CardContent className="p-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-1">112+</div>
              <div className="text-sm text-slate-500 font-medium">Partner NGOs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-1">50k+</div>
              <div className="text-sm text-slate-500 font-medium">Lives Impacted</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-1">200+</div>
              <div className="text-sm text-slate-500 font-medium">Free Clinics</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-1">64</div>
              <div className="text-sm text-slate-500 font-medium">Districts Covered</div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Areas of Impact</h2>
              <p className="text-slate-500 max-w-lg">Discover organizations working across different sectors of healthcare to bring positive change.</p>
            </div>
            <Button variant="link" className="text-emerald-600 font-semibold p-0">
              View Directory <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ngoCategories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Card key={idx} className="group hover:border-emerald-500 transition-colors bg-white">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Icon className="w-7 h-7" />
                      </div>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600">{cat.count}</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{cat.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{cat.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partner Call to Action */}
      <section className="container mx-auto px-4 pb-20">
        <div className="bg-emerald-50 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold text-emerald-950">Are you a healthcare NGO?</h2>
            <p className="text-emerald-800/80 text-lg max-w-md">
              Register your organization on our platform to reach more people in need, 
              receive donations, and amplify your impact across the country.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-emerald-900 font-medium">
                <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700 text-xs">✓</div>
                Verified Platform Presence
              </li>
              <li className="flex items-center gap-3 text-emerald-900 font-medium">
                <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700 text-xs">✓</div>
                Connect with Volunteers
              </li>
              <li className="flex items-center gap-3 text-emerald-900 font-medium">
                <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700 text-xs">✓</div>
                Direct Patient Referrals
              </li>
            </ul>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white mt-4">
              Apply for Partnership
            </Button>
          </div>
          
          <div className="flex-1 w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">NGO Portal</h3>
            <p className="text-slate-500 mb-6 text-sm">Our full directory and portal features are currently under development.</p>
            <Link href="/">
              <Button variant="outline" className="w-full">Return to Home</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NGOsPage;
