function OurSuccess() {
    const stats = [
        { name: "Students", value: "15K" },
        { name: "Total Success", value: "75%" },
        { name: "Main questions", value: "35" },
        { name: "Chief experts", value: "26" },
        { name: "Years of experience", value: "16" }
    ]
  return (
    <section className="py-16 bg-gradient-to-b from-white to-cyan-50 animate-fade-in-up">
      <div className="mx-auto max-w-7xl text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Our Success
        </h2>

        <p className="mt-4 max-w-2xl mx-auto text-gray-500 text-sm md:text-base leading-relaxed">
          Ornare id fames interdum porttitor nulla turpis etiam. Diam vitae
          sollicitudin at nec nam et pharetra gravida. Adipiscing a quis ultrices
          eu ornare tristique vel nisl orci.
        </p>

        <div className="mt-16 flex flex-wrap justify-center gap-20">
            {stats.map((item, i) => (
                <div key={i} className="text-center hover-lift group cursor-pointer transition-all duration-300 p-4 rounded-lg hover:bg-white/50">
                <h3 className="
                    text-[48px] sm:text-[64px] lg:text-[70px]
                    leading-none whitespace-nowrap
                    font-semibold
                    bg-gradient-to-r from-[#136CB5] to-[#49BBBD]
                    bg-clip-text text-transparent
                    group-hover:scale-110 transition-transform duration-300
                ">
                    {item.value}
                </h3>
                <p className="mt-3 text-gray-600 tex-[32px] group-hover:text-[#49BBBD] transition-colors duration-300">{item.name}</p>
                </div>
            ))}
            </div>

      </div>
    </section>
  );
}

export default OurSuccess;
