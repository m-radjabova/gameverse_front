import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  size?: number;
  showHat?: boolean;
  hatType?: "cowboy" | "tophat" | "beanie" | "sombrero" | "beret" | "none";
};

export default function FlagBall({
  src,
  size = 260,
  showHat = true,
  hatType = "cowboy",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    canvas.width = size;
    canvas.height = size * 1.3;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      const r = size / 2 - 12;
      const cx = size / 2;
      const cy = (size * 1.3) / 2.2;

      ctx.clearRect(0, 0, size, canvas.height);

      /* enhanced shadow with blur and perspective */
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.ellipse(cx, cy + r + 18, r * 0.85, r * 0.22, 0, 0, Math.PI * 2);
      ctx.filter = "blur(12px)";
      ctx.fill();
      ctx.restore();

      /* secondary subtle shadow */
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.ellipse(cx, cy + r + 12, r * 0.95, r * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      /* clip circle */
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);

      /* deep shading for 3D effect */
      const shade = ctx.createRadialGradient(
        cx + r * 0.25,
        cy + r * 0.35,
        8,
        cx + r * 0.25,
        cy + r * 0.35,
        r * 1.1
      );

      shade.addColorStop(0, "rgba(0, 0, 0, 0.25)");
      shade.addColorStop(0.6, "rgba(0, 0, 0, 0.1)");
      shade.addColorStop(1, "rgba(0, 0, 0, 0.35)");

      ctx.fillStyle = shade;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      /* enhanced highlight with glow */
      const light = ctx.createRadialGradient(
        cx - r * 0.35,
        cy - r * 0.45,
        12,
        cx - r * 0.35,
        cy - r * 0.45,
        r * 0.95
      );

      light.addColorStop(0, "rgba(255, 255, 255, 0.75)");
      light.addColorStop(0.4, "rgba(255, 255, 255, 0.35)");
      light.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = light;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      ctx.restore();

      /* premium border glow */
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      /* expressive eyes with personality */
      const eyeY = cy - r * 0.08;
      const eyeX = r * 0.32;

      /* eye whites */
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.ellipse(cx - eyeX, eyeY, 13.5, 15.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx + eyeX, eyeY, 13.5, 15.5, 0, 0, Math.PI * 2);
      ctx.fill();

      /* eye shadow */
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.beginPath();
      ctx.ellipse(cx - eyeX, eyeY + 1, 13.5, 15.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx + eyeX, eyeY + 1, 13.5, 15.5, 0, 0, Math.PI * 2);
      ctx.fill();

      /* iris/pupils */
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.arc(cx - eyeX, eyeY + 2.5, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx + eyeX, eyeY + 2.5, 5, 0, Math.PI * 2);
      ctx.fill();

      /* eye shine/reflection */
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();
      ctx.arc(cx - eyeX - 1.5, eyeY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx + eyeX - 1.5, eyeY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      setIsLoaded(true);
    };
  }, [src, size]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center justify-center"
      style={{
        perspective: "1000px",
      }}
    >
      {/* glow background effect */}
      <div
        className="absolute rounded-full opacity-0 animate-pulse"
        style={{
          width: size + 40,
          height: size + 40,
          background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)",
          filter: "blur(20px)",
          animation: isLoaded ? "glow 4s ease-in-out infinite" : "none",
        }}
      />

      {/* main canvas */}
      <canvas
        ref={canvasRef}
        className="relative drop-shadow-2xl"
        style={{
          filter: isLoaded ? "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.25))" : "none",
          animation: isLoaded ? "float 6s ease-in-out infinite, spin 20s linear infinite" : "none",
          transformStyle: "preserve-3d",
        }}
      />

      {/* floating particles effect */}
      {isLoaded && (
        <>
          <div
            className="absolute pointer-events-none"
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "rgba(59, 130, 246, 0.6)",
              left: "25%",
              top: "20%",
              animation: "particle-float 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "rgba(139, 92, 246, 0.5)",
              left: "75%",
              top: "25%",
              animation: "particle-float 7s ease-in-out infinite 1s",
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              width: 2.5,
              height: 2.5,
              borderRadius: "50%",
              background: "rgba(59, 130, 246, 0.4)",
              right: "20%",
              bottom: "30%",
              animation: "particle-float 5.5s ease-in-out infinite 0.5s",
            }}
          />
        </>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotateX(0deg);
          }
          50% {
            transform: translateY(-12px) rotateX(2deg);
          }
        }

        @keyframes spin {
          0% {
            transform: rotateZ(0deg);
          }
          100% {
            transform: rotateZ(360deg);
          }
        }

        @keyframes glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        @keyframes particle-float {
          0%, 100% {
            opacity: 0;
            transform: translateY(0) translateX(0);
          }
          25% {
            opacity: 1;
          }
          75% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-40px) translateX(20px);
          }
        }
      `}</style>
    </div>
  );
}