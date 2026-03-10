import { Link } from "react-router-dom";
import { FaArrowRight, FaPlay } from "react-icons/fa";

type GamePagePlayButtonProps = {
  to: string;
  colorClassName: string;
  className?: string;
};

export default function GamePagePlayButton({
  to,
  colorClassName,
  className = "",
}: GamePagePlayButtonProps) {
  return (
    <div className={className}>
      <Link
        to={to}
        className={`inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r ${colorClassName} px-6 py-4 text-sm font-black text-white shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto sm:min-w-[260px]`}
      >
        <FaPlay className="text-sm" />
        <span>O'yinni boshlash</span>
        <FaArrowRight className="text-sm" />
      </Link>
    </div>
  );
}
