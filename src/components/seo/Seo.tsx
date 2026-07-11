import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { gameCards } from "../../pages/games/data";

const SITE_URL = "https://gameverse-front.vercel.app";
const SITE_NAME = "GAMEVERSE";
const DEFAULT_IMAGE = `${SITE_URL}/og-cover-share.png`;
const DEFAULT_TITLE = "GAMEVERSE | Interaktiv ta'lim o'yinlari va VR platforma";
const DEFAULT_DESCRIPTION =
  "GAMEVERSE - o'quvchilar va o'qituvchilar uchun interaktiv ta'lim o'yinlari, quizlar, 3D va VR simulyatorlar platformasi. O'rganing, o'ynang va rivojlaning.";

const pageSeo: Record<string, { title: string; description: string; image?: string }> = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  "/games": {
    title: "GAMEVERSE o'yinlari | Quizlar, VR va interaktiv ta'lim",
    description:
      "GAMEVERSE o'yinlar katalogi: quizlar, mantiqiy o'yinlar, 3D tajribalar va VR simulyatorlarni bitta platformada sinab ko'ring.",
  },
  "/login": {
    title: "Kirish | GAMEVERSE",
    description: "GAMEVERSE akkauntingizga kiring va ta'lim o'yinlarini davom ettiring.",
  },
  "/register": {
    title: "Ro'yxatdan o'tish | GAMEVERSE",
    description: "GAMEVERSE platformasida ro'yxatdan o'ting va interaktiv ta'lim o'yinlarini boshlang.",
  },
};

const noIndexPrefixes = [
  "/admin",
  "/profile",
  "/favorites",
  "/teacher-panel",
];

function toAbsoluteUrl(pathname: string) {
  return `${SITE_URL}${pathname === "/" ? "/" : pathname}`;
}

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function getImageUrl(image?: string) {
  if (!image || image.startsWith("data:")) {
    return DEFAULT_IMAGE;
  }

  if (image.startsWith("http")) {
    return image;
  }

  return DEFAULT_IMAGE;
}

export default function Seo() {
  const location = useLocation();
  const pathname = normalizePath(location.pathname);
  const isPlayPage = pathname.endsWith("/play");
  const shouldNoIndex =
    isPlayPage || noIndexPrefixes.some((prefix) => pathname.startsWith(prefix));

  const game = gameCards.find((item) => item.path === pathname || item.route === pathname);
  const routeSeo = pageSeo[pathname];
  const title = game
    ? `${game.title} | GAMEVERSE`
    : routeSeo?.title ?? DEFAULT_TITLE;
  const description = game?.description ?? routeSeo?.description ?? DEFAULT_DESCRIPTION;
  const canonical = toAbsoluteUrl(pathname);
  const image = getImageUrl(typeof game?.image === "string" ? game.image : routeSeo?.image);
  const robots = shouldNoIndex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  const gameSchema = game
    ? {
        "@context": "https://schema.org",
        "@type": "VideoGame",
        name: game.title,
        description: game.description,
        url: canonical,
        image,
        applicationCategory: "EducationalGame",
        operatingSystem: "Web",
        inLanguage: "uz",
        isAccessibleForFree: true,
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
      }
    : null;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={game ? "game" : "website"} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="uz_UZ" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${SITE_NAME} - ${game?.title ?? "ta'lim o'yinlari"}`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={`${SITE_NAME} - ${game?.title ?? "ta'lim o'yinlari"}`} />

      {gameSchema ? (
        <script type="application/ld+json">{JSON.stringify(gameSchema)}</script>
      ) : null}
    </Helmet>
  );
}
