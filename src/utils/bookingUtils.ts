import { Booking, ConflictCheckResult, OPERATING_HOURS, Room, ROOMS, TIME_SLOTS } from '../types/booking';

/**
 * Converts "HH:mm" to minutes since midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Converts minutes since midnight back to "HH:mm"
 */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Calculates duration in hours between two HH:mm strings
 */
export function calculateDurationHours(startTime: string, endTime: string): number {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (end <= start) return 0;
  return Math.round(((end - start) / 60) * 10) / 10;
}

/**
 * Strict Overlap Check Algorithm:
 * Two time ranges [S1, E1] and [S2, E2] overlap if and only if:
 * S1 < E2 and E1 > S2
 */
export function checkConflict(
  candidate: {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    id?: string;
  },
  existingBookings: Booking[]
): ConflictCheckResult {
  const cStart = timeToMinutes(candidate.startTime);
  const cEnd = timeToMinutes(candidate.endTime);

  // Time boundary validation within operating hours
  if (cStart < OPERATING_HOURS.startMinutes || cEnd > OPERATING_HOURS.endMinutes) {
    return {
      hasConflict: true,
      conflicts: [],
      message: `เวลาจองต้องอยู่ระหว่าง ${OPERATING_HOURS.start} - ${OPERATING_HOURS.end} น.`,
    };
  }

  if (cEnd <= cStart) {
    return {
      hasConflict: true,
      conflicts: [],
      message: 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้นอย่างน้อย 30 นาที',
    };
  }

  // Find all active overlapping bookings for this room on the same date
  const conflicts = existingBookings.filter((b) => {
    if (b.id === candidate.id) return false; // Ignore itself if updating
    if (b.roomId !== candidate.roomId) return false;
    if (b.date !== candidate.date) return false;
    if (b.status === 'cancelled') return false;

    const bStart = timeToMinutes(b.startTime);
    const bEnd = timeToMinutes(b.endTime);

    // Overlap condition:
    return cStart < bEnd && cEnd > bStart;
  });

  if (conflicts.length > 0) {
    const first = conflicts[0];
    return {
      hasConflict: true,
      conflicts,
      message: `เวลา ${candidate.startTime} - ${candidate.endTime} น. ชนกับการจองหัวข้อ "${first.title}" โดย ${first.bookerName} (${first.startTime} - ${first.endTime} น.)`,
    };
  }

  return {
    hasConflict: false,
    conflicts: [],
  };
}

/**
 * Searches alternative time slots on the same date in the same room
 */
export function findAlternativeSlots(
  roomId: string,
  date: string,
  durationMinutes: number,
  existingBookings: Booking[]
): { startTime: string; endTime: string }[] {
  const freeSlots: { startTime: string; endTime: string }[] = [];
  const duration = Math.max(durationMinutes, 30);

  // Filter existing active bookings for this room on this date
  const dayBookings = existingBookings
    .filter((b) => b.roomId === roomId && b.date === date && b.status !== 'cancelled')
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  // Loop through potential start times in 30-min steps
  for (let startM = OPERATING_HOURS.startMinutes; startM + duration <= OPERATING_HOURS.endMinutes; startM += 30) {
    const endM = startM + duration;
    const hasOverlap = dayBookings.some((b) => {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return startM < bEnd && endM > bStart;
    });

    if (!hasOverlap) {
      freeSlots.push({
        startTime: minutesToTime(startM),
        endTime: minutesToTime(endM),
      });
      if (freeSlots.length >= 4) break; // Limit to 4 smart suggestions
    }
  }

  return freeSlots;
}

/**
 * Searches alternative available rooms for the exact requested time slot
 */
export function findAlternativeRooms(
  date: string,
  startTime: string,
  endTime: string,
  currentRoomId: string,
  existingBookings: Booking[]
): Room[] {
  return ROOMS.filter((room) => {
    if (room.id === currentRoomId) return false;
    const res = checkConflict(
      {
        roomId: room.id,
        date,
        startTime,
        endTime,
      },
      existingBookings
    );
    return !res.hasConflict;
  });
}

/**
 * Thai date formatting helper
 */
const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

export function formatThaiDate(dateStr: string, includeDayOfWeek: boolean = true): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;

  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = THAI_DAYS[dateObj.getDay()];
  const thaiYear = year + 543; // Buddhist Era
  const monthName = THAI_MONTHS_SHORT[month - 1];

  if (includeDayOfWeek) {
    return `วัน${dayOfWeek}ที่ ${day} ${monthName} ${thaiYear}`;
  }
  return `${day} ${monthName} ${thaiYear}`;
}

/**
 * Generates an array of dates from today up to maxDays (default 30 days)
 */
export function getAvailableBookingDates(maxDays: number = 30): { dateStr: string; label: string; isWeekend: boolean }[] {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < maxDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayIndex = d.getDay();
    const isWeekend = dayIndex === 0 || dayIndex === 6;

    dates.push({
      dateStr,
      label: formatThaiDate(dateStr, true),
      isWeekend,
    });
  }

  return dates;
}

/**
 * Generates a friendly 4-digit booking cancellation code
 */
export function generateCancelCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Generates human-readable Booking ID
 */
export function generateBookingId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `BK-${randomNum}`;
}
