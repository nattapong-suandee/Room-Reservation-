export interface Room {
  id: string;
  name: string;
  codeName: string;
  capacity: number;
  floor: string;
  description: string;
  equipment: string[];
  theme: {
    color: string;
    bgColor: string;
    badgeBg: string;
    badgeText: string;
    borderColor: string;
    accentClass: string;
    headerGradient: string;
  };
}

export interface Booking {
  id: string; // e.g., BK-1042
  roomId: string;
  title: string;
  bookerName: string;
  department: string;
  phone: string;
  email: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm e.g. "09:00"
  endTime: string; // HH:mm e.g. "11:00"
  attendeesCount: number;
  notes?: string;
  equipmentNeeded?: string[];
  createdAt: string; // ISO string
  status: 'confirmed' | 'cancelled';
  cancelReason?: string;
  cancelledAt?: string;
  cancelCode: string; // 4-digit PIN for self cancellation
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflicts: Booking[];
  message?: string;
}

export const ROOMS: Room[] = [
  {
    id: 'room-a',
    name: 'ห้องสุขุมวิท',
    codeName: 'Room A (Grand Conference)',
    capacity: 20,
    floor: 'ชั้น 4 อาคารอำนวยการ',
    description: 'ห้องประชุมขนาดใหญ่ รองรับการประชุมผู้บริหารและสัมมนาทีม',
    equipment: ['โปรเจกเตอร์ 4K', 'ระบบ Video Conference (Zoom/Teams)', 'ไวท์บอร์ดอัจฉริยะ', 'ไมโครโฟนไร้สาย 4 ตัว'],
    theme: {
      color: '#0284c7', // Sky-600
      bgColor: 'bg-sky-50',
      badgeBg: 'bg-sky-100',
      badgeText: 'text-sky-800',
      borderColor: 'border-sky-300',
      accentClass: 'text-sky-600',
      headerGradient: 'from-sky-600 to-blue-700',
    },
  },
  {
    id: 'room-b',
    name: 'ห้องเพลินจิต',
    codeName: 'Room B (Team Collaboration)',
    capacity: 12,
    floor: 'ชั้น 4 อาคารอำนวยการ',
    description: 'ห้องประชุมขนาดกลาง เหมาะสำหรับการระดมสมองและประชุมแผนก',
    equipment: ['สมาร์ททีวี 65 นิ้ว', 'เว็บแคม 4K Ultra HD', 'กระดานไวท์บอร์ดกระจก', 'ปลั๊กไฟตั้งโต๊ะรอบทิศทาง'],
    theme: {
      color: '#059669', // Emerald-600
      bgColor: 'bg-emerald-50',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      borderColor: 'border-emerald-300',
      accentClass: 'text-emerald-600',
      headerGradient: 'from-emerald-600 to-teal-700',
    },
  },
  {
    id: 'room-c',
    name: 'ห้องอโศก',
    codeName: 'Room C (Quick Meet / Focus)',
    capacity: 8,
    floor: 'ชั้น 3 ฝ่ายบริหาร',
    description: 'ห้องประชุมขนาดกะทัดรัด สำหรับคุยงานกลุ่มย่อยหรือสัมภาษณ์งาน',
    equipment: ['จอแสดงผล 50 นิ้ว รองรับ AirPlay/Chromecast', 'กล้องไมค์ตัดเสียงรบกวน', 'ไวท์บอร์ดแม่เหล็ก'],
    theme: {
      color: '#d97706', // Amber-600
      bgColor: 'bg-amber-50',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      borderColor: 'border-amber-300',
      accentClass: 'text-amber-600',
      headerGradient: 'from-amber-600 to-orange-700',
    },
  },
  {
    id: 'room-d',
    name: 'ห้องสาทร',
    codeName: 'Room D (Boardroom Executive)',
    capacity: 35,
    floor: 'ชั้น 5 ห้องประชุมใหญ่',
    description: 'ห้องบอร์ดรูมระดับผู้บริหาร พร้อมระบบเสียงสเตอริโอและถ่ายทอดสด',
    equipment: ['จอ LED Wall ขนาดใหญ่', 'ระบบเสียง Conference รอบทิศทาง', 'กล้อง PTZ ติดตามผู้พูด', 'โพเดียมพร้อมไมโครโฟน'],
    theme: {
      color: '#7c3aed', // Purple-600
      bgColor: 'bg-purple-50',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800',
      borderColor: 'border-purple-300',
      accentClass: 'text-purple-600',
      headerGradient: 'from-purple-600 to-indigo-700',
    },
  },
];

export const DEPARTMENTS = [
  'ฝ่ายเทคโนโลยีสารสนเทศ (IT)',
  'ฝ่ายการตลาดและการสื่อสาร (Marketing)',
  'ฝ่ายทรัพยากรบุคคล (HR)',
  'ฝ่ายบัญชีและการเงิน (Finance)',
  'ฝ่ายพัฒนาธุรกิจและกลยุทธ์ (Business Strategy)',
  'ฝ่ายบริหารงานทั่วไปและธุรการ (Admin & Ops)',
  'ฝ่ายวิจัยและนวัตกรรม (R&D)',
  'ฝ่ายบริการลูกค้า (Customer Support)',
];

export const OPERATING_HOURS = {
  start: '08:30',
  end: '16:30',
  startMinutes: 8 * 60 + 30, // 510 minutes
  endMinutes: 16 * 60 + 30,  // 990 minutes
  totalDailyHours: 8,
  slotIntervalMinutes: 30,
};

export const TIME_SLOTS: string[] = [
  '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00',
  '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30'
];
