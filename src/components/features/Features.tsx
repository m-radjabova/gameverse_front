
// import whiteBg from "../../assets/Group 67.svg";
import eveny from "../../assets/eveny.svg";
import tamara from "../../assets/tamara.svg";
import humbert from "../../assets/humbert.svg";
import adam from "../../assets/adam.svg";
import patrica from "../../assets/patrica.svg";

import icon1 from "../../assets/Group 72.svg";
import icon2 from "../../assets/Group 73.svg";
import icon3 from "../../assets/users 2.svg";

function Features() {
  return (
    <section className="bg-gradient-to-b from-white via-cyan-50 to-white py-16 font-sans overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        {/* Sarlavha qismi */}
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2F327D]">
            Our <span className="text-[#49BBBD] relative">Features
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent"></span>
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-[#696984]">
            This very extraordinary feature, can make learning activities more efficient
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16 lg:gap-24">
          
          {/* CHAP TOMON: Mock UI Layout */}
          <div className="relative animate-slide-in-left">
            {/* Orqa fondagi dekorativ shakllar */}
            <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#33EFA0] opacity-60 blur-[2px] animate-float" />
            <div className="absolute left-20 top-2 h-5 w-5 rounded-full bg-[#29B9E7] animate-pulse-slow" />
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-[#5B72EE] opacity-50 blur-[40px]" />
            <div className="absolute bottom-4 left-[45%] h-4 w-4 rounded-full bg-[#F2545B] animate-bounce-light" />

            {/* Asosiy Oyna (White Frame) */}
            <div className="relative z-10 bg-[#F4F7F7] rounded-[40px] shadow-2xl p-6 min-h-[400px] border border-gray-100 hover-lift hover:shadow-3xl transition-all duration-500">
              {/* Browser Dots */}
              <div className="flex gap-2 mb-8">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] hover:scale-125 transition-transform" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:scale-125 transition-transform" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F] hover:scale-125 transition-transform" />
              </div>

              <div className="relative h-[300px] md:h-[350px]">
                {/* 1. Eveny Howard (Katta rasm chapda) */}
                <div className="absolute left-0 top-10 w-[45%] z-20 group hover:z-50 transition-all duration-300">
                  <img src={eveny} alt="Instructor" className="w-full rounded-2xl shadow-lg object-cover aspect-[4/3] hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer" />
                  <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <span className="bg-blue-500 p-0.5 rounded-sm">📊</span> Instructor: Eveny Howard
                  </div>
                </div>

                {/* 2. Tamara Clarke (O'rtada yuqori) */}
                <div className="absolute left-[48%] top-0 w-[22%] z-30 group hover:z-50 transition-all">
                   <img src={tamara} alt="Tamara" className="w-full rounded-xl shadow-md aspect-square object-cover hover:shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer" />
                   <div className="absolute bottom-2 left-2 text-[8px] text-white bg-black/30 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">Tamara Clarke</div>
                </div>

                {/* 3. Adam Levin (O'ngda yuqori) */}
                <div className="absolute right-0 top-[-10px] w-[28%] z-30 group hover:z-50 transition-all">
                   <img src={adam} alt="Adam" className="w-full rounded-xl shadow-md aspect-[4/3] object-cover hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer" />
                   <div className="absolute bottom-2 left-2 text-[8px] text-white bg-black/30 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">Adam Levin</div>
                </div>

                {/* 4. Humbert Holland (O'rtada pastroq) */}
                <div className="absolute left-[47%] bottom-[10%] w-[22%] z-20 group hover:z-50 transition-all">
                   <img src={humbert} alt="Humbert" className="w-full rounded-xl shadow-md aspect-square object-cover hover:shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer" />
                   <div className="absolute bottom-2 left-2 text-[8px] text-white bg-black/30 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">Humbert Holland</div>
                </div>

                {/* 5. Patricia Mendoza (O'ngda pastda katta) */}
                <div className="absolute right-[-5%] bottom-[-5%] w-[38%] z-40 group hover:z-50 transition-all">
                   <img src={patrica} alt="Patricia" className="w-full rounded-2xl shadow-2xl border-4 border-white aspect-[4/3] object-cover hover:shadow-3xl hover:scale-105 transition-all duration-300 cursor-pointer" />
                   <div className="absolute bottom-3 left-3 text-[10px] text-white bg-black/40 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">Patricia Mendoza</div>
                </div>

                {/* Oq yumaloq dekor (Floating Circle) */}
                <div className="absolute left-[42%] top-[45%] w-12 h-12 bg-white rounded-full shadow-lg z-10 animate-pulse-slow" />

                {/* Tugmalar (Present & Call) */}
                <div className="absolute bottom-[-10px] left-0 flex gap-3 z-50">
                   <button className="bg-[#4475F2] text-white px-6 py-2 rounded-xl text-sm font-medium shadow-lg hover:bg-blue-600 hover:shadow-xl hover:scale-105 transition-all duration-300">
                     Present
                   </button>
                   <button className="bg-[#F2545B] text-white px-6 py-2 rounded-xl text-sm font-medium shadow-lg hover:bg-red-500 hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2">
                     <span className="text-lg">📞</span> Call
                   </button>
                </div>
              </div>
            </div>
          </div>

          {/* O'NG TOMON: Matnlar qismi */}
          <div className="lg:pl-10 animate-slide-in-right">
            <h3 className="text-3xl md:text-4xl font-bold text-[#2F327D] leading-[1.2]">
              A <span className="text-[#49BBBD] relative">user interface
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-cyan-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </span> designed <br className="hidden md:block" />
              for the classroom
            </h3>

            <div className="mt-12 space-y-10">
              {/* Item 1 */}
              <div className="flex items-start gap-6 hover-lift group cursor-pointer p-4 rounded-lg transition-all duration-300 hover:bg-cyan-50">
                <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl group-hover:shadow-2xl group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-teal-50 group-hover:to-cyan-50 transition-all duration-300">
                  <img src={icon1} alt="Grid view icon" className="h-6 w-6 group-hover:scale-125 transition-transform duration-300" />
                </div>
                <div>
                  <p className="text-[#696984] text-lg leading-relaxed max-w-md group-hover:text-[#2F327D] transition-colors duration-300">
                    Teachers don’t get lost in the grid view and have a dedicated Podium space.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-6 hover-lift group cursor-pointer p-4 rounded-lg transition-all duration-300 hover:bg-cyan-50">
                <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl group-hover:shadow-2xl group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-teal-50 group-hover:to-cyan-50 transition-all duration-300">
                  <img src={icon2} alt="Presenter icon" className="h-6 w-6 group-hover:scale-125 transition-transform duration-300" />
                </div>
                <div>
                  <p className="text-[#696984] text-lg leading-relaxed max-w-md group-hover:text-[#2F327D] transition-colors duration-300">
                    TA’s and presenters can be moved to the front of the class.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-6 hover-lift group cursor-pointer p-4 rounded-lg transition-all duration-300 hover:bg-cyan-50">
                <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl group-hover:shadow-2xl group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-teal-50 group-hover:to-cyan-50 transition-all duration-300">
                  <img src={icon3} alt="Users icon" className="h-6 w-6 group-hover:scale-125 transition-transform duration-300" />
                </div>
                <div>
                  <p className="text-[#696984] text-lg leading-relaxed max-w-md group-hover:text-[#2F327D] transition-colors duration-300">
                    Teachers can easily see all students and class data at one time.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Features;