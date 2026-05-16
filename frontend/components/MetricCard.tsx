type MetricCardProps = {
  label: string;
  value: string | number;
  detail: string;
  tone?: "neutral" | "accent" | "warning" | "danger";
};

const toneClasses = {
  neutral: "border-white/5 bg-slate-900/40",
  accent: "border-blue-500/10 bg-blue-500/[0.02]",
  warning: "border-amber-500/10 bg-amber-500/[0.02]",
  danger: "border-rose-500/10 bg-rose-500/[0.02]"
};

const labelToneClasses = {
  neutral: "text-slate-500",
  accent: "text-blue-400/80",
  warning: "text-amber-500/80",
  danger: "text-rose-400/80"
};

export function MetricCard({ label, value, detail, tone = "neutral" }: MetricCardProps) {
  return (
    <div className={`p-5 rounded-md transition-all hover:bg-slate-800/40 cursor-default border ${toneClasses[tone]}`}>
      <div className={`text-[10px] font-semibold uppercase tracking-widest ${labelToneClasses[tone]}`}>
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-100 font-mono">
        {value}
      </div>
      <div className="mt-2 text-xs leading-relaxed text-slate-500 font-medium">
        {detail}
      </div>
    </div>
  );
}
