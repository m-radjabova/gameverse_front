import { useMemo } from "react";
import { Wheel } from "react-custom-roulette-r19";

type Student = {
  id: string;
  name: string;
  score: number;
};

type Props = {
  students: Student[];
  mustSpin: boolean;
  prizeNumber: number;
  onStopSpinning: () => void;
};

const SEGMENT_COLORS = [
  "#3B82F6",
  "#14B8A6",
  "#22C55E",
  "#EAB308",
  "#F97316",
  "#EF4444",
  "#EC4899",
  "#A855F7",
];

export default function StudentWheel({
  students,
  mustSpin,
  prizeNumber,
  onStopSpinning,
}: Props) {
  const fontSize = students.length >= 12 ? 11 : students.length >= 9 ? 13 : 15;
  const textDistance = students.length >= 12 ? 58 : students.length >= 9 ? 62 : 68;

  const data = useMemo(() => {
    return students.map((student, index) => {
      return {
        option: student.name.length > 16 ? `${student.name.slice(0, 16)}...` : student.name,
        style: {
          backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
          textColor: "#ffffff",
        },
      };
    });
  }, [students]);

  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="relative rounded-full border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-2xl">
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          backgroundColors={SEGMENT_COLORS}
          textColors={["#ffffff"]}
          outerBorderColor="#ffffff22"
          outerBorderWidth={8}
          innerBorderColor="#ffffff22"
          innerBorderWidth={4}
          radiusLineColor="#ffffff33"
          radiusLineWidth={2}
          fontSize={fontSize}
          perpendicularText={true}
          textDistance={textDistance}
          spinDuration={0.8}
          onStopSpinning={onStopSpinning}
        />
      </div>

      <div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2">
        <div className="relative">
          <div className="absolute inset-0 blur-md bg-yellow-400 rounded-full opacity-70" />
          <div
            className="relative w-0 h-0
            border-l-[22px] border-r-[22px] border-t-[42px]
            border-l-transparent border-r-transparent border-t-yellow-400"
          />
        </div>
      </div>
    </div>
  );
}
