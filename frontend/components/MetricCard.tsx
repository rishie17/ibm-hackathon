type MetricCardProps = {
  label: string;
  value: string | number;
  detail: string;
  tone?: "neutral" | "accent" | "warning" | "danger";
};

const toneClasses = {
  neutral: "border-white/5 bg-white/[0.02]",
  accent: "border-teal-500/20 bg-teal-500/[0.03]",
  warning: "border-warning/20 bg-warning/[0.03]",
  danger: "border-danger/20 bg-danger/[0.03]"
};

const labelToneClasses = {
  neutral: "text-slate-500",
  accent: "text-teal-400/80",
  warning: "text-warning/80",
  danger: "text-danger/80"
};

export function MetricCard({ label, value, detail, tone = "neutral" }: MetricCardProps) {
  return (
    <div className={`glass-panel p-6 transition-all hover:scale-[1.02] hover:bg-white/[0.05] cursor-default ${toneClasses[tone]}`}>
      <div className={`text-[10px] font-bold uppercase tracking-[0.25em] ${labelToneClasses[tone]}`}>
        {label}
      </div>
      <div className="mt-4 text-4xl font-bold tracking-tight text-white font-mono">
        {value}
      </div>
      <div className="mt-3 text-sm leading-relaxed text-slate-500 font-medium">
        {detail}
      </div>
    </div>
  );
}
