export function GradientFooter() {
  return (
    <footer className="sticky bottom-0 z-40 w-full border-t-2 border-blue-500/50 dark:border-blue-400/50 bg-gradient-to-r from-blue-500/10 via-blue-600/10 to-blue-700/10 dark:from-blue-500/20 dark:via-blue-600/20 dark:to-blue-700/20 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-lg shadow-blue-500/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col gap-2">
          {/* Main Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                © {new Date().getFullYear()} Route Management System
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-500">
                Powered by FamilyMart
              </span>
            </div>
          </div>
          
          {/* Feature Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[9px] text-slate-500 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Route Optimization
            </span>
            <div className="w-1 h-1 bg-slate-400/50 rounded-full"></div>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Real-time Tracking
            </span>
            <div className="w-1 h-1 bg-slate-400/50 rounded-full"></div>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              Data Analytics
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
