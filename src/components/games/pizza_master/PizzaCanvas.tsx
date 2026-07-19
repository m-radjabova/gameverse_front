import { motion } from "framer-motion";
import pizzaBase from "./images/pizza_base.png";
import pizzaComplete from "./images/pizza-complete.png";
import { PIZZA_INGREDIENTS } from "./pizzaData";

export default function PizzaCanvas({ unlocked, label, compact = false }: { unlocked: number; label?: string; compact?: boolean }) {
  const isComplete = unlocked >= PIZZA_INGREDIENTS.length;
  const layers = PIZZA_INGREDIENTS.slice(0, Math.min(unlocked, PIZZA_INGREDIENTS.length));
  const currentPizza = layers[layers.length - 1];
  const currentImage = isComplete ? pizzaComplete : currentPizza?.image ?? pizzaBase;
  const currentKey = isComplete ? "pizza-complete" : currentPizza?.id ?? "pizza-base";
  const currentLabel = isComplete ? "Tayyor pizza" : currentPizza ? `${currentPizza.name} bosqichi` : "Pizza asosi";

  return (
    <div
      className={`relative mx-auto aspect-square w-full shrink-0 ${
        compact ? "min-w-[150px] max-w-[260px]" : "min-w-[240px] max-w-[460px]"
      }`}
    >
      <div className="absolute inset-[7%] rounded-full bg-orange-500/20 blur-3xl animate-pulse" style={{ animationDuration: "3s" }} />
      {label && (
        <p className="absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-full bg-black/50 backdrop-blur px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white border border-white/10">
          {label}
        </p>
      )}
      <motion.img
        key={currentKey}
        src={currentImage}
        alt={currentLabel}
        initial={{ opacity: 0, scale: 0.86, rotate: -4 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.48, type: "spring", stiffness: 150, damping: 17 }}
        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_22px_34px_rgba(251,146,60,0.42)]"
      />
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute bottom-[6%] left-1/2 z-20 -translate-x-1/2 rounded-full border border-lime-300/40 bg-lime-500/20 px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-lime-100 backdrop-blur"
        >
          Pizza Complete
        </motion.div>
      )}
    </div>
  );
}
