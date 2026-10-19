import { useState } from "react";

type GameCardImageProps = {
  src: string;
  alt: string;
  loading: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
};

export default function GameCardImage({
  src,
  alt,
  loading,
  fetchPriority = "auto",
  className = "",
}: GameCardImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <>
      {status === "loading" && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-slate-900/35"
        />
      )}
      {status === "error" ? (
        <div
          role="img"
          aria-label={`${alt} rasmi yuklanmadi`}
          className="absolute inset-0 flex items-center justify-center bg-slate-950/40 px-4 text-center font-semibold text-white"
        >
          {alt}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            status === "loaded" ? "opacity-100" : "opacity-0"
          } ${className}`}
        />
      )}
    </>
  );
}
