import question from "../../assets/questions.svg";

function Question() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16">

          {/* RIGHT IMAGE */}
          <div className="relative flex justify-center lg:justify-end">
            <img
              src={question}
              alt="tools"
              className="w-full max-w-[520px]"
            />
          </div>

          <div>
            <h2 className="text-[40px] sm:text-[32px] md:text-[36px] font-bold leading-tight text-[#2F327D]">
              Assessments, <br /> <span className="text-[#49BBBD]">Quizzes</span>,Tests
            </h2>

            <p className="mt-6 max-w-md text-22px] sm:text-[17px] leading-[28px] text-[#696984]">
              Easily launch live assignments, quizzes, and tests.
Student results are automatically entered in the online gradebook.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Question;
