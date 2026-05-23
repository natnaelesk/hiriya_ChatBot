import { motion as Motion } from 'framer-motion';
import SectionLabel from './ui/SectionLabel.jsx';
import Card from './ui/Card.jsx';
import HeroGraphic from './HeroGraphic.jsx';

const PROMPT_CHIPS = [
  'Where is the main campus?',
  'What undergraduate programs do you offer?',
  'How do I apply for admission?',
  'Tell me about student housing.',
  'What dining options are on campus?',
  'Where is the library and what hours?',
];

const easeOut = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

export default function WelcomeScreen({ onPick }) {
  return (
    <div className="relative overflow-hidden">
      <div className="mm-ambient-glow -right-32 top-0 h-72 w-72" />
      <div className="mm-ambient-glow -left-24 bottom-32 h-64 w-64" />

      <Motion.div
        className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:pt-14 lg:pb-20"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="text-center lg:text-left">
            <Motion.div variants={fadeUp} className="mb-6 flex justify-center lg:justify-start">
              <SectionLabel>Ambo University · AI Guide</SectionLabel>
            </Motion.div>

            <Motion.h1
              variants={fadeUp}
              className="font-display text-[2.75rem] font-normal leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]"
            >
              Ask{' '}
              <span className="relative inline-block">
                <span className="mm-gradient-text">Hiriya</span>
                <span className="mm-gradient-underline" aria-hidden="true" />
              </span>
            </Motion.h1>

            <Motion.p
              variants={fadeUp}
              className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg lg:mx-0"
            >
              Your intelligent guide to <strong className="font-semibold text-[var(--foreground)]">Ambo University</strong>
              — campuses, programs, admissions, and student life, answered with clarity.
            </Motion.p>

            <Motion.div variants={fadeUp} className="mt-8 hidden items-center justify-center gap-6 sm:flex">
              <div className="text-left">
                <div className="font-display text-2xl text-[var(--foreground)]">24/7</div>
                <div className="text-xs text-[var(--muted-foreground)]">Always available</div>
              </div>
              <div className="h-10 w-px bg-[var(--border)]" />
              <div className="text-left">
                <div className="font-display text-2xl text-[var(--foreground)]">KB + Web</div>
                <div className="text-xs text-[var(--muted-foreground)]">Verified sources</div>
              </div>
            </Motion.div>
          </div>

          <Motion.div variants={fadeUp} className="hidden lg:block">
            <HeroGraphic />
          </Motion.div>
        </div>

        <Motion.div variants={fadeUp} className="mt-14">
          <p className="mb-4 text-center font-mono-ui text-xs uppercase tracking-[0.15em] text-[var(--muted-foreground)] lg:text-left">
            Try asking
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROMPT_CHIPS.map((label, i) => (
              <Motion.div key={label} variants={fadeUp}>
                <button
                  type="button"
                  onClick={() => onPick?.(label)}
                  className="group w-full text-left"
                >
                  <Card className="flex min-h-[88px] flex-col justify-center px-5 py-4 transition-transform duration-300 hover:-translate-y-0.5">
                    <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] text-xs font-bold text-white shadow-[var(--shadow-accent)] transition-transform duration-300 group-hover:scale-110">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-semibold leading-snug text-[var(--foreground)]">{label}</span>
                  </Card>
                </button>
              </Motion.div>
            ))}
          </div>
        </Motion.div>
      </Motion.div>
    </div>
  );
}
