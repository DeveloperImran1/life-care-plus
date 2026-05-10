import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import logo from "@/assets/logos/navlog.png";

function PublicFooter() {
  return (
    <footer className="pt-14 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Logo and About */}
          <div className="space-y-5">
            <Image
              src={logo}
              alt="LifeCare+ Logo"
              width={160}
              height={45}
              className="object-contain"
            />
            <p className="text-gray-500 text-[14px] leading-relaxed max-w-[270px]">
              Your health is our priority. We are here to provide the best
              medical services.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-white border border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
                >
                  <Icon size={16} strokeWidth={2} />
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:pl-6">
            <h3 className="font-bold text-gray-900 mb-5 text-[16px]">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {["Home", "About Us", "Services", "Doctors", "Contact"].map(
                (link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-gray-500 hover:text-emerald-600 text-[14px] font-medium transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="font-bold text-gray-900 mb-5 text-[16px]">
              Support
            </h3>
            <ul className="space-y-3">
              {["FAQ", "Help Center", "Terms of Service", "Privacy Policy"].map(
                (link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-gray-500 hover:text-emerald-600 text-[14px] font-medium transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h3 className="font-bold text-gray-900 mb-5 text-[16px]">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <MapPin
                    className="text-emerald-500"
                    size={15}
                    strokeWidth={2}
                  />
                </div>
                <div className="pt-0.5">
                  <p className="text-gray-500 text-[14px] leading-snug">
                    123 Medical Lane <br /> Health City, HC 12345
                  </p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <Mail
                    className="text-emerald-500"
                    size={15}
                    strokeWidth={2}
                  />
                </div>
                <p className="text-gray-500 text-[14px]">
                  contact@lifecare.com
                </p>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <Phone
                    className="text-emerald-500"
                    size={15}
                    strokeWidth={2}
                  />
                </div>
                <p className="text-gray-500 text-[14px]">+1 234 567 8900</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="relative overflow-hidden py-4"
        style={{ backgroundColor: "#0A5C4A" }}
      >
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center">
          <p className="text-white text-[13px] font-medium tracking-wide">
            &copy; {new Date().getFullYear()} LifeCare+. All Rights Reserved.
          </p>
        </div>

        {/* Decorative ECG Line */}
        {/* <div className="absolute right-0 top-0 bottom-0 w-[45%] md:w-[30%] flex items-center justify-end pointer-events-none">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 40"
            preserveAspectRatio="xMaxYMid meet"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="ecgGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="25%" stopColor="white" stopOpacity="0.3" />
                <stop offset="100%" stopColor="white" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path
              d="M0 20 H150 L165 5 L180 35 L195 20 H400"
              stroke="url(#ecgGradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div> */}
      </div>
    </footer>
  );
}

export default PublicFooter;
