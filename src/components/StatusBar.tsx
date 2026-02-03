'use client';

interface StatusBarProps {
  money: number;
  day: number;
  hour: number;
  minute: number;
  inmateCount: number;
  staffCount: number;
  paused: boolean;
}

export default function StatusBar({
  money,
  day,
  hour,
  minute,
  inmateCount,
  staffCount,
  paused
}: StatusBarProps) {
  const formatTime = () => {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const formatMoney = () => {
    if (money < 0) {
      return `-$${Math.abs(money).toLocaleString()}`;
    }
    return `$${money.toLocaleString()}`;
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white border-b border-gray-700">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Day</span>
          <span className="font-bold text-lg">{day}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Time</span>
          <span className="font-mono text-lg">{formatTime()}</span>
        </div>
        
        <div className={`flex items-center gap-2 ${money < 0 ? 'text-red-400' : 'text-green-400'}`}>
          <span className="font-bold text-lg">{formatMoney()}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Inmates</span>
          <span className="font-bold text-orange-400">{inmateCount}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Staff</span>
          <span className="font-bold text-blue-400">{staffCount}</span>
        </div>
        
        {paused && (
          <span className="px-2 py-1 bg-yellow-600 text-black font-bold rounded text-sm">
            PAUSED
          </span>
        )}
      </div>
    </div>
  );
}
