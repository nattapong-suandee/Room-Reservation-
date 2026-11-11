import React, { useState, useMemo } from 'react';
import { Booking, OPERATING_HOURS, Room, ROOMS, TIME_SLOTS } from '../types/booking';
import {
  calculateDurationHours,
  formatThaiDate,
  timeToMinutes,
} from '../utils/bookingUtils';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Info,
  Plus,
  Users,
  X,
} from 'lucide-react';

interface TimetableCalendarProps {
  bookings: Booking[];
  onSelectSlotToBook: (roomId: string, date: string, startTime: string) => void;
}

export const TimetableCalendar: React.FC<TimetableCalendarProps> = ({
  bookings,
  onSelectSlotToBook,
}) => {
  // Calendar view mode: 'week' or 'day'
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  
  // Selected room filter: 'all' or room.id
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');

  // Currently focused date
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  // Selected booking detail popup modal
  const [activeBookingModal, setActiveBookingModal] = useState<Booking | null>(null);

  // Helper to format Date to YYYY-MM-DD
  const formatDateISO = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const currentDateISO = useMemo(() => formatDateISO(currentDate), [currentDate]);

  // Calculate Monday to Friday (working days) or Monday to Sunday of the current week
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    // Find current day of week (0 is Sunday, 1 is Monday)
    const dayOfWeek = curr.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7; // Days since Monday

    const monday = new Date(curr);
    monday.setDate(curr.getDate() - distanceToMonday);

    const days = [];
    for (let i = 0; i < 5; i++) { // Mon - Fri working days
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = formatDateISO(d);
      days.push({
        date: d,
        dateISO: iso,
        label: formatThaiDate(iso, true),
        isToday: iso === formatDateISO(new Date()),
      });
    }
    return days;
  }, [currentDate]);

  // Navigation handlers
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'week') {
      next.setDate(next.getDate() - 7);
    } else {
      next.setDate(next.getDate() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'week') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Find booking for a specific room, date, and time slot
  const findBookingAtSlot = (roomId: string, dateISO: string, timeSlot: string): Booking | undefined => {
    const slotM = timeToMinutes(timeSlot);
    return bookings.find((b) => {
      if (b.status === 'cancelled') return false;
      if (b.roomId !== roomId) return false;
      if (b.date !== dateISO) return false;
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return slotM >= bStart && slotM < bEnd;
    });
  };

  return (
    <div className="space-y-6">
      {/* Calendar Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: View Mode Toggle & Room Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายสัปดาห์ (Weekly)
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'day'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายวัน (Day by Room)
            </button>
          </div>

          {/* Room Filter Pills */}
          {viewMode === 'week' && (
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              <button
                onClick={() => setSelectedRoomFilter('all')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors whitespace-nowrap ${
                  selectedRoomFilter === 'all'
                    ? 'bg-slate-900 text-white font-medium'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ทุกห้อง
              </button>
              {ROOMS.map((room) => {
                const isActive = selectedRoomFilter === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomFilter(room.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap border ${
                      isActive
                        ? `${room.theme.borderColor} ${room.theme.bgColor} ${room.theme.badgeText} font-semibold shadow-xs`
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: room.theme.color }}
                    />
                    <span>{room.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Date Navigation */}
        <div className="flex items-center justify-between md:justify-end gap-3">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl">
            <button
              onClick={handlePrev}
              aria-label="Previous"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-white rounded-lg transition-colors"
            >
              วันนี้
            </button>
            <button
              onClick={handleNext}
              aria-label="Next"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
              {viewMode === 'week' ? (
                <span>
                  {formatThaiDate(weekDays[0].dateISO, false)} - {formatThaiDate(weekDays[4].dateISO, false)}
                </span>
              ) : (
                <span>{formatThaiDate(currentDateISO, true)}</span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 block">
              คลิกช่องว่างเพื่อจองทันที
            </span>
          </div>
        </div>
      </div>

      {/* Room Legend Badges */}
      <div className="flex flex-wrap items-center gap-4 bg-white/70 px-4 py-2.5 rounded-xl border border-slate-200 text-xs">
        <span className="font-semibold text-slate-600 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> สีประจำห้อง:
        </span>
        {ROOMS.map((room) => (
          <div key={room.id} className="flex items-center gap-1.5 text-slate-700">
            <span
              className="w-3 h-3 rounded-md border"
              style={{ backgroundColor: room.theme.color, borderColor: room.theme.color }}
            />
            <span className="font-medium">{room.name}</span>
            <span className="text-[11px] text-slate-400">({room.capacity} ที่นั่ง)</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-emerald-700 font-medium">
          <span className="w-3 h-3 rounded-md bg-emerald-50 border border-emerald-300 flex items-center justify-center">
            <Plus className="w-2.5 h-2.5 text-emerald-600" />
          </span>
          <span>ช่องสีขาว = ห้องว่าง</span>
        </div>
      </div>

      {/* TIMETABLE VIEW 1: WEEKLY MATRIX */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[700px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-xs text-slate-700">
                  <th className="py-3 px-3 w-20 text-center font-semibold text-slate-500 border-r border-slate-200 sticky left-0 bg-slate-100 z-10">
                    <Clock className="w-3.5 h-3.5 mx-auto mb-0.5 text-slate-400" />
                    เวลา
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.dateISO}
                      className={`py-3 px-3 text-center border-r border-slate-200 ${
                        day.isToday ? 'bg-sky-50/70 text-sky-900 font-bold' : 'font-semibold'
                      }`}
                    >
                      <div className="text-xs">{day.label.split('ที่')[0]}</div>
                      <div className="text-[11px] font-normal text-slate-500">
                        {day.dateISO.split('-').reverse().join('/')}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {TIME_SLOTS.slice(0, -1).map((slot, sIdx) => {
                  const nextSlot = TIME_SLOTS[sIdx + 1];
                  return (
                    <tr key={slot} className="hover:bg-slate-50/40">
                      {/* Time slot column */}
                      <td className="py-2 px-2 text-center text-slate-500 font-mono text-[11px] border-r border-slate-200 bg-slate-50/50 sticky left-0 z-10 tabular-nums">
                        {slot}
                      </td>

                      {/* Day columns */}
                      {weekDays.map((day) => {
                        // Find all bookings for this day in this time slot
                        const matchingBookings = bookings.filter((b) => {
                          if (b.status === 'cancelled') return false;
                          if (b.date !== day.dateISO) return false;
                          if (selectedRoomFilter !== 'all' && b.roomId !== selectedRoomFilter) return false;
                          const bStart = timeToMinutes(b.startTime);
                          const bEnd = timeToMinutes(b.endTime);
                          const slotM = timeToMinutes(slot);
                          return slotM >= bStart && slotM < bEnd;
                        });

                        return (
                          <td
                            key={day.dateISO}
                            className={`p-1 border-r border-slate-200 align-top h-14 ${
                              day.isToday ? 'bg-sky-50/20' : ''
                            }`}
                          >
                            {matchingBookings.length > 0 ? (
                              <div className="space-y-1">
                                {matchingBookings.map((b) => {
                                  const room = ROOMS.find((r) => r.id === b.roomId) || ROOMS[0];
                                  const isStart = b.startTime === slot;
                                  return (
                                    <button
                                      key={b.id}
                                      onClick={() => setActiveBookingModal(b)}
                                      className="w-full text-left p-1.5 rounded-lg border text-[11px] transition-transform hover:scale-[1.01] shadow-2xs block"
                                      style={{
                                        backgroundColor: room.theme.bgColor ? undefined : '#f0fdf4',
                                        borderLeftColor: room.theme.color,
                                        borderLeftWidth: '3px',
                                      }}
                                    >
                                      <div className="flex items-center justify-between gap-1">
                                        <span
                                          className="font-bold text-[10px] px-1 py-0.2 rounded"
                                          style={{
                                            color: room.theme.color,
                                            backgroundColor: '#ffffff',
                                          }}
                                        >
                                          {room.name.split(' ')[0]}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                          {b.startTime}-{b.endTime}
                                        </span>
                                      </div>
                                      {isStart && (
                                        <div className="font-semibold text-slate-800 line-clamp-1 mt-0.5">
                                          {b.title}
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              // Available Slot Button
                              <button
                                onClick={() => {
                                  const defaultRoom = selectedRoomFilter === 'all' ? 'room-a' : selectedRoomFilter;
                                  onSelectSlotToBook(defaultRoom, day.dateISO, slot);
                                }}
                                className="w-full h-full min-h-[40px] rounded-lg border border-transparent hover:border-emerald-300 hover:bg-emerald-50/60 flex items-center justify-center text-slate-300 hover:text-emerald-700 transition-all group"
                                title={`คลิกเพื่อจอง ${slot} น.`}
                              >
                                <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
                                  <Plus className="w-3 h-3" /> จองเวลานี้
                                </span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TIMETABLE VIEW 2: DAILY VIEW (4 Rooms side by side) */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-900">
              ตารางใช้ห้องประจำ: {formatThaiDate(currentDateISO, true)}
            </div>
            <div className="text-xs text-slate-500">
              เวลาทำการ {OPERATING_HOURS.start} - {OPERATING_HOURS.end} น.
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[700px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-xs text-slate-700">
                  <th className="py-3 px-3 w-20 text-center font-semibold text-slate-500 border-r border-slate-200 sticky left-0 bg-slate-100 z-10">
                    เวลา
                  </th>
                  {ROOMS.map((room) => (
                    <th
                      key={room.id}
                      className="py-3 px-3 text-center border-r border-slate-200"
                    >
                      <div className="flex items-center justify-center gap-1.5 font-bold text-slate-900">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: room.theme.color }}
                        />
                        <span>{room.name}</span>
                      </div>
                      <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                        {room.capacity} ที่นั่ง · {room.floor}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {TIME_SLOTS.slice(0, -1).map((slot, sIdx) => {
                  return (
                    <tr key={slot} className="hover:bg-slate-50/40">
                      <td className="py-2 px-2 text-center text-slate-500 font-mono text-[11px] border-r border-slate-200 bg-slate-50/50 sticky left-0 z-10 tabular-nums">
                        {slot}
                      </td>
                      {ROOMS.map((room) => {
                        const booking = findBookingAtSlot(room.id, currentDateISO, slot);
                        const isStart = booking && booking.startTime === slot;

                        return (
                          <td
                            key={room.id}
                            className="p-1 border-r border-slate-200 align-top h-14"
                          >
                            {booking ? (
                              <button
                                onClick={() => setActiveBookingModal(booking)}
                                className={`w-full text-left p-1.5 rounded-lg border text-[11px] transition-transform hover:scale-[1.01] shadow-2xs block ${room.theme.bgColor} ${room.theme.borderColor}`}
                              >
                                <div className="flex items-center justify-between gap-1 text-[10px] text-slate-600 font-mono">
                                  <span>{booking.startTime}-{booking.endTime}</span>
                                  <span className="font-semibold text-slate-800">{booking.bookerName}</span>
                                </div>
                                {isStart && (
                                  <div className="font-bold text-slate-900 line-clamp-1 mt-0.5">
                                    {booking.title}
                                  </div>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => onSelectSlotToBook(room.id, currentDateISO, slot)}
                                className="w-full h-full min-h-[38px] rounded-lg border border-transparent hover:border-emerald-300 hover:bg-emerald-50/50 flex items-center justify-center text-slate-300 hover:text-emerald-700 transition-all group"
                              >
                                <span className="text-[10px] opacity-0 group-hover:opacity-100 font-medium flex items-center gap-0.5">
                                  <Plus className="w-3 h-3" /> ว่าง (คลิกจอง)
                                </span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {activeBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            {(() => {
              const room = ROOMS.find((r) => r.id === activeBookingModal.roomId) || ROOMS[0];
              return (
                <div
                  className="px-6 py-4 text-white flex items-center justify-between"
                  style={{ backgroundColor: room.theme.color }}
                >
                  <div>
                    <span className="text-xs uppercase font-mono opacity-80">
                      รายละเอียดการจอง · {activeBookingModal.id}
                    </span>
                    <h3 className="text-lg font-bold mt-0.5">{room.name}</h3>
                  </div>
                  <button
                    onClick={() => setActiveBookingModal(null)}
                    aria-label="Close"
                    className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              );
            })()}

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-sm text-slate-700">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  หัวข้อการประชุม
                </span>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {activeBookingModal.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">วันที่</span>
                  <span className="font-semibold text-slate-900">
                    {formatThaiDate(activeBookingModal.date, true)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">เวลา</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {activeBookingModal.startTime} - {activeBookingModal.endTime} น.
                  </span>
                  <span className="text-slate-500 ml-1">
                    ({calculateDurationHours(activeBookingModal.startTime, activeBookingModal.endTime)} ชม.)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">ผู้จอง</span>
                  <span className="font-semibold text-slate-900">
                    {activeBookingModal.bookerName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">เบอร์โทรศัพท์</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {activeBookingModal.phone}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">หน่วยงาน / แผนก</span>
                  <span className="font-semibold text-slate-900">
                    {activeBookingModal.department}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">ผู้เข้าร่วมประชุม</span>
                  <span className="font-semibold text-slate-900">
                    {activeBookingModal.attendeesCount} คน
                  </span>
                </div>
              </div>

              {activeBookingModal.equipmentNeeded && activeBookingModal.equipmentNeeded.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    อุปกรณ์ที่ขอใช้
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeBookingModal.equipmentNeeded.map((eq, i) => (
                      <span
                        key={i}
                        className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 font-medium"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeBookingModal.notes && (
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    หมายเหตุเพิ่มเติม
                  </span>
                  <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {activeBookingModal.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveBookingModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
