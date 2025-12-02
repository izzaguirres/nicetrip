"use client"

import { motion, useInView, Variants } from "framer-motion"
import { useRef } from "react"

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  blur?: boolean
  amount?: number | "some" | "all"
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.8,
  direction = "up",
  blur = true,
  amount = 0.2 // Trigger when 20% of element is in view
}: FadeInProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount })

  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 30 : direction === "down" ? -30 : 0,
      x: direction === "left" ? 30 : direction === "right" ? -30 : 0,
      filter: blur ? "blur(10px)" : "none",
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      filter: "blur(0px)",
      transition: {
        duration: duration,
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98], // Smooth custom ease
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}
