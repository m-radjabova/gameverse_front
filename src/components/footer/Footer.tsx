import { useState } from "react";
import {
  FaBookOpen,
  FaCalendarAlt,
  FaEnvelope,
  FaFacebookF,
  FaGamepad,
  FaGraduationCap,
  FaHeart,
  FaInstagram,
  FaRocket,
  FaTwitter,
  FaUsers,
  FaYoutube,
} from "react-icons/fa";
import { GiCherry, GiFlowerTwirl, GiTwirlyFlower } from "react-icons/gi";
import { HiSparkles } from "react-icons/hi";

function Footer({ isDark = false }: { isDark?: boolean }) {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  const quickLinks = [
    { label: "Bosh sahifa", href: "/", icon: FaBookOpen },
    { label: "O'yinlar", href: "/games", icon: FaGamepad },
    { label: "Darslar", href: "/lessons", icon: FaGraduationCap },
    { label: "Tadbirlar", href: "/events", icon: FaCalendarAlt },
    { label: "Blog", href: "/blog", icon: FaRocket },
    { label: "Aloqa", href: "/contact", icon: FaEnvelope },
  ];

  const socialLinks = [
    { icon: FaFacebookF, label: "facebook", color: "#1877F2" },
    { icon: FaTwitter, label: "twitter", color: "#1DA1F2" },
    { icon: FaYoutube, label: "youtube", color: "#FF0000" },
    { icon: FaInstagram, label: "instagram", color: "#E4405F" },
  ];

  const categories = [
    { label: "Baamboozle", count: 12, color: "from-[#ffd66f] to-[#ffbc58]" },
    { label: "Treasure Hunt", count: 8, color: "from-[#79d2ef] to-[#4aaee0]" },
    { label: "Jumanji", count: 15, color: "from-[#7ed8f4] to-[#4aaee0]" },
    { label: "Quiz Games", count: 10, color: "from-[#ffd76d] to-[#59b9e6]" },
  ];

  return (
    <footer
      className={`relative overflow-hidden pb-8 pt-16 ${
        isDark
          ? "bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#131a2d]"
          : "bg-gradient-to-br from-[#fffef9] via-[#f7fcff] to-[#fff6eb]"
      }`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute left-[5%] top-[20%] h-72 w-72 rounded-full blur-3xl animate-float-soft ${isDark ? "bg-[#ff6b8a]/10" : "bg-[#cfeeff]/35"}`} />
        <div className={`absolute right-[8%] bottom-[30%] h-80 w-80 rounded-full blur-3xl animate-float-slow ${isDark ? "bg-[#1e1e2f]" : "bg-[#ffe7b6]/22"}`} />

        <GiCherry className={`absolute left-[10%] top-[15%] text-5xl animate-petal-float ${isDark ? "text-[#ff6b8a]/10" : "text-[#78cfee]/14"}`} />
        <GiFlowerTwirl className={`absolute right-[12%] bottom-[20%] text-6xl animate-float-soft ${isDark ? "text-[#a1a1aa]/10" : "text-[#59b9e6]/12"}`} />
        <GiTwirlyFlower className={`absolute left-[20%] bottom-[10%] text-4xl animate-spin-slow ${isDark ? "text-[#ff6b8a]/10" : "text-[#ffd15d]/16"}`} />

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${isDark ? "#ff6b8a" : "#78cfee"} 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-6 lg:col-span-5" data-aos="fade-right" data-aos-delay="80">
            <div className="space-y-3">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 shadow-sm backdrop-blur-sm ${
                  isDark ? "border-[#ff6b8a]/18 bg-[#1e1e2f]/80" : "border-[#d8eef7] bg-white/84"
                }`}
              >
                <HiSparkles className="animate-pulse-soft text-sm text-[#59b9e6]" />
                <span className={`text-[10px] font-medium uppercase tracking-[0.2em] ${isDark ? "text-[#a1a1aa]" : "text-[#59b9e6]"}`}>
                  Bilim maskani
                </span>
              </div>

              <h2 className="text-4xl font-light leading-tight sm:text-5xl">
                <span className={isDark ? "text-[#f1f1f1]" : "text-[#203572]"}>Kelajak</span>
                <span className="block bg-gradient-to-r from-[#59b9e6] to-[#ffd66f] bg-clip-text font-medium text-transparent">
                  ta'limi bilan
                </span>
              </h2>

              <p className={`max-w-md text-sm leading-relaxed ${isDark ? "text-[#a1a1aa]" : "text-[#6d7aa6]"}`}>
                Interaktiv o'yinlar, qiziqarli darslar va zamonaviy yondashuv.
                O'qituvchilar va o'quvchilar uchun mukammal platforma.
              </p>
            </div>

            <div className="flex items-center gap-4 pt-3">
              {[
                { value: "50+", label: "O'yinlar", icon: FaGamepad },
                { value: "10K", label: "O'quvchilar", icon: FaUsers },
                { value: "24/7", label: "Qo'llab-quvvatlash", icon: FaHeart },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${isDark ? "border-[#2b3146] bg-[#1e1e2f]" : "border-[#d8eef7] bg-white/80"}`}>
                    <stat.icon className="text-xs text-[#59b9e6]" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isDark ? "text-[#f1f1f1]" : "text-[#203572]"}`}>{stat.value}</p>
                    <p className={`text-[8px] font-medium ${isDark ? "text-[#a1a1aa]" : "text-[#6d7aa6]"}`}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:col-span-7" data-aos="fade-left" data-aos-delay="140">
            <div className="space-y-4">
              <h3 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#f1f1f1]" : "text-[#203572]"}`}>
                <span className="h-px w-6 bg-gradient-to-r from-[#59b9e6] to-transparent" />
                Tezkor havolalar
              </h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className={`group flex items-center gap-2 text-xs transition-colors ${isDark ? "text-[#a1a1aa] hover:text-[#ff6b8a]" : "text-[#6d7aa6] hover:text-[#59b9e6]"}`}
                    >
                      <link.icon className="text-[10px] opacity-60 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#f1f1f1]" : "text-[#203572]"}`}>
                <span className="h-px w-6 bg-gradient-to-r from-[#59b9e6] to-transparent" />
                Kategoriyalar
              </h3>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.label}>
                    <a
                      href="#"
                      className={`group flex items-center justify-between text-xs transition-colors ${isDark ? "text-[#a1a1aa] hover:text-[#ff6b8a]" : "text-[#6d7aa6] hover:text-[#59b9e6]"}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${cat.color}`} />
                        {cat.label}
                      </span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${isDark ? "bg-[#1e1e2f]" : "bg-white/70 text-[#203572]"}`}>
                        {cat.count}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div data-aos="fade-up" data-aos-delay="200" className={`mt-12 border-t pt-6 ${isDark ? "border-[#2b3146]" : "border-[#d8eef7]"}`}>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className={`order-2 text-[10px] sm:order-1 ${isDark ? "text-[#a1a1aa]" : "text-[#7b86ae]"}`}>
              © {new Date().getFullYear()} Bilim. Barcha huquqlar himoyalangan.
              <span className="mx-2 opacity-30">|</span>
              <a href="#" className="transition-colors hover:text-[#59b9e6]">Maxfiylik siyosati</a>
              <span className="mx-2 opacity-30">|</span>
              <a href="#" className="transition-colors hover:text-[#59b9e6]">Foydalanish shartlari</a>
            </p>

            <div className="order-1 flex items-center gap-2 sm:order-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="group relative"
                  onMouseEnter={() => setHoveredSocial(social.label)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  aria-label={social.label}
                >
                  <div className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-all hover:-translate-y-1 ${isDark ? "border-[#2b3146] bg-[#1e1e2f] hover:bg-[#25253a]" : "border-[#d8eef7] bg-white/80 hover:bg-white"}`}>
                    <social.icon
                      className="text-xs transition-colors"
                      style={{
                        color:
                          hoveredSocial === social.label ? social.color : isDark ? "#a1a1aa" : "#7b86ae",
                      }}
                    />
                  </div>
                  <span className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-medium opacity-0 transition-opacity group-hover:opacity-100 ${isDark ? "text-[#a1a1aa]" : "text-[#6d7aa6]"}`}>
                    {social.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1">
            <span className={`text-[8px] ${isDark ? "text-[#a1a1aa]" : "text-[#7b86ae]"}`}>Made with</span>
            <FaHeart className="animate-pulse-soft text-[10px] text-[#59b9e6]" />
            <span className={`text-[8px] ${isDark ? "text-[#a1a1aa]" : "text-[#7b86ae]"}`}>for teachers</span>
          </div>
        </div>
      </div>

      <svg
        className="pointer-events-none absolute bottom-0 right-0 w-[400px] opacity-20 lg:w-[600px]"
        viewBox="0 0 600 200"
        fill="none"
      >
        <path
          d="M0 150C100 120 200 100 300 90C400 80 500 70 600 60"
          stroke={isDark ? "#ff6b8a" : "#59b9e6"}
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <path
          d="M0 170C120 140 240 120 360 110C480 100 600 90 600 90"
          stroke={isDark ? "#a1a1aa" : "#78cfee"}
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.6"
        />
      </svg>
    </footer>
  );
}

export default Footer;
