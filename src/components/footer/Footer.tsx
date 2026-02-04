import logo from "../../assets/studylogo.svg";

function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#252641] to-[#1a1a2e] py-14 text-white animate-fade-in-up">
      <div className="mx-auto max-w-5xl px-4 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-4 hover-scale group">
          <img src={logo} alt="logo" className="h-10 w-auto group-hover:drop-shadow-lg transition-all duration-300" />
          <span className="h-6 w-px bg-white/30"></span>
          <p className="text-sm font-medium tracking-wide">
            Virtual Class <br className="sm:hidden" /> for Zoom
          </p>
        </div>

        {/* Title */}
        <h2 className="mt-10 text-lg font-semibold text-white/90 sm:text-xl hover:text-white transition-colors duration-300">
          Subscribe to get our Newsletter
        </h2>

        {/* Subscribe */}
        <div className="mx-auto mt-6 flex max-w-md flex-col items-center gap-4 sm:flex-row group">
          <input
            type="email"
            placeholder="Your Email"
            className="w-full rounded-full border border-white/20 bg-transparent px-6 py-3 text-sm text-white placeholder:text-white/50 outline-none transition-all duration-300 focus:border-teal-400 focus:shadow-lg focus:shadow-teal-400/30 hover:border-white/40 group-hover:border-white/40"
          />

          <button className="rounded-full bg-teal-400 px-8 py-3 text-sm font-semibold text-[#252641] transition-all duration-300 hover:bg-teal-300 hover:shadow-lg hover:shadow-teal-400/50 active:scale-95 hover-lift">
            Subscribe
          </button>
        </div>

        {/* Links */}
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
          <li className="cursor-pointer transition-all duration-300 hover:text-white hover:translate-y-[-2px] hover:drop-shadow-lg">
            Careers
          </li>
          <li className="cursor-pointer transition-all duration-300 hover:text-white hover:translate-y-[-2px] hover:drop-shadow-lg">
            Privacy Policy
          </li>
          <li className="cursor-pointer transition-all duration-300 hover:text-white hover:translate-y-[-2px] hover:drop-shadow-lg">
            Terms & Conditions
          </li>
        </ul>

        {/* Copyright */}
        <p className="mt-6 text-xs text-white/50 hover:text-white/70 transition-colors duration-300">
          © 2021 Class Technologies Inc.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
