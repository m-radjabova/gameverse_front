import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

const easeOut = [0.22, 1, 0.36, 1] as const;

// A lightweight React Bits-style reveal: only composited transform and opacity animate.
export function ReactBitsReveal({ children, className = "", delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduceMotion ? 0 : 0.56, delay: delay / 1000, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

export function ReactBitsPageEnter({ children, className = "" }: Omit<RevealProps, "delay">) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.34, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}
