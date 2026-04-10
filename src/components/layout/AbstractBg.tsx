export default function AbstractBg() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-background"
      aria-hidden
    >
      {/* Cartesian minor grid */}
      <div
        className="absolute inset-0 build-grid-drift opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(rgba(91, 143, 199, 0.9) 1px, transparent 1px),
            linear-gradient(90deg, rgba(91, 143, 199, 0.9) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Major structural grid */}
      <div
        className="absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage: `linear-gradient(rgba(91, 143, 199, 0.95) 1px, transparent 1px),
            linear-gradient(90deg, rgba(91, 143, 199, 0.95) 1px, transparent 1px)`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* Isometric triangle mesh (60° / 120°) */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `repeating-linear-gradient(
              60deg,
              transparent,
              transparent 22px,
              rgba(184, 230, 50, 0.12) 22px,
              rgba(184, 230, 50, 0.12) 23px
            ),
            repeating-linear-gradient(
              -60deg,
              transparent,
              transparent 22px,
              rgba(91, 143, 199, 0.14) 22px,
              rgba(91, 143, 199, 0.14) 23px
            )`,
        }}
      />

      {/* Diagonal hazard rhythm */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          background: `repeating-linear-gradient(
            -42deg,
            transparent,
            transparent 18px,
            rgba(232, 147, 58, 0.35) 18px,
            rgba(232, 147, 58, 0.35) 19px
          )`,
        }}
      />

      {/* Orthogonal construction cross — center */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-accent-blue/10 -translate-x-1/2" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-accent-blue/10 -translate-y-1/2" />

      {/* Parallelogram frames */}
      <div
        className="absolute -right-8 top-[18%] w-48 h-28 border border-accent-blue/15 skew-x-[-12deg]"
        style={{ transformOrigin: "center" }}
      />
      <div
        className="absolute -right-4 top-[20%] w-48 h-28 border border-accent-purple/12 skew-x-[-12deg]"
        style={{ transformOrigin: "center" }}
      />

      {/* Corner brackets */}
      <div className="absolute top-16 left-8 w-20 h-20 border-l-2 border-t-2 border-accent-cyan/22" />
      <div className="absolute top-16 right-8 w-20 h-20 border-r-2 border-t-2 border-accent-blue/22" />
      <div className="absolute bottom-24 left-10 w-24 h-24 border-l-2 border-b-2 border-accent-purple/20" />
      <div className="absolute bottom-20 right-12 w-28 h-28 border-r-2 border-b-2 border-accent-blue/18" />

      {/* Nested squares */}
      <div className="absolute top-[22%] right-[22%] w-32 h-32 border border-accent-purple/10" />
      <div className="absolute top-[24%] right-[23%] w-24 h-24 border border-accent-cyan/12 rotate-45" />

      {/* Triangle + diamond */}
      <div
        className="absolute top-[36%] left-[10%] w-0 h-0 opacity-45 animate-float"
        style={{
          borderLeft: "16px solid transparent",
          borderRight: "16px solid transparent",
          borderBottom: "28px solid rgba(184, 230, 50, 0.22)",
        }}
      />
      <div className="absolute bottom-[30%] right-[16%] w-20 h-20 border-2 border-accent-purple/18 rotate-45 animate-float-delayed" />

      {/* Hex-ish outline from two offset rectangles */}
      <div className="absolute bottom-[40%] left-[6%] w-36 h-20 border border-accent-blue/12 -rotate-6" />
      <div className="absolute bottom-[38%] left-[7%] w-36 h-20 border border-accent-cyan/10 rotate-3" />

      {/* Bottom measure rail */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-25"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            rgba(230, 233, 239, 0.55) 0,
            rgba(230, 233, 239, 0.55) 1px,
            transparent 1px,
            transparent 20px
          )`,
        }}
      />
    </div>
  );
}
