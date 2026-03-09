import { getLevelInfo } from '../lib/auth';

export default function XPBar({ xp, showLabel = true, className = '' }) {
  const info = getLevelInfo(xp || 0);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className={`text-xs font-bold ${info.color}`}>
            Lv.{info.level} {info.name}
          </span>
          <span className="text-xs text-gray-400">{xp || 0} XP</span>
        </div>
      )}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-yellow-500 rounded-full transition-all duration-1000"
          style={{ width: `${Math.min(info.progress, 100)}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-0.5">
          <span className="text-xs text-gray-600">{info.minXP}</span>
          <span className="text-xs text-gray-600">{info.maxXP}</span>
        </div>
      )}
    </div>
  );
}