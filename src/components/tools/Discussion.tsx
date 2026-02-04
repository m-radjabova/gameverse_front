import discussion from "../../assets/discussion.svg";

function Discussion() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-30">

          {/* RIGHT IMAGE */}
          <div className="relative flex justify-center lg:justify-end">
            <img
              src={discussion}
              alt="tools"
              className="w-full max-w-[520px]"
            />
          </div>

          <div>
            <h2 className="text-[40px] sm:text-[32px] md:text-[36px] font-bold leading-tight text-[#2F327D]">
              One-on-One <br /> <span className="text-[#49BBBD]">Discussions</span>
            </h2>

            <p className="mt-6 max-w-md text-22px] sm:text-[17px] leading-[28px] text-[#696984]">
             Teachers and teacher assistants can talk with students privately without leaving the Zoom environment.
            </p>
          </div>

        </div>
         <div className="mt-16 flex justify-center">
          <button
            className="
              rounded-full
              border border-[#49BBBD]
              px-10 py-3
              text-[16px]
              font-medium
              text-[#49BBBD]
              transition
              hover:bg-[#49BBBD]/10
            "
          >
            See more features
          </button>
        </div>
      </div>
    </section>
  )
}

export default Discussion