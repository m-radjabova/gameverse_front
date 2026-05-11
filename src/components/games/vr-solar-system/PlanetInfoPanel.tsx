import type { SolarSystemPlanet } from './data'
import type { SolarProgress } from './lib/solarProgress'

interface PlanetInfoPanelProps {
  planets: SolarSystemPlanet[]
  progress: SolarProgress
  selectedPlanet: SolarSystemPlanet | null
  onSelectPlanet: (planetId: string) => void
}

export function PlanetInfoPanel({
  planets,
  progress,
  selectedPlanet,
  onSelectPlanet,
}: PlanetInfoPanelProps) {
  const visitedPlanets = new Set(progress.visitedPlanetIds)

  return (
    <section className="pointer-events-auto max-h-[32dvh] overflow-y-auto rounded-[16px] border border-white/12 bg-[linear-gradient(180deg,rgba(2,6,23,0.9),rgba(10,14,28,0.84))] p-3 text-slate-100 shadow-[0_18px_50px_rgba(2,6,23,0.46)] backdrop-blur-3xl [scrollbar-width:thin] sm:rounded-[22px] sm:p-4 md:max-h-[34dvh] lg:max-h-none lg:overflow-visible lg:rounded-[24px] lg:p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200/75 sm:text-[11px] sm:tracking-[0.3em] lg:tracking-[0.34em]">Sayyora haqida</p>

      {selectedPlanet ? (
        <>
          <div className="mt-2 flex items-start justify-between gap-3 lg:mt-3 lg:gap-4">
            <div>
              <h2 className="text-xl font-black lg:text-2xl">{selectedPlanet.nameUz}</h2>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-200 md:text-sm md:leading-6">{selectedPlanet.shortDescriptionUz}</p>
            </div>
            {selectedPlanet.uiBadge ? (
              <span className="hidden rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-100 sm:inline-flex">
                {selectedPlanet.uiBadge}
              </span>
            ) : null}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <InfoTile label="Joylashuvi" value={`${selectedPlanet.orderFromSun}-sayyora`} />
            <InfoTile label="Turi" value={selectedPlanet.typeLabelUz} />
          </div>

          <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs leading-5 text-slate-100 md:text-sm md:leading-6">
            {selectedPlanet.factsUz[0]}
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-2 text-xl font-black lg:mt-3 lg:text-2xl">Umumiy ko'rinish</h2>
        </>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5 lg:mt-6 lg:gap-2">
        {planets.map((planet) => {
          const isVisited = visitedPlanets.has(planet.id)
          const isActive = selectedPlanet?.id === planet.id

          return (
            <button
              className={`rounded-full px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] transition sm:text-xs lg:px-3 lg:py-2 lg:tracking-[0.12em] ${
                isActive
                  ? "bg-cyan-400 text-slate-950"
                  : isVisited
                    ? "border border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                    : planet.isBonusObject
                      ? "border border-fuchsia-300/25 bg-fuchsia-300/10 text-fuchsia-100"
                      : "border border-white/12 bg-white/6 text-slate-200"
              }`}
              key={planet.id}
              onClick={() => onSelectPlanet(planet.id)}
              type="button"
            >
              {planet.nameUz}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <p className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
      <span className="block text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <strong className="mt-1 block text-xs font-black leading-5 text-white md:text-sm">{value}</strong>
    </p>
  )
}
