export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50 text-slate-800">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Universal CMS & Design-to-Code Framework
        </h1>
        <p className="text-sm text-slate-600">
          Core starter template active. Ingest a visual screenshot or Figma node to begin building client modules.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <a
            href="http://localhost:4040"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Launch Visual Annotator
          </a>
        </div>
      </div>
    </main>
  );
}
