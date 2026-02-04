import rightImg from "../../assets/tools.svg";

function Tools() {
  return (
    <section className="bg-gradient-to-br from-white to-cyan-50 py-20 animate-fade-in-up">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
          
          {/* LEFT CONTENT */}
          <div className="animate-slide-in-left">
            <h2 className="text-[40px] sm:text-[32px] md:text-[36px] font-bold leading-tight text-[#2F327D] hover:text-teal-600 transition-colors duration-300">
              <span className="text-[#49BBBD] relative">Tools
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-cyan-300 scale-x-0 hover:scale-x-100 transition-transform duration-300"></span>
              </span> For Teachers
              <br />
              And Learners
            </h2>

            <p className="mt-6 max-w-md text-[22px] sm:text-[17px] leading-[28px] text-[#696984] hover:text-[#2F327D] transition-colors duration-300">
              Class has a dynamic set of teaching tools built to be deployed and
              used during class. Teachers can handout assignments in real-time
              for students to complete and submit.
            </p>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative flex justify-center lg:justify-end animate-slide-in-right">
            <img
              src={rightImg}
              alt="tools"
              className="w-full max-w-[520px] hover:drop-shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer"
            />
          </div>

        </div>
      </div>
    </section>
  );
}

export default Tools;
