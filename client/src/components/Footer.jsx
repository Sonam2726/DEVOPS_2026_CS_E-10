function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">

          <div>
            <h2 className="text-lg font-bold text-indigo-600">
              SkillBridge AI
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Learn. Teach. Connect.
            </p>
          </div>

          <p className="text-sm text-slate-500">
            © 2026 SkillBridge AI. All rights reserved.
          </p>

        </div>

      </div>
    </footer>
  );
}

export default Footer;