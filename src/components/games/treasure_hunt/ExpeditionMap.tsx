import { memo } from "react";
import pirateShipSvg from "../../../assets/treasure-hunt/pirate-ship.svg";
import compassRoseSvg from "../../../assets/treasure-hunt/compass-rose.svg";
import portIsland from "./images/map_port_island.webp";
import compassIsland from "./images/map_compass_island.webp";
import whaleIsland from "./images/map_whale_island.webp";
import volcanoIsland from "./images/map_volcano_island.webp";
import pirateIsland from "./images/map_pirate_island.webp";
import ancientLighthouse from "./images/map_ancient_lighthouse.webp";
import treasureIsland from "./images/map_treasure_island.webp";
import palmTree from "./images/palm_tree.webp";
import treasureChest from "./images/treasure_chest.webp";
import stonePath from "./images/stone_path.webp";
import pirateFlag from "./images/pirate_flag.webp";
import volcano from "./images/volcano.webp";
import lighthouse from "./images/lighthouse.webp";
import bridge from "./images/bridge.webp";

type ExpeditionMapProps = {
  progress: number;
  keysFound?: number;
  totalKeys?: number;
  compact?: boolean;
};

const STAGES = [
  { x: 27, y: 8, cx: 8, cy: 70, name: "Port Island", sub: "Safar boshlanishi", image: portIsland },
  { x: 68, y: 23, cx: 22, cy: 36, name: "Compass Island", sub: "Yo'nalish siri", image: compassIsland },
  { x: 28, y: 38, cx: 36, cy: 69, name: "Whale Island", sub: "Okean qo'riqchisi", image: whaleIsland },
  { x: 68, y: 53, cx: 51, cy: 34, name: "Volcano Island", sub: "Olovli sinov", image: volcanoIsland },
  { x: 28, y: 68, cx: 66, cy: 68, name: "Pirate Island", sub: "Qaroqchilar qal'asi", image: pirateIsland },
  { x: 68, y: 83, cx: 81, cy: 35, name: "Ancient Lighthouse", sub: "Tuman ichidagi nur", image: ancientLighthouse },
  { x: 28, y: 97, cx: 91, cy: 65, name: "Treasure Island", sub: "Afsonaviy xazina", image: treasureIsland },
] as const;

const VERTICAL_ROUTE = "M27 8 C27 15 68 16 68 23 S28 31 28 38 S68 46 68 53 S28 61 28 68 S68 76 68 83 S28 91 28 97";
const COMPACT_ROUTE = "M8 70 C13 70 15 38 22 36 S29 70 36 69 S44 35 51 34 S59 69 66 68 S74 36 81 35 S87 65 91 65";

function getShipPosition(progress: number, compact: boolean) {
  const safe = Math.max(0, Math.min(100, progress));
  const scaled = (safe / 100) * (STAGES.length - 1);
  const index = Math.min(Math.floor(scaled), STAGES.length - 2);
  const fraction = scaled - index;
  const from = compact ? { x: STAGES[index].cx, y: STAGES[index].cy } : STAGES[index];
  const to = compact ? { x: STAGES[index + 1].cx, y: STAGES[index + 1].cy } : STAGES[index + 1];
  return {
    x: from.x + (to.x - from.x) * fraction,
    y: from.y + (to.y - from.y) * fraction,
  };
}

const ExpeditionMap = memo(function ExpeditionMap({
  progress,
  keysFound = 0,
  totalKeys = 7,
  compact = false,
}: ExpeditionMapProps) {
  const safeProgress = Math.max(0, Math.min(100, progress));
  const activeStage = Math.min(STAGES.length - 1, Math.floor((safeProgress / 100) * (STAGES.length - 1)));
  const ship = getShipPosition(safeProgress, compact);

  return (
    <div className={`treasure-expedition-map ${compact ? "treasure-expedition-map--compact" : ""}`}>
      <div className="treasure-world">
        <div className="treasure-sky-glow" />
        <div className="treasure-ocean-grid" />
        <div className="treasure-cloud treasure-cloud--one" />
        <div className="treasure-cloud treasure-cloud--two" />

        <svg className="treasure-world-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d={compact ? COMPACT_ROUTE : VERTICAL_ROUTE} className="treasure-route-shadow" pathLength="100" />
          <path d={compact ? COMPACT_ROUTE : VERTICAL_ROUTE} className="treasure-route-empty" pathLength="100" />
          <path
            d={compact ? COMPACT_ROUTE : VERTICAL_ROUTE}
            className="treasure-route-progress"
            pathLength="100"
            strokeDasharray={`${safeProgress} ${100 - safeProgress}`}
          />
        </svg>

        <img className="treasure-decor treasure-decor--palm-a" src={palmTree} alt="" loading="lazy" decoding="async" draggable={false} />
        <img className="treasure-decor treasure-decor--palm-b" src={palmTree} alt="" loading="lazy" decoding="async" draggable={false} />
        <img className="treasure-decor treasure-decor--volcano" src={volcano} alt="" loading="lazy" decoding="async" draggable={false} />
        <img className="treasure-decor treasure-decor--lighthouse" src={lighthouse} alt="" loading="lazy" decoding="async" draggable={false} />
        <img className="treasure-decor treasure-decor--bridge-a" src={bridge} alt="" loading="lazy" decoding="async" draggable={false} />
        <img className="treasure-decor treasure-decor--bridge-b" src={bridge} alt="" loading="lazy" decoding="async" draggable={false} />
        <img className="treasure-decor treasure-decor--path" src={stonePath} alt="" loading="lazy" decoding="async" draggable={false} />
        <img className="treasure-decor treasure-decor--flag" src={pirateFlag} alt="" loading="lazy" decoding="async" draggable={false} />
        <img className="treasure-decor treasure-decor--chest" src={treasureChest} alt="" loading="lazy" decoding="async" draggable={false} />

        {STAGES.map((stage, index) => {
          const passed = index < activeStage || safeProgress >= 100;
          const current = index === activeStage && safeProgress < 100;
          return (
            <div
              key={stage.name}
              className={`treasure-island ${passed ? "is-passed" : ""} ${current ? "is-current" : ""} ${index > activeStage ? "is-locked" : ""}`}
              style={{ left: `${compact ? stage.cx : stage.x}%`, top: `${compact ? stage.cy : stage.y}%` }}
            >
              <div className="treasure-island-aura" />
              <div className="treasure-island-picture">
                <img
                  src={stage.image}
                  alt={stage.name}
                  width={768}
                  height={512}
                  loading={compact || index <= activeStage + 1 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                />
              </div>
              <div className="treasure-island-marker">
                <span>{passed ? "✓" : current ? "⚓" : "🔒"}</span>
                <div>
                  <strong>{stage.name}</strong>
                  {!compact && <small>{stage.sub}</small>}
                </div>
              </div>
            </div>
          );
        })}

        <div className="treasure-map-ship" style={{ left: `${ship.x}%`, top: `${ship.y}%` }}>
          <span className="treasure-ship-wake" />
          <img src={pirateShipSvg} alt="Sizning kemangiz" decoding="async" draggable={false} />
        </div>

        {!compact && (
          <>
            <img className="treasure-compass" src={compassRoseSvg} alt="Kompas" loading="lazy" decoding="async" draggable={false} />
            <div className="treasure-map-legend">
              <span>EKSPEDITSIYA JURNALI</span>
              <strong>🔑 {keysFound}/{totalKeys} BILIM KALITI</strong>
              <small>{safeProgress}% yo'l bosildi</small>
            </div>
            <div className="treasure-map-atmosphere">✦</div>
            <div className="treasure-map-atmosphere treasure-map-atmosphere--two">✦</div>
            <div className="treasure-sea-creature treasure-sea-creature--whale">🐋</div>
            <div className="treasure-sea-creature treasure-sea-creature--octopus">🐙</div>
          </>
        )}
      </div>
    </div>
  );
});

export default ExpeditionMap;
