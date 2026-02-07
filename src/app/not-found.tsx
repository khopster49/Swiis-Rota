import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-swiis-orange/10 p-5 rounded-full mb-5">
        <span className="material-symbols-outlined text-5xl text-swiis-orange">search_off</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        href="/"
        className="bg-swiis-orange text-white px-6 py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-transform shadow-lg shadow-orange-500/20 inline-flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-base">home</span>
        Back to Dashboard
      </Link>
    </div>
  );
}
