import { useId, type SVGProps } from "react";

type GlyphProps = { size?: number; className?: string };

function Svg({ size = 16, className, children, ...rest }: GlyphProps & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

const fill = { fill: "currentColor", fillOpacity: 0.18 };
const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function HomeGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path {...fill} d="M5 10.6 12 4.8l7 5.8V19a1.7 1.7 0 0 1-1.7 1.7H6.7A1.7 1.7 0 0 1 5 19V10.6Z" />
      <path {...stroke} d="M4.5 11 12 4.6 19.5 11" />
      <path {...stroke} d="M6.6 10.4V18.4A1 1 0 0 0 7.6 19.4h8.8a1 1 0 0 0 1-1V10.4" />
      <path {...stroke} d="M10.1 19.4v-4.4h3.8v4.4" />
    </Svg>
  );
}

export function InboxGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path {...fill} d="M4.2 10.6 6.2 17.6A1.7 1.7 0 0 0 7.9 19h8.2a1.7 1.7 0 0 0 1.7-1.4l2-6Z" />
      <path {...stroke} d="M4.4 10.6h15.2" />
      <path {...stroke} d="M4.8 10.6 6.7 17.5a1.2 1.2 0 0 0 1.2.9h8.2a1.2 1.2 0 0 0 1.2-.9l1.9-6.9" />
      <path {...stroke} d="M8.4 13.8h1.8c.45 1.55 1.4 2.35 2.8 2.35s2.35-.8 2.8-2.35h1.8" />
    </Svg>
  );
}

export function TasksGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <rect {...fill} x="4.5" y="4.5" width="15" height="15" rx="3.8" />
      <rect {...stroke} x="5" y="5" width="14" height="14" rx="3.4" />
      <path {...stroke} d="M8.4 12.2 10.9 14.7 15.8 9.4" />
    </Svg>
  );
}

export function CalendarGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <rect {...fill} x="4.3" y="6" width="15.4" height="13.6" rx="3" />
      <rect {...stroke} x="4.7" y="6.4" width="14.6" height="12.8" rx="2.6" />
      <path {...stroke} d="M4.7 10.4h14.6" />
      <path {...stroke} d="M8.2 4.6v3.4M15.8 4.6v3.4" />
      <rect x="8.1" y="13.1" width="2.8" height="2.8" rx="0.7" fill="currentColor" />
    </Svg>
  );
}

export function ReviewGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <circle {...fill} cx="12" cy="12" r="8" />
      <path {...stroke} d="M7.2 9.1a6.3 6.3 0 0 1 10.8 2.4" />
      <path {...stroke} d="M16.8 14.9A6.3 6.3 0 0 1 6 12.5" />
      <path {...stroke} d="M17.4 7.4v3.8h-3.8M6.6 16.6v-3.8h3.8" />
    </Svg>
  );
}

export function NotesGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path {...fill} d="M7.1 4.6h6.8L19 9.7V18.8A1.6 1.6 0 0 1 17.4 20.4H7.1A1.6 1.6 0 0 1 5.5 18.8V6.2A1.6 1.6 0 0 1 7.1 4.6Z" />
      <path {...stroke} d="M13.8 4.8v4.2h4.3" />
      <path {...stroke} d="M7.2 5.1h6.4L18.4 10v8.7A1.1 1.1 0 0 1 17.3 19.8H7.2A1.1 1.1 0 0 1 6.1 18.7V6.2A1.1 1.1 0 0 1 7.2 5.1Z" />
      <path {...stroke} d="M8.8 13.2h6.2M8.8 16.2h4.2" />
    </Svg>
  );
}

export function TeamGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <circle {...fill} cx="9" cy="8.8" r="3" />
      <circle {...fill} cx="15.5" cy="9.4" r="2.4" />
      <circle {...stroke} cx="9" cy="8.8" r="2.7" />
      <circle {...stroke} cx="15.5" cy="9.4" r="2.1" />
      <path {...stroke} d="M4.7 18.6c.35-2.7 2.2-4.2 4.3-4.2s3.95 1.5 4.3 4.2" />
      <path {...stroke} d="M13.3 15.3c.85-1 1.95-1.5 3.15-1.5 1.75 0 3.2 1.15 3.5 3.3" />
    </Svg>
  );
}

export function SettingsGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <circle {...fill} cx="12" cy="12" r="8" />
      <circle {...stroke} cx="12" cy="12" r="2.35" />
      <path
        {...stroke}
        d="M12 5.1v1.7M12 17.2v1.7M5.1 12h1.7M17.2 12h1.7M7.05 7.05l1.2 1.2M15.75 15.75l1.2 1.2M16.95 7.05l-1.2 1.2M8.25 15.75l-1.2 1.2"
      />
    </Svg>
  );
}

export function PinGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path {...fill} d="M8.3 3.8h7.4l-1.15 5.1 1.95 2.15v1.35H7.5v-1.35l1.95-2.15L8.3 3.8Z" />
      <path {...stroke} d="M8.5 4.1h7l-1.1 5 1.9 2.05v.75H7.7v-.75l1.9-2.05L8.5 4.1Z" />
      <path {...stroke} d="M12 12.1V20" />
    </Svg>
  );
}

export function FolderGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path
        {...fill}
        d="M4.4 8.3A1.7 1.7 0 0 1 6.1 6.6h4l1.55 1.75h6A1.7 1.7 0 0 1 19.35 10v7.3a1.7 1.7 0 0 1-1.7 1.7H6.1A1.7 1.7 0 0 1 4.4 17.3V8.3Z"
      />
      <path
        {...stroke}
        d="M4.7 8.6A1.3 1.3 0 0 1 6 7.3h3.7l1.45 1.65h6.1A1.3 1.3 0 0 1 18.55 10.25v7A1.3 1.3 0 0 1 17.25 18.55H6.05A1.35 1.35 0 0 1 4.7 17.2V8.6Z"
      />
    </Svg>
  );
}

export function PlusGlyph({ size = 16, className, boxed = true }: GlyphProps & { boxed?: boolean }) {
  return (
    <Svg size={size} className={className}>
      {boxed && <rect {...fill} x="4.7" y="4.7" width="14.6" height="14.6" rx="3.8" />}
      <path {...stroke} d="M12 8.3v7.4M8.3 12h7.4" />
    </Svg>
  );
}

export function SearchGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <circle {...fill} cx="11" cy="11" r="6" />
      <circle {...stroke} cx="11" cy="11" r="5.5" />
      <path {...stroke} d="M15.5 15.5 19.1 19.1" />
    </Svg>
  );
}

export function BellGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path {...fill} d="M6.5 10.3a5.5 5.5 0 0 1 11 0v4l1.35 2.15H5.15L6.5 14.3v-4Z" />
      <path {...stroke} d="M6.7 10.4a5.3 5.3 0 0 1 10.6 0v4l1.4 2.2H5.3l1.4-2.2v-4Z" />
      <path {...stroke} d="M10.1 18.7a1.9 1.9 0 0 0 3.8 0" />
      <path {...stroke} d="M12 4.7v1.3" />
    </Svg>
  );
}

export function StarGlyph({ size = 16, className, filled }: GlyphProps & { filled?: boolean }) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M12 4.5 13.85 9.05l4.95.4-3.75 3.15 1.15 4.75L12 14.85 7.8 17.35l1.15-4.75-3.75-3.15 4.95-.4L12 4.5Z"
        fill="currentColor"
        fillOpacity={filled ? 1 : 0.18}
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function GripGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      {[8, 12, 16].flatMap((y) =>
        [9, 15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.15" fill="currentColor" fillOpacity="0.7" />),
      )}
    </Svg>
  );
}

export function ChevronLeftGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path {...stroke} d="M14.2 5.8 8.4 12l5.8 6.2" />
    </Svg>
  );
}

export function ChevronRightGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path {...stroke} d="M9.8 5.8 15.6 12l-5.8 6.2" />
    </Svg>
  );
}

export function ArrowLeftGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path {...stroke} d="M11.2 6.2 5.6 12l5.6 5.8M5.8 12h12.6" />
    </Svg>
  );
}

export function ArrowRightGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path {...stroke} d="M12.8 6.2 18.4 12l-5.6 5.8M18.2 12H5.6" />
    </Svg>
  );
}

export function AlertGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path {...fill} d="M12 4.7 20.1 18.7H3.9L12 4.7Z" />
      <path {...stroke} d="M12 5.6 19.2 18.3H4.8L12 5.6Z" />
      <path {...stroke} d="M12 10.3v3.7" />
      <circle cx="12" cy="16.35" r="0.85" fill="currentColor" />
    </Svg>
  );
}

export function SunGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <circle {...fill} cx="12" cy="12" r="4.1" />
      <circle {...stroke} cx="12" cy="12" r="3.7" />
      <path {...stroke} d="M12 4.5v1.6M12 17.9v1.6M4.5 12h1.6M17.9 12h1.6M6.7 6.7l1.15 1.15M16.15 16.15l1.15 1.15M17.3 6.7l-1.15 1.15M7.85 16.15 6.7 17.3" />
    </Svg>
  );
}

export function StatsGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <rect {...fill} x="4.3" y="4.5" width="15.4" height="15" rx="3.2" />
      <path {...stroke} d="M8 16V11.1M12 16V8.4M16 16v-3.2" />
      <path {...stroke} d="M5.6 18.2h12.8" />
    </Svg>
  );
}

export function ClockGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <circle {...fill} cx="12" cy="12" r="8" />
      <circle {...stroke} cx="12" cy="12" r="7.5" />
      <path {...stroke} d="M12 8.1v4.1l2.9 1.9" />
    </Svg>
  );
}

export const iconTones = {
  home: { bg: "#D5DEEA", fg: "#1B365D" },
  inbox: { bg: "#C9E4FC", fg: "#175CD3" },
  tasks: { bg: "#C8EFD8", fg: "#067647" },
  calendar: { bg: "#C9E4FC", fg: "#175CD3" },
  review: { bg: "#D5DEEA", fg: "#1B365D" },
  stats: { bg: "#C5E6F5", fg: "#075985" },
  notes: { bg: "#E4E0D6", fg: "#1B365D" },
  team: { bg: "#C9E4FC", fg: "#175CD3" },
  settings: { bg: "#E4E0D6", fg: "#44403C" },
  folder: { bg: "#F8D5C8", fg: "#9A3412" },
  plus: { bg: "#D5DEEA", fg: "#1B365D" },
  search: { bg: "#E4E0D6", fg: "#44403C" },
  bell: { bg: "#E4E0D6", fg: "#44403C" },
  alert: { bg: "#F8D0CC", fg: "#B42318" },
  sun: { bg: "#F8D5C8", fg: "#C4320A" },
  clock: { bg: "#C9E4FC", fg: "#175CD3" },
  star: { bg: "#D5DEEA", fg: "#1B365D" },
} as const;

export type IconName = keyof typeof iconTones;

const glyphs = {
  home: HomeGlyph,
  inbox: InboxGlyph,
  tasks: TasksGlyph,
  calendar: CalendarGlyph,
  review: ReviewGlyph,
  stats: StatsGlyph,
  notes: NotesGlyph,
  team: TeamGlyph,
  settings: SettingsGlyph,
  folder: FolderGlyph,
  plus: PlusGlyph,
  search: SearchGlyph,
  bell: BellGlyph,
  alert: AlertGlyph,
  sun: SunGlyph,
  clock: ClockGlyph,
  star: StarGlyph,
} as const;

export function IconTile({
  name,
  active,
  size = 22,
  glyphSize,
  className = "",
}: {
  name: IconName;
  active?: boolean;
  size?: number;
  glyphSize?: number;
  className?: string;
}) {
  const Glyph = glyphs[name];
  const tone = iconTones[name];
  const mark = glyphSize ?? Math.max(14, Math.round(size * 0.72));
  return (
    <span
      className={`icon-tile inline-flex shrink-0 items-center justify-center ${active ? "icon-tile-active" : ""} ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: tone.bg,
        color: tone.fg,
        boxShadow: `inset 0 0 0 1px ${tone.fg}${active ? "40" : "22"}`,
      }}
    >
      <Glyph size={mark} />
    </span>
  );
}

export function BrandMark({ size = 24 }: { size?: number }) {
  const gid = useId().replace(/:/g, "");
  const radius = Math.max(6, Math.round(size * 0.26));
  return (
    <span
      className="brand-mark inline-flex shrink-0 items-center justify-center text-white"
      style={{ width: size, height: size, borderRadius: radius }}
      aria-hidden
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id={`wos-${gid}`} x1="4" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2C5282" />
            <stop offset="1" stopColor="#12243F" />
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6.5" fill={`url(#wos-${gid})`} />
        <rect x="1" y="1" width="22" height="22" rx="5.6" stroke="white" strokeOpacity="0.18" />
        <path d="M5.2 8.1h13.6" stroke="white" strokeOpacity="0.28" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="7.1" cy="8.1" r="0.7" fill="white" fillOpacity="0.55" />
        <circle cx="9.2" cy="8.1" r="0.7" fill="white" fillOpacity="0.38" />
        <path
          d="M7.6 13.15 10.35 15.8 16.55 9.15"
          stroke="white"
          strokeWidth="2.05"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function BrandLockup({
  size = 24,
  large = false,
  subtitle,
}: {
  size?: number;
  large?: boolean;
  subtitle?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <BrandMark size={size} />
      <div className="min-w-0">
        <p className={`truncate font-semibold tracking-tight ${large ? "text-xl leading-7" : "text-sm leading-5"}`}>
          <span className="text-ink">Work</span>
          <span className="text-accent"> OS</span>
        </p>
        {subtitle ? <p className="truncate text-[12px] leading-4 text-muted">{subtitle}</p> : null}
      </div>
    </div>
  );
}
