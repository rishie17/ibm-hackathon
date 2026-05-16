import { motion } from "framer-motion";

type AegisDomainData = {
  label: string;
};

export function AegisDomain({ data }: { data: AegisDomainData }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full border border-stone-800/30 bg-stone-900/10 rounded-2xl p-6"
    >
      <div className="editorial-label text-stone-500 opacity-60 tracking-[0.3em] mb-4">
        {data.label}
      </div>
    </motion.div>
  );
}
