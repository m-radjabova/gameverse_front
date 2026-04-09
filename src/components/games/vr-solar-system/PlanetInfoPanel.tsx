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
    <section className="pointer-events-auto rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(2,6,23,0.94),rgba(10,14,28,0.9))] p-5 text-slate-100 shadow-[0_24px_70px_rgba(2,6,23,0.6)] backdrop-blur-3xl md:p-6">
      <p className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200/75">Sayyora haqida</p>

      {selectedPlanet ? (
        <>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">{selectedPlanet.nameUz}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-200">{selectedPlanet.shortDescriptionUz}</p>
            </div>
            {selectedPlanet.uiBadge ? (
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
                {selectedPlanet.uiBadge}
              </span>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoTile label="Quyoshdan joylashuvi" value={selectedPlanet.orbitalPositionUz} />
            <InfoTile label="Turi" value={selectedPlanet.typeLabelUz} />
            <InfoTile label="Quyoshdan nechanchi sayyora" value={`${selectedPlanet.orderFromSun}-sayyora`} />
            <InfoTile label="Tarkibi" value={selectedPlanet.materialLabelUz} />
          </div>

          <div className="mt-5 space-y-3">
            {selectedPlanet.factsUz.map((fact) => (
              <p key={fact} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-slate-100">
                {fact}
              </p>
            ))}
          </div>

          {selectedPlanet.isBonusObject ? (
            <div className="mt-5 rounded-[22px] border border-fuchsia-300/20 bg-fuchsia-300/10 p-4">
              <strong>Bonus obyekt</strong>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Pluton asosiy sakkiz sayyoradan tashqarida ko'rsatiladi va ta'limiy bonus obyekt sifatida berilgan.
              </p>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <h2 className="mt-4 text-2xl font-black">Umumiy tizim ko'rinishi</h2>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            Masofalar siqilgan, tartib esa ilmiy ketma-ketlikda saqlangan. Shu sabab tizim uzoqdan tushunarli, yaqinlashganda esa ishonarli ko'rinadi.
          </p>
          <div className="mt-5 space-y-3">
            <p className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-slate-100">
              Yupiter Yerga qaraganda ancha katta ko'rsatilgan, Saturn esa halqalari bilan ravshan ajraladi.
            </p>
            <p className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-slate-100">
              Sayyorani tanlang, kamera silliq uchib boradi va info panel darhol yangilanadi.
            </p>
          </div>
        </>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {planets.map((planet) => {
          const isVisited = visitedPlanets.has(planet.id)
          const isActive = selectedPlanet?.id === planet.id

          return (
            <button
              className={`rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition ${
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
    <p className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <span className="block text-xs uppercase tracking-[0.16em] text-slate-400">{label}</span>
      <strong className="mt-2 block text-sm font-black leading-6 text-white">{value}</strong>
    </p>
  )
}
