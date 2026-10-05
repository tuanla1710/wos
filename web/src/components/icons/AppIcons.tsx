import type { SVGProps } from "react";

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

const fill = { fill: "currentColor", fillOpacity: 0.22 };
const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function HomeGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path {...fill} d="M5 10.4 12 4.6l7 5.8V19a1.6 1.6 0 0 1-1.6 1.6H6.6A1.6 1.6 0 0 1 5 19V10.4Z" />
      <path {...stroke} d="M4.6 11.1 12 4.8l7.4 6.3" />
      <path {...stroke} d="M6.4 10.6V18.6A.9.9 0 0 0 7.3 19.5h9.4a.9.9 0 0 0 .9-.9v-8" />
      <path {...stroke} d="M10 20.2v-4.6h4v4.6" />
    </Svg>
  );
}

export function InboxGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path {...fill} d="M4.4 10.2 6.2 17.4A1.6 1.6 0 0 0 7.8 18.6h8.4a1.6 1.6 0 0 0 1.6-1.2l1.8-7.2H4.4Z" />
      <path {...stroke} d="M4.2 10.4h15.6" />
      <path {...stroke} d="M4.6 10.4 6.4 17.5a1.3 1.3 0 0 0 1.3 1h8.6a1.3 1.3 0 0 0 1.3-1l1.8-7.1" />
      <path {...stroke} d="M8.2 13.6h2.1c.4 1.6 1.3 2.4 2.7 2.4s2.3-.8 2.7-2.4h2.1" />
    </Svg>
  );
}

export function TasksGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <rect {...fill} x="4.4" y="4.4" width="15.2" height="15.2" rx="4" />
      <rect {...stroke} x="4.8" y="4.8" width="14.4" height="14.4" rx="3.6" />
      <path {...stroke} d="M8.2 12.2 10.8 14.8 16 9.4" />
    </Svg>
  );
}

export function CalendarGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <rect {...fill} x="4.2" y="5.8" width="15.6" height="14" rx="3.2" />
      <rect {...stroke} x="4.6" y="6.2" width="14.8" height="13.2" rx="2.8" />
      <path {...stroke} d="M4.6 10.4h14.8" />
      <path {...stroke} d="M8.2 4.6v3.2M15.8 4.6v3.2" />
      <rect x="8" y="13" width="3.1" height="3.1" rx="0.8" fill="currentColor" fillOpacity="0.85" />
    </Svg>
  );
}

export function ReviewGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <circle {...fill} cx="12" cy="12" r="8.2" />
      <path {...stroke} d="M7.1 9.2A6.4 6.4 0 0 1 18.2 11.4" />
      <path {...stroke} d="M16.9 14.8A6.4 6.4 0 0 1 5.8 12.6" />
      <path {...stroke} d="M17.6 7.6v4h-4M6.4 16.4v-4h4" />
    </Svg>
  );
}

export function NotesGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path {...fill} d="M7 4.6h7.2L19.2 9.6V19a1.6 1.6 0 0 1-1.6 1.6H7A1.6 1.6 0 0 1 5.4 19V6.2A1.6 1.6 0 0 1 7 4.6Z" />
      <path {...stroke} d="M14.1 4.8v4.4h4.4" />
      <path {...stroke} d="M7.2 5h6.8L18.8 9.8V18.8A1.2 1.2 0 0 1 17.6 20H7.2A1.2 1.2 0 0 1 6 18.8V6.2A1.2 1.2 0 0 1 7.2 5Z" />
      <path {...stroke} d="M8.8 13h6.4M8.8 16.2h4.4" />
    </Svg>
  );
}

export function TeamGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <circle {...fill} cx="9" cy="9" r="3.1" />
      <circle {...fill} cx="15.4" cy="9.6" r="2.5" />
      <circle {...stroke} cx="9" cy="9" r="2.8" />
      <circle {...stroke} cx="15.4" cy="9.6" r="2.2" />
      <path {...stroke} d="M4.6 18.6c.4-2.8 2.3-4.4 4.4-4.4s4 1.6 4.4 4.4" />
      <path {...stroke} d="M13.2 15.4c.9-1.1 2-1.6 3.2-1.6 1.8 0 3.3 1.2 3.6 3.4" />
    </Svg>
  );
}

export function SettingsGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <rect {...fill} x="4.4" y="4.6" width="15.2" height="14.8" rx="4" />
      <path {...stroke} d="M8 8.2h8M8 12h8M8 15.8h8" />
      <circle cx="14.4" cy="8.2" r="1.35" fill="currentColor" />
      <circle cx="9.6" cy="12" r="1.35" fill="currentColor" />
      <circle cx="13.2" cy="15.8" r="1.35" fill="currentColor" />
    </Svg>
  );
}

export function PinGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path {...fill} d="M8.2 3.8h7.6l-1.2 5.2 2 2.2v1.4H7.4v-1.4l2-2.2L8.2 3.8Z" />
      <path {...stroke} d="M8.4 4h7.2l-1.1 5.1 1.9 2.1v.9H7.6v-.9l1.9-2.1L8.4 4Z" />
      <path {...stroke} d="M12 12.1V20" />
    </Svg>
  );
}

export function FolderGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path
        {...fill}
        d="M4.4 8.2A1.8 1.8 0 0 1 6.2 6.4h4.1l1.6 1.8h6A1.8 1.8 0 0 1 19.7 10v7.4a1.8 1.8 0 0 1-1.8 1.8H6.2A1.8 1.8 0 0 1 4.4 17.4V8.2Z"
      />
      <path
        {...stroke}
        d="M4.6 8.6A1.4 1.4 0 0 1 6 7.2h3.8l1.5 1.7h6.2A1.4 1.4 0 0 1 18.9 10.3v7.1A1.4 1.4 0 0 1 17.5 18.8H6.1A1.5 1.5 0 0 1 4.6 17.3V8.6Z"
      />
    </Svg>
  );
}

export function PlusGlyph({ size = 16, className, boxed = true }: GlyphProps & { boxed?: boolean }) {
  return (
    <Svg size={size} className={className}>
      {boxed && <rect {...fill} x="4.6" y="4.6" width="14.8" height="14.8" rx="4" />}
      <path {...stroke} d="M12 8.2v7.6M8.2 12h7.6" />
    </Svg>
  );
}

export function SearchGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <circle {...fill} cx="11" cy="11" r="6.1" />
      <circle {...stroke} cx="11" cy="11" r="5.7" />
      <path {...stroke} d="M15.4 15.4 19.2 19.2" />
    </Svg>
  );
}

export function BellGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path {...fill} d="M6.4 10.2a5.6 5.6 0 0 1 11.2 0v4.2l1.4 2.2H5L6.4 14.4v-4.2Z" />
      <path {...stroke} d="M6.6 10.4a5.4 5.4 0 0 1 10.8 0v4.1l1.5 2.3H5.1l1.5-2.3v-4.1Z" />
      <path {...stroke} d="M10 18.8a2 2 0 0 0 4 0" />
      <path {...stroke} d="M12 4.6v1.4" />
    </Svg>
  );
}

export function StarGlyph({ size = 16, className, filled }: GlyphProps & { filled?: boolean }) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M12 4.4 13.9 9l5 .4-3.8 3.2 1.2 4.8L12 14.9 7.7 17.4l1.2-4.8L5.1 9.4 10.1 9 12 4.4Z"
        fill="currentColor"
        fillOpacity={filled ? 1 : 0.22}
        stroke="currentColor"
        strokeWidth="1.5"
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
      <path {...fill} d="M12 4.6 20.2 18.8H3.8L12 4.6Z" />
      <path {...stroke} d="M12 5.4 19.4 18.4H4.6L12 5.4Z" />
      <path {...stroke} d="M12 10.2v3.8" />
      <circle cx="12" cy="16.4" r="0.85" fill="currentColor" />
    </Svg>
  );
}

export function SunGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <circle {...fill} cx="12" cy="12" r="4.2" />
      <circle {...stroke} cx="12" cy="12" r="3.8" />
      <path {...stroke} d="M12 4.4v1.7M12 17.9v1.7M4.4 12h1.7M17.9 12h1.7M6.6 6.6l1.2 1.2M16.2 16.2l1.2 1.2M17.4 6.6l-1.2 1.2M7.8 16.2l-1.2 1.2" />
    </Svg>
  );
}

export function StatsGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <rect {...fill} x="4.2" y="4.4" width="15.6" height="15.2" rx="3.2" />
      <path {...stroke} d="M7.2 15.8V11.2M12 15.8V8.2M16.8 15.8v-3.2" />
      <path {...stroke} d="M5.4 18.4h13.2" />
    </Svg>
  );
}

export function ClockGlyph({ size = 16, className }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <circle {...fill} cx="12" cy="12" r="8.1" />
      <circle {...stroke} cx="12" cy="12" r="7.6" />
      <path {...stroke} d="M12 8v4.2l3 2" />
    </Svg>
  );
}

export const iconTones = {
  home: { bg: "transparent", fg: "currentColor" },
  inbox: { bg: "transparent", fg: "currentColor" },
  tasks: { bg: "transparent", fg: "currentColor" },
  calendar: { bg: "transparent", fg: "currentColor" },
  review: { bg: "transparent", fg: "currentColor" },
  stats: { bg: "transparent", fg: "currentColor" },
  notes: { bg: "transparent", fg: "currentColor" },
  team: { bg: "transparent", fg: "currentColor" },
  settings: { bg: "transparent", fg: "currentColor" },
  folder: { bg: "transparent", fg: "currentColor" },
  plus: { bg: "transparent", fg: "currentColor" },
  search: { bg: "transparent", fg: "currentColor" },
  bell: { bg: "transparent", fg: "currentColor" },
  alert: { bg: "transparent", fg: "currentColor" },
  sun: { bg: "transparent", fg: "currentColor" },
  clock: { bg: "transparent", fg: "currentColor" },
  star: { bg: "transparent", fg: "currentColor" },
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
  return (
    <span
      className={`icon-tile inline-flex shrink-0 items-center justify-center ${active ? "icon-tile-active" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      <Glyph size={glyphSize ?? size} />
    </span>
  );
}

export function BrandMark({ size = 24 }: { size?: number }) {
  const inner = Math.round(size * 0.58);
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-[6px] bg-accent text-white"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={inner} height={inner} viewBox="0 0 16 16" fill="none">
        <rect x="2.2" y="2.2" width="11.6" height="11.6" rx="2.4" fill="currentColor" fillOpacity="0.18" />
        <rect x="2.6" y="2.6" width="10.8" height="10.8" rx="2.1" stroke="currentColor" strokeWidth="1.35" />
        <path d="M5 8.15 7.05 10.1 11.1 5.7" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
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
        <p className={`truncate font-semibold tracking-tight text-ink ${large ? "text-xl leading-7" : "text-sm leading-5"}`}>
          Work OS
        </p>
        {subtitle ? <p className="truncate text-[12px] leading-4 text-muted">{subtitle}</p> : null}
      </div>
    </div>
  );
}
