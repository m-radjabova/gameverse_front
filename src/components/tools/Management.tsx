import greadebook from "../../assets/gradebook.svg";

function Management() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
          {/* LEFT CONTENT */}
          <div>
            <h2 className="text-[40px] sm:text-[32px] md:text-[36px] font-bold leading-tight text-[#2F327D]">
              <span className="text-[#49BBBD]">Class Management</span> <br />
              Tools for Educators
            </h2>

            <p className="mt-6 max-w-md text-[22px] sm:text-[17px] leading-[28px] text-[#696984]">
              Class provides tools to help run and manage the class such as
              Class Roster, Attendance, and more. With the Gradebook, teachers
              can review and grade tests and quizzes in real-time.
            </p>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative flex justify-center lg:justify-end">
            <img
              src={greadebook}
              alt="tools"
              className="w-full max-w-[520px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Management;
