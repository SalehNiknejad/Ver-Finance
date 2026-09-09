import { Inbox } from "lucide-react";

export function LoadingState({
  label = "در حال بارگذاری...",
  showLogo = true,
}: {
  label?: string;
  showLogo?: boolean;
}) {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="flex flex-col items-center gap-6">
        {showLogo && (
          <img
            src="/logo-gif.gif"
            alt="درحال بارگذاری"
            className="size-40 rounded-3xl shadow-lg"
          />
        )}
        <p className="text-center text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-linear-to-b from-[#0b0d10] to-surface">
      <img
        src="/logo-gif.gif"
        alt="ورتو فایننس"
        className="mb-6 size-48 rounded-3xl shadow-2xl"
      />
      <h1 className="text-2xl font-extrabold text-white">ورتو فایننس</h1>
      <p className="mt-2 text-sm text-slate-400">مدیریت مالی، ساده و روشن</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed p-8 text-center">
      <div>
        <Inbox className="mx-auto mb-3 size-9 text-slate-400" />
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
