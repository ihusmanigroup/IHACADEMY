export default function IHLoader() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#07090e] backdrop-blur-md flex items-center justify-center transition-colors duration-300">
      <div className="flex flex-col items-center gap-5">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl animate-pulse shadow-[0_0_30px_rgba(6,182,212,0.4)]">
          IH
        </div>
        <p className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 bg-clip-text text-transparent text-xl font-extrabold tracking-tight">
          IH Academy
        </p>
        <div className="w-40 h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 animate-[ih-progress_1.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  )
}
