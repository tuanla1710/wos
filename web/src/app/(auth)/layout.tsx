import { APP_NAME, APP_VERSION, copyrightLine } from "@/lib/appInfo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-canvas relative min-h-screen">
      {children}
      <p className="pointer-events-none absolute inset-x-0 bottom-6 px-4 text-center text-[12px] text-muted">
        {copyrightLine}
        <span className="mt-1 block tabular-nums">
          {APP_NAME} {APP_VERSION}
        </span>
      </p>
    </div>
  );
}
