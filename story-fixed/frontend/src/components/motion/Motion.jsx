// src/components/motion/Motion.jsx
// =============================================================================
//  STORY (TM)  -  PREMIUM MOTION PRIMITIVES  (Framer Motion)
// =============================================================================
//
//  A small set of restrained, luxury-grade motion primitives built on
//  framer-motion. Every primitive is tuned for a fashion-editorial feel:
//
//    - Short durations (.5s - .9s), never bouncy, never spring-overshot.
//    - Ease curves: cubic-bezier(.2, .7, .2, 1)  - "premium decel".
//    - Tiny y-offsets (16-24px), zero scale springs.
//    - Honours prefers-reduced-motion: every primitive collapses to an
//      instant fade so people who opt out get a zero-motion experience.
//    - Cheap in-view triggers (whileInView with `once: true` + small margin).
//
//  Usage (kept intentionally tiny):
//
//      <FadeUp>
//        <h2>OUR LATEST OFFERINGS</h2>
//      </FadeUp>
//
//      <RevealText delay={.1}>A QUIET REVOLUTION</RevealText>
//
//      <RevealImage>
//        <img src={src} alt="" />
//      </RevealImage>
//
//      <HoverLift>
//        <ProductCard ... />
//      </HoverLift>
//
//      <PageTransition keyId={page}>{...page content...}</PageTransition>
//
//  Implementation note: we deliberately do NOT export motion() factories
//  for arbitrary tags - HoverLift / FadeUp / etc. wrap children in a
//  single motion.div, which is enough for >95% of our use sites and
//  keeps the public surface area small.
// =============================================================================

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// -----------------------------------------------------------------------------
//  Shared easing + viewport defaults. Centralised so a future tuning pass
//  is a single-line change.
// -----------------------------------------------------------------------------
export const LUX_EASE = [0.2, 0.7, 0.2, 1]; // premium decel, no overshoot
export const LUX_VIEWPORT = { once: true, margin: '0px 0px -8% 0px', amount: 0.15 };

// -----------------------------------------------------------------------------
//  FadeUp - the workhorse. A subtle fade + 18px translate when an element
//  enters the viewport. No spring, no scale. Stagger via `delay`.
// -----------------------------------------------------------------------------
export function FadeUp({
  children,
  delay = 0,
  duration = 0.7,
  y = 18,
  className,
  style,
  as: Tag = 'div',
  viewport = LUX_VIEWPORT,
  ...rest
}) {
  const reduce = useReducedMotion();
  const Comp = motion[Tag] || motion.div;

  if (reduce) {
    return (
      <Comp
        className={className}
        style={style}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.01 }}
        viewport={viewport}
        {...rest}
      >
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration, ease: LUX_EASE, delay }}
      viewport={viewport}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// -----------------------------------------------------------------------------
//  Stagger - container that staggers its direct FadeUp / motion children.
//  Pair with <FadeUp> kids that have no explicit `delay` - the parent
//  staggerChildren value will drive their entry.
// -----------------------------------------------------------------------------
export function Stagger({
  children,
  stagger = 0.08,
  delay = 0.05,
  className,
  style,
  as: Tag = 'div',
  viewport = LUX_VIEWPORT,
  ...rest
}) {
  const Comp = motion[Tag] || motion.div;
  return (
    <Comp
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// A FadeUp that consumes the parent Stagger's variants (no explicit
// timing - timing comes from the parent staggerChildren).
export function FadeUpItem({
  children,
  y = 16,
  duration = 0.65,
  className,
  style,
  as: Tag = 'div',
  ...rest
}) {
  const reduce = useReducedMotion();
  const Comp = motion[Tag] || motion.div;
  const variants = reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.01 } } }
    : {
        hidden:  { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration, ease: LUX_EASE } },
      };
  return (
    <Comp className={className} style={style} variants={variants} {...rest}>
      {children}
    </Comp>
  );
}

// -----------------------------------------------------------------------------
//  RevealText - wraps a piece of display text and animates a thin clipping
//  mask + slight upward translate, so the type appears to "rise" out of
//  the baseline. Subtle, not a typewriter or letter-by-letter effect.
// -----------------------------------------------------------------------------
export function RevealText({
  children,
  delay = 0,
  duration = 0.85,
  className,
  style,
  as: Tag = 'span',
  viewport = LUX_VIEWPORT,
  ...rest
}) {
  const reduce = useReducedMotion();
  const Comp = motion[Tag] || motion.span;

  if (reduce) {
    return (
      <Comp className={className} style={style} {...rest}>
        {children}
      </Comp>
    );
  }

  return (
    <span
      className={className}
      style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', ...style }}
    >
      <Comp
        style={{ display: 'inline-block', willChange: 'transform, opacity' }}
        initial={{ y: '100%', opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        transition={{ duration, ease: LUX_EASE, delay }}
        viewport={viewport}
        {...rest}
      >
        {children}
      </Comp>
    </span>
  );
}

// -----------------------------------------------------------------------------
//  RevealImage - wraps an <img> (or any media element) and animates a
//  monochrome curtain wipe + subtle scale-down. The curtain pulls away
//  from the bottom, revealing the image as it gently relaxes from a
//  1.06 scale. Editorial, not flashy.
// -----------------------------------------------------------------------------
export function RevealImage({
  children,
  delay = 0,
  duration = 1.05,
  className,
  style,
  curtain = '#0a0a0a',
  viewport = LUX_VIEWPORT,
  ...rest
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={className} style={{ overflow: 'hidden', ...style }} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={{ overflow: 'hidden', ...style }}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      {...rest}
    >
      {/* Image scaling layer */}
      <motion.div
        style={{ width: '100%', height: '100%' }}
        variants={{
          hidden:  { scale: 1.06 },
          visible: { scale: 1 },
        }}
        transition={{ duration: duration + 0.1, ease: LUX_EASE, delay }}
      >
        {children}
      </motion.div>

      {/* Monochrome curtain that wipes upward away from the image */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: curtain,
          transformOrigin: 'top',
          pointerEvents: 'none',
        }}
        variants={{
          hidden:  { scaleY: 1 },
          visible: { scaleY: 0 },
        }}
        transition={{ duration, ease: LUX_EASE, delay }}
      />
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
//  HoverLift - wraps a clickable element and applies a tiny premium hover:
//  -2px translate + extremely subtle opacity nudge. No scale, no shadow
//  bloom (the underlying card handles its own hover shadow if desired).
// -----------------------------------------------------------------------------
export function HoverLift({
  children,
  className,
  style,
  y = -2,
  duration = 0.35,
  as: Tag = 'div',
  ...rest
}) {
  const reduce = useReducedMotion();
  const Comp = motion[Tag] || motion.div;

  if (reduce) {
    return (
      <Comp className={className} style={style} {...rest}>
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      className={className}
      style={style}
      whileHover={{ y }}
      transition={{ duration, ease: LUX_EASE }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// -----------------------------------------------------------------------------
//  PageTransition - wraps a page in a soft cross-fade with AnimatePresence.
//  Used at the App.jsx route-switch site so swapping pages feels like a
//  magazine page turn, not a hard cut.
// -----------------------------------------------------------------------------
export function PageTransition({ keyId, children, ...rest }) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={keyId}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
        transition={reduce
          ? { duration: 0.01 }
          : { duration: 0.45, ease: LUX_EASE }}
        style={{ willChange: 'opacity, transform' }}
        {...rest}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Re-export framer's motion + AnimatePresence so callers don't need a
// second import for ad-hoc one-off animations.
export { motion, AnimatePresence, useReducedMotion };
