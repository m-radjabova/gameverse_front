import online from "../../assets/online.svg";
import easy from "../../assets/easy.svg";
import customer from "../../assets/customer.svg";

function CloudSoftware() {
  return (
    <section className="bg-gradient-to-b from-white to-cyan-50 py-24 animate-fade-in-up">
      <div className="mx-auto max-w-7xl px-6 text-center">
        {/* Title */}
        <h2 className="text-[32px] font-bold text-[#2F327D] hover:text-teal-600 transition-colors duration-300">
          All-In-One <span className="text-[#49BBBD]">Cloud Software.</span>
        </h2>

        {/* Description */}
        <p className="mt-4 max-w-4xl mx-auto text-[24px] leading-8 text-[#696984] hover:text-[#2F327D] transition-colors duration-300">
          TOTC is one powerful online software suite that combines all the tools <br />
          needed to run a successful school or office.
        </p>

        {/* Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Card 1 */}
          <div className="rounded-2xl bg-white px-8 pt-16 pb-10 shadow-[0_20px_40px_rgba(47,50,125,0.08)] hover-lift hover:shadow-2xl group transition-all duration-300 cursor-pointer">
            <img
              src={online}
              alt="online billing"
              className="mx-auto group-hover:scale-110 transition-transform duration-300"
            />
            <h3 className="text-[26px] font-semibold text-[#2F327D] group-hover:text-teal-600 transition-colors duration-300">
              Online Billing, Invoicing, & Contracts
            </h3>
            <p className="mt-4 text-[14px] leading-6 text-[#696984] group-hover:text-[#2F327D] transition-colors duration-300">
              Simple and secure control of your organization’s financial and
              legal transactions. Send customized invoices and contracts.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-white px-8 pt-16 pb-10 shadow-[0_20px_40px_rgba(47,50,125,0.08)] hover-lift hover:shadow-2xl group transition-all duration-300 cursor-pointer">
            <img
              src={easy}
              alt="easy scheduling"
              className="mx-auto group-hover:scale-110 transition-transform duration-300"
            />
            <h3 className="text-[28px] font-semibold text-[#2F327D] group-hover:text-teal-600 transition-colors duration-300">
              Easy Scheduling & Attendance Tracking
            </h3>
            <p className="mt-4 text-[14px] leading-6 text-[#696984] group-hover:text-[#2F327D] transition-colors duration-300">
              Schedule and reserve classrooms at one campus or multiple campuses.
              Keep detailed records of student attendance.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl bg-white px-8 pt-16 pb-10 shadow-[0_20px_40px_rgba(47,50,125,0.08)] hover-lift hover:shadow-2xl group transition-all duration-300 cursor-pointer">
            <img
              src={customer}
              alt="customer tracking"
              className="mx-auto group-hover:scale-110 transition-transform duration-300"
            />
            <h3 className="text-[28px] font-semibold text-[#2F327D] group-hover:text-teal-600 transition-colors duration-300">
              Customer Tracking
            </h3>
            <p className="mt-6 text-[14px] leading-6 text-[#696984] group-hover:text-[#2F327D] transition-colors duration-300">
              Automate and track emails to individuals or groups. Skilline’s
              built-in system helps organize your organization.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CloudSoftware;