type Category = {
  id: number;
  title: string;
  iconBg: string;
  iconColor: string;
  count: number;
};

function Categories() {
  const items: Category[] = [
    { id: 1, title: "Design", iconBg: "bg-gradient-to-br from-purple-100 to-pink-100", iconColor: "text-purple-600", count: 42 },
    { id: 2, title: "Development", iconBg: "bg-gradient-to-br from-blue-100 to-cyan-100", iconColor: "text-blue-600", count: 56 },
    { id: 3, title: "Business", iconBg: "bg-gradient-to-br from-emerald-100 to-green-100", iconColor: "text-emerald-600", count: 38 },
    { id: 4, title: "Marketing", iconBg: "bg-gradient-to-br from-orange-100 to-amber-100", iconColor: "text-orange-600", count: 29 },
    { id: 5, title: "Photography", iconBg: "bg-gradient-to-br from-rose-100 to-pink-100", iconColor: "text-rose-600", count: 31 },
    { id: 6, title: "Music", iconBg: "bg-gradient-to-br from-violet-100 to-purple-100", iconColor: "text-violet-600", count: 24 },
    { id: 7, title: "Health", iconBg: "bg-gradient-to-br from-lime-100 to-green-100", iconColor: "text-lime-600", count: 45 },
    { id: 8, title: "Language", iconBg: "bg-gradient-to-br from-sky-100 to-blue-100", iconColor: "text-sky-600", count: 33 },
  ];

  return (
    <section className="py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Explore Top Categories
          </h2>
          <p className="text-slate-600 mt-3">Learn from the best courses in every field</p>
        </div>
        
        <button className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-slate-300 transition-all duration-300 hover:scale-[1.02]">
          Browse All Categories
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((c) => (
          <div
            key={c.id}
            className="group relative bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 hover:shadow-[0_25px_60px_rgba(2,8,23,0.12)] hover:border-transparent hover:translate-y-[-6px] transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/50 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700" />
            
            <div className={`relative w-16 h-16 rounded-2xl ${c.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <div className={`text-2xl ${c.iconColor}`}>
                {c.title.charAt(0)}
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors duration-300">
              {c.title}
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Master {c.title.toLowerCase()} with expert-led courses and practical projects.
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 group-hover:border-slate-200 transition-colors duration-300">
              <span className="text-sm text-slate-500">
                {c.count} courses
              </span>
              <button className="px-4 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors duration-300">
                Explore →
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories