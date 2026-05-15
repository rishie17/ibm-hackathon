type MetricCardProps = {
  label: string;
  value: string | number;
  detail: string;
  tone?: "neutral" | "accent" | "warning" | "danger";
};

const toneClasses = {
  neutral: "border-slate-700/70 bg-slate-950/40",
  accent: "border-teal-300/30 bg-teal-300/10",
  warning: "border-amber-300/30 bg-amber-300/10",
  danger: "border-rose-300/30 bg-rose-300/10"
};

export function MetricCard({ label, value, detail, tone = "neutral" }: MetricCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${toneClasses[tone]}`}>
      <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-sm leading-5 text-slate-400">{detail}</div>
    </div>
  );
}

