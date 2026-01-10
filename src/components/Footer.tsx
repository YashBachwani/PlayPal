import { MapPin, Mail, Phone, Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerLinks = {
    Product: [
      { name: "Venues", href: "/venues" },
      { name: "Find Players", href: "/players" },
      { name: "Tournaments", href: "/tournaments" },
      { name: "For Turf Owners", href: "/owner-dashboard" },
    ],
    Sports: [
      { name: "Cricket", href: "/venues?sport=Cricket" },
      { name: "Football", href: "/venues?sport=Football" },
      { name: "Badminton", href: "/venues?sport=Badminton" },
      { name: "Tennis", href: "/venues?sport=Tennis" },
      { name: "Pickleball", href: "/venues?sport=Pickleball" },
    ],
    Cities: [
      { name: "Ahmedabad", href: "/venues?city=Ahmedabad" },
      { name: "Surat", href: "/venues?city=Surat" },
      { name: "Vadodara", href: "/venues?city=Vadodara" },
      { name: "Rajkot", href: "/venues?city=Rajkot" },
      { name: "Gandhinagar", href: "/venues?city=Gandhinagar" },
    ],
    Support: [
      { name: "Help Center", href: "/help" },
      { name: "Contact Us", href: "/contact" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Facebook, href: "#" },
    { icon: Youtube, href: "#" },
  ];

  return (
    <footer className="bg-foreground text-background pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="text-2xl font-bold mb-4 flex items-center">
              <span>P</span>
              <span className="text-orange-500">l</span>
              <span>ayPal</span>
            </div>
            <p className="text-background/60 text-sm mb-6 max-w-xs">
              Your one stop for sports & sport partners. Book venues, find players, and play smarter with AI.
            </p>
            <div className="space-y-2 text-sm text-background/60">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Gujarat, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>hello@playpal.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-background/60 hover:text-background transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/60">
            © 2025 PlayPal. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
