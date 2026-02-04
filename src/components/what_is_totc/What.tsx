import instructors from "../../assets/instructors.svg";
import students from "../../assets/students.svg";

function What() {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-7xl px-6 text-center">
        {/* Title */}
        <h2 className="text-[44px] font-bold text-[#2F327D]">
          What is <span className="text-[#49BBBD]">TOTC?</span>
        </h2>

        {/* Description */}
        <p className="mx-auto mt-4 max-w-4xl text-[24px] leading-8 text-[#696984]">
          TOTC is a platform that allows educators to create online classes
          whereby they can store the course materials online; manage assignments,
          quizzes and exams; monitor due dates; grade results and provide students
          with feedback all in one place.
        </p>

        {/* Cards */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-2 gap-10">
          {/* For Instructors */}
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={instructors}
              alt="instructors"
              className="h-[350px] w-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h3 className="text-[32px] font-semibold mb-4">
                FOR INSTRUCTORS
              </h3>
              <button className="rounded-full border border-white px-8 py-4 text-[22px] font-medium hover:bg-white hover:text-black transition">
                Start a class today
              </button>
            </div>
          </div>

          {/* For Students */}
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={students}
              alt="students"
              className="h-[350px] w-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h3 className="text-[32px] font-semibold mb-4">
                FOR STUDENTS
              </h3>
              <button className="rounded-full bg-[#49BBBD] px-8 py-4 text-[22px] font-medium hover:bg-[#3aaeb0] transition">
                Enter access code
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default What;
