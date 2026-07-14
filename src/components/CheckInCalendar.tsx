import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Flame, 
  Check, 
  Award, 
  Sparkles,
  Lock
} from 'lucide-react';

interface CheckInCalendarProps {
  cardId: number;
  cardTitle: string;
  checkInDates?: string[];
  onCheckInDatesChange?: (dates: string[]) => void;
  readOnly?: boolean;
  checkInQuote?: string;
}

export function CheckInCalendar({ 
  cardId, 
  cardTitle, 
  checkInDates: propCheckInDates, 
  onCheckInDatesChange,
  readOnly = false,
  checkInQuote
}: CheckInCalendarProps) {
  // Get current date details
  const today = new Date();
  const todayStr = formatDateString(today);

  // Calendar view state (year and month)
  const [viewDate, setViewDate] = useState<Date>(new Date());
  
  // Local state as a fallback if propCheckInDates is not provided
  const [localCheckInDates, setLocalCheckInDates] = useState<string[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [totalCheckIns, setTotalCheckIns] = useState<number>(0);

  // Resolve which check-in dates to use
  const activeCheckInDates = propCheckInDates !== undefined ? propCheckInDates : localCheckInDates;

  // Load local check-in data ONLY if not controlled by props
  useEffect(() => {
    if (propCheckInDates === undefined) {
      const saved = localStorage.getItem(`alphaqubit_checkin_dates_${cardId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setLocalCheckInDates(parsed);
            return;
          }
        } catch (e) {
          console.error("Failed to parse check-in dates", e);
        }
      }
      setLocalCheckInDates([]);
    }
  }, [cardId, propCheckInDates]);

  // Re-calculate streak and stats whenever activeCheckInDates changes
  useEffect(() => {
    calculateStreakAndStats(activeCheckInDates);
  }, [activeCheckInDates]);

  // Format date to local YYYY-MM-DD
  function formatDateString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Calculate check-in streak and total count
  function calculateStreakAndStats(dates: string[]) {
    setTotalCheckIns(dates.length);
    if (dates.length === 0) {
      setStreak(0);
      return;
    }

    const checkInSet = new Set(dates);

    // Get today and yesterday
    const d = new Date();
    const tStr = formatDateString(d);
    
    d.setDate(d.getDate() - 1);
    const yStr = formatDateString(d);

    let checkDateStr = "";
    
    // If today is checked in, start counting from today.
    // If not, but yesterday is checked in, start counting from yesterday.
    if (checkInSet.has(tStr)) {
      checkDateStr = tStr;
    } else if (checkInSet.has(yStr)) {
      checkDateStr = yStr;
    } else {
      setStreak(0);
      return;
    }

    const tempDate = new Date(checkDateStr);
    let currentStreak = 0;
    while (true) {
      const formatted = formatDateString(tempDate);
      if (checkInSet.has(formatted)) {
        currentStreak++;
        // Go back 1 day
        tempDate.setDate(tempDate.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  }

  // Toggle check-in status for a specific date string
  const toggleCheckIn = (dateStr: string) => {
    if (readOnly) return;

    let updated: string[];
    if (activeCheckInDates.includes(dateStr)) {
      updated = activeCheckInDates.filter(d => d !== dateStr);
    } else {
      updated = [...activeCheckInDates, dateStr];
    }

    if (propCheckInDates !== undefined) {
      if (onCheckInDatesChange) {
        onCheckInDatesChange(updated);
      }
    } else {
      setLocalCheckInDates(updated);
      localStorage.setItem(`alphaqubit_checkin_dates_${cardId}`, JSON.stringify(updated));
    }
  };

  // Switch month helper
  const adjustMonth = (offset: number) => {
    setViewDate(prev => {
      const newD = new Date(prev.getFullYear(), prev.getMonth() + offset, 1);
      return newD;
    });
  };

  // Calendar calculation helpers
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth(); // 0-indexed

  // Days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // First day of current month weekday (0 = Sun, 1 = Mon, etc.)
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Month labels
  const monthNames = [
    "1月 (JANUARY)", "2月 (FEBRUARY)", "3月 (MARCH)", "4月 (APRIL)",
    "5月 (MAY)", "6月 (JUNE)", "7月 (JULY)", "8月 (AUGUST)",
    "9月 (SEPTEMBER)", "10月 (OCTOBER)", "11月 (NOVEMBER)", "12月 (DECEMBER)"
  ];

  // Weekdays header
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  // Generate calendar cells (padding + active days)
  const cells: { dateStr: string; day: number; isPadding: boolean }[] = [];
  
  // Padding cells before the first day
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push({ dateStr: "", day: 0, isPadding: true });
  }

  // Days in current month
  for (let d = 1; d <= daysInMonth; d++) {
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    const fullDateStr = `${currentYear}-${mStr}-${dStr}`;
    cells.push({ dateStr: fullDateStr, day: d, isPadding: false });
  }

  const isTodayCheckedIn = activeCheckInDates.includes(todayStr);

  return (
    <div id={`checkin-panel-${cardId}`} className="w-full mt-6 bg-zinc-900/60 border border-zinc-850 rounded-2xl p-5 text-left relative overflow-hidden backdrop-blur-sm">
      {/* Visual background gradient accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
      
      {/* Header section with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-white text-xs font-bold tracking-wide uppercase font-sans">
                每日修炼打卡记录 (Check-In Logs)
              </h4>
              {readOnly && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-zinc-800 text-[8px] text-zinc-400 rounded-md font-sans border border-zinc-750 font-bold">
                  <Lock className="w-2 h-2 text-zinc-500" /> 只读
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
              {readOnly 
                ? "本打卡计划由管理后台确认录入。记录今日努力成果！" 
                : "点击日历中任意日期即可进行卡片签到与日常管理 (后台状态)"}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex items-center gap-3.5">
          {/* Total */}
          <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-xl px-3 py-1.5 text-center min-w-[70px]">
            <span className="text-[9px] text-zinc-500 font-bold block leading-none">累计打卡</span>
            <span className="text-sm font-mono font-black text-emerald-400 block mt-1 leading-none">
              {totalCheckIns} <span className="text-[9px] font-sans font-normal text-zinc-400">天</span>
            </span>
          </div>

          {/* Streak */}
          <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-xl px-3 py-1.5 text-center min-w-[70px] flex flex-col justify-center items-center">
            <span className="text-[9px] text-zinc-500 font-bold block leading-none flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 text-orange-500 animate-pulse" /> 连续签到
            </span>
            <span className="text-sm font-mono font-black text-orange-400 block mt-1 leading-none">
              {streak} <span className="text-[9px] font-sans font-normal text-zinc-400">天</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Side: Interactive Calendar Grid */}
        <div className="md:col-span-7 space-y-3">
          {/* Month Controller */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono font-extrabold text-zinc-200 tracking-wider">
              {currentYear}年 {monthNames[currentMonth]}
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => adjustMonth(-1)}
                className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setViewDate(new Date())}
                className="px-1.5 py-0.5 hover:bg-zinc-800 rounded text-[9px] text-zinc-400 hover:text-white transition-colors cursor-pointer font-sans"
              >
                今天
              </button>
              <button 
                onClick={() => adjustMonth(1)}
                className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-zinc-950/30 border border-zinc-850 rounded-xl p-3">
            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
              {weekDays.map((day, idx) => (
                <span 
                  key={idx} 
                  className={`text-[10px] font-bold ${idx === 0 || idx === 6 ? 'text-zinc-500' : 'text-zinc-400'}`}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Cells */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {cells.map((cell, idx) => {
                if (cell.isPadding) {
                  return <div key={`pad-${idx}`} className="h-7 w-7" />;
                }

                const isChecked = activeCheckInDates.includes(cell.dateStr);
                const isCellToday = cell.dateStr === todayStr;

                return (
                  <button
                    key={`cell-${idx}`}
                    type="button"
                    disabled={readOnly}
                    onClick={() => toggleCheckIn(cell.dateStr)}
                    className={`h-7 w-7 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center transition-all relative ${
                      isChecked 
                        ? 'bg-emerald-500 text-zinc-950 font-black shadow-[0_0_8px_rgba(16,185,129,0.3)] scale-105' 
                        : isCellToday 
                          ? 'border border-amber-500 text-amber-400 hover:bg-amber-500/10' 
                          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    } ${readOnly ? 'cursor-default disabled:opacity-100' : 'cursor-pointer'}`}
                    title={cell.dateStr}
                  >
                    {cell.day}
                    
                    {/* Small dot indicator for today if not checked in */}
                    {isCellToday && !isChecked && (
                      <span className="absolute bottom-0.5 w-1 h-1 bg-amber-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Motivational Actions */}
        <div className="md:col-span-5 flex flex-col justify-between h-full min-h-[140px] bg-zinc-950/20 border border-zinc-850 rounded-xl p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold tracking-wide uppercase font-sans">每日寄语</span>
            </div>
            <p className="text-[10.5px] text-zinc-400 leading-relaxed font-sans">
              {checkInQuote && checkInQuote.trim() !== "" ? (
                checkInQuote
              ) : isTodayCheckedIn ? (
                "✨ 太棒了！今天已成功打卡签到。持之以恒，终将登峰造极，量子技术的大门正为您徐徐开启！" 
              ) : readOnly ? (
                "💡 今日尚未打卡。请联系系统管理员或课程导师在后台协助确认修炼签到状态。"
              ) : (
                "💡 今日尚未签到。每天打卡可以帮助您维持连续签到徽章，养成每天潜心研究技术的高端习惯。"
              )}
            </p>
          </div>

          <div className="pt-3 border-t border-zinc-800/40 font-sans">
            {isTodayCheckedIn ? (
              <div className="w-full py-2 bg-emerald-500/10 border border-emerald-500/25 rounded-lg flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-extrabold tracking-wider uppercase font-sans">
                <Check className="w-3.5 h-3.5 stroke-[3px]" />
                <span>今日修炼已打卡</span>
              </div>
            ) : readOnly ? (
              <div className="w-full py-2 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 font-extrabold tracking-wider uppercase font-sans">
                <span>今日尚未签到 (后台管理)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => toggleCheckIn(todayStr)}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-450 hover:to-amber-550 active:scale-[0.98] transition-all text-zinc-950 font-black text-[11px] tracking-widest uppercase rounded-lg shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:shadow-[0_0_16px_rgba(245,158,11,0.4)] flex items-center justify-center gap-1.5 cursor-pointer font-sans"
              >
                <Award className="w-3.5 h-3.5" />
                <span>点击打卡签到 (TODAY)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
