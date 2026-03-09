import { motion } from 'framer-motion';

export default function TabSwitcher({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`flex border-b border-orange-100 ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 py-3 text-sm relative transition-colors ${active === tab.key ? 'text-orange-primary font-bold' : 'text-gray-400'}`}>
          {tab.label}
          {active === tab.key && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
              style={{ background: 'linear-gradient(90deg, #FF7A00, #FFA94D)' }}
            />
          )}
        </button>
      ))}
    </div>
  );
}