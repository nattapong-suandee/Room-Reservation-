import { Booking } from '../types/booking';

const STORAGE_KEY = 'meeting_room_bookings_v2';

// Realistic sample bookings around current date (2026-11-10)
const INITIAL_DEMO_BOOKINGS: Booking[] = [
  {
    id: 'BK-1001',
    roomId: 'room-a',
    title: 'ประชุมวางแผนยุทธศาสตร์ประจำไตรมาส Q4',
    bookerName: 'สมชาย วิจิตรศิลป์',
    department: 'ฝ่ายพัฒนาธุรกิจและกลยุทธ์ (Business Strategy)',
    phone: '081-234-5678',
    email: 'somchai.v@company.com',
    date: '2026-11-10',
    startTime: '09:00',
    endTime: '11:30',
    attendeesCount: 18,
    notes: 'ต้องการไมโครโฟนไร้สาย 4 ตัว และบันทึกการประชุมผ่าน Zoom',
    equipmentNeeded: ['โปรเจกเตอร์ 4K', 'ระบบ Video Conference', 'ไมโครโฟนไร้สาย'],
    createdAt: '2026-11-08T09:15:00.000Z',
    status: 'confirmed',
    cancelCode: '4821',
  },
  {
    id: 'BK-1002',
    roomId: 'room-b',
    title: 'Sprint Retrospective & Demo ประจำสัปดาห์',
    bookerName: 'ณัฐพงษ์ สุขใจ',
    department: 'ฝ่ายเทคโนโลยีสารสนเทศ (IT)',
    phone: '089-876-5432',
    email: 'nattapong.s@company.com',
    date: '2026-11-10',
    startTime: '10:00',
    endTime: '12:00',
    attendeesCount: 10,
    notes: 'เตรียมสายแปลง HDMI/Type-C ต่อจอ 65 นิ้ว',
    equipmentNeeded: ['สมาร์ททีวี 65 นิ้ว', 'เว็บแคม 4K Ultra HD'],
    createdAt: '2026-11-08T11:20:00.000Z',
    status: 'confirmed',
    cancelCode: '1934',
  },
  {
    id: 'BK-1003',
    roomId: 'room-c',
    title: 'สัมภาษณ์ผู้สมัครตำแหน่ง Senior Frontend Engineer',
    bookerName: 'กานต์ธิดา ประเสริฐ',
    department: 'ฝ่ายทรัพยากรบุคคล (HR)',
    phone: '086-555-1234',
    email: 'karnthida.p@company.com',
    date: '2026-11-10',
    startTime: '13:30',
    endTime: '15:00',
    attendeesCount: 4,
    notes: 'ขอเตรียมน้ำดื่มและของว่างสำหรับผู้สมัคร',
    equipmentNeeded: ['จอแสดงผล 50 นิ้ว', 'กล้องไมค์ตัดเสียงรบกวน'],
    createdAt: '2026-11-09T08:30:00.000Z',
    status: 'confirmed',
    cancelCode: '7721',
  },
  {
    id: 'BK-1004',
    roomId: 'room-a',
    title: 'Townhall ชี้แจงสวัสดิการและประกันกลุ่มปีใหม่',
    bookerName: 'วิภาดา รัตนกูล',
    department: 'ฝ่ายทรัพยากรบุคคล (HR)',
    phone: '082-999-8877',
    email: 'wiphada.r@company.com',
    date: '2026-11-10',
    startTime: '13:00',
    endTime: '15:30',
    attendeesCount: 20,
    notes: 'มีถ่ายทอดสด Hybrid Conference ให้สาขาต่างจังหวัด',
    equipmentNeeded: ['โปรเจกเตอร์ 4K', 'ระบบ Video Conference', 'ไมโครโฟนไร้สาย'],
    createdAt: '2026-11-07T14:00:00.000Z',
    status: 'confirmed',
    cancelCode: '6259',
  },
  {
    id: 'BK-1005',
    roomId: 'room-d',
    title: 'ประชุมคณะกรรมการบริหาร (Executive Board Meeting)',
    bookerName: 'ดร. นริศรา มหิทธิกุล',
    department: 'ฝ่ายบริหารงานทั่วไปและธุรการ (Admin & Ops)',
    phone: '081-888-7766',
    email: 'narisara.m@company.com',
    date: '2026-11-11',
    startTime: '09:30',
    endTime: '12:30',
    attendeesCount: 28,
    notes: 'เตรียมบริการอาหารว่าง ชากาแฟ และน้ำแร่',
    equipmentNeeded: ['จอ LED Wall ขนาดใหญ่', 'ระบบเสียง Conference', 'โพเดียมพร้อมไมโครโฟน'],
    createdAt: '2026-11-05T10:00:00.000Z',
    status: 'confirmed',
    cancelCode: '8832',
  },
  {
    id: 'BK-1006',
    roomId: 'room-b',
    title: 'Brand Campaign Pitching แคมเปญปลายปี',
    bookerName: 'อภิสิทธิ์ เจริญพร',
    department: 'ฝ่ายการตลาดและการสื่อสาร (Marketing)',
    phone: '084-333-2211',
    email: 'apisit.c@company.com',
    date: '2026-11-11',
    startTime: '13:00',
    endTime: '15:00',
    attendeesCount: 11,
    notes: 'มีทีม Agency เข้ามาร่วมพรีเซนต์งาน',
    equipmentNeeded: ['สมาร์ททีวี 65 นิ้ว', 'กระดานไวท์บอร์ดกระจก'],
    createdAt: '2026-11-08T16:45:00.000Z',
    status: 'confirmed',
    cancelCode: '3145',
  },
  {
    id: 'BK-1007',
    roomId: 'room-c',
    title: 'สรุปงบประมาณและปิดรอบบัญชีประจำเดือน',
    bookerName: 'วรรณี ศรีสวัสดิ์',
    department: 'ฝ่ายบัญชีและการเงิน (Finance)',
    phone: '085-444-9988',
    email: 'wannee.s@company.com',
    date: '2026-11-12',
    startTime: '09:00',
    endTime: '11:00',
    attendeesCount: 6,
    notes: 'เตรียมสายเชื่อมต่อ Projector',
    equipmentNeeded: ['จอแสดงผล 50 นิ้ว'],
    createdAt: '2026-11-09T13:20:00.000Z',
    status: 'confirmed',
    cancelCode: '5912',
  },
  {
    id: 'BK-1008',
    roomId: 'room-a',
    title: 'อบรมระบบ ERP เวอร์ชันใหม่สำหรับพนักงาน',
    bookerName: 'ปิยะวัฒน์ ทับทิม',
    department: 'ฝ่ายเทคโนโลยีสารสนเทศ (IT)',
    phone: '083-777-6655',
    email: 'piyawat.t@company.com',
    date: '2026-11-12',
    startTime: '13:30',
    endTime: '16:30',
    attendeesCount: 16,
    notes: 'ต้องการทดสอบเครื่องฉายและต่อสัญญาณเน็ตความเร็วสูง',
    equipmentNeeded: ['โปรเจกเตอร์ 4K', 'ไวท์บอร์ดอัจฉริยะ'],
    createdAt: '2026-11-08T09:00:00.000Z',
    status: 'confirmed',
    cancelCode: '2048',
  },
  {
    id: 'BK-1009',
    roomId: 'room-b',
    title: 'วิจัยความพึงพอใจลูกค้าและการปรับปรุงบริการ',
    bookerName: 'ชัชวาล ว่องไว',
    department: 'ฝ่ายบริการลูกค้า (Customer Support)',
    phone: '087-111-2233',
    email: 'chatchawan.w@company.com',
    date: '2026-11-13',
    startTime: '10:30',
    endTime: '12:00',
    attendeesCount: 8,
    notes: 'ระดมสมองและแปะ Post-it',
    equipmentNeeded: ['กระดานไวท์บอร์ดกระจก'],
    createdAt: '2026-11-09T15:10:00.000Z',
    status: 'confirmed',
    cancelCode: '9012',
  },
  {
    id: 'BK-1010',
    roomId: 'room-c',
    title: 'ทบทวนสิทธิบัตรงานวิจัย AI & Data Analytics',
    bookerName: 'ดร. ธีรภัทร นิลคง',
    department: 'ฝ่ายวิจัยและนวัตกรรม (R&D)',
    phone: '089-222-7711',
    email: 'teerapat.n@company.com',
    date: '2026-11-13',
    startTime: '14:00',
    endTime: '16:00',
    attendeesCount: 5,
    notes: 'การประชุมลับเฉพาะทีมวิจัย',
    equipmentNeeded: ['กล้องไมค์ตัดเสียงรบกวน'],
    createdAt: '2026-11-07T11:00:00.000Z',
    status: 'confirmed',
    cancelCode: '4390',
  },
  {
    id: 'BK-1011',
    roomId: 'room-a',
    title: 'ประชุมประสานงานฝ่ายจัดซื้อ (ยกเลิกเนื่องจากติดภารกิจด่วน)',
    bookerName: 'ชลธิชา บุญเรือง',
    department: 'ฝ่ายบริหารงานทั่วไปและธุรการ (Admin & Ops)',
    phone: '088-333-4455',
    email: 'chonticha.b@company.com',
    date: '2026-11-10',
    startTime: '11:30',
    endTime: '12:30',
    attendeesCount: 8,
    notes: '',
    equipmentNeeded: [],
    createdAt: '2026-11-06T10:00:00.000Z',
    status: 'cancelled',
    cancelReason: 'กรรมการและวิทยากรติดภารกิจด่วนภายนอก ขอเลื่อนเป็นสัปดาห์หน้า',
    cancelledAt: '2026-11-09T14:30:00.000Z',
    cancelCode: '1122',
  },
];

export function getStoredBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First time initialization
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_BOOKINGS));
      return INITIAL_DEMO_BOOKINGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_DEMO_BOOKINGS;
  } catch (err) {
    console.error('Failed to load bookings from storage:', err);
    return INITIAL_DEMO_BOOKINGS;
  }
}

export function saveStoredBookings(bookings: Booking[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch (err) {
    console.error('Failed to save bookings to storage:', err);
  }
}

export function addBooking(booking: Booking): Booking[] {
  const current = getStoredBookings();
  const updated = [booking, ...current];
  saveStoredBookings(updated);
  return updated;
}

export function cancelBooking(id: string, reason: string): { success: boolean; message: string; updatedBookings: Booking[] } {
  const current = getStoredBookings();
  const index = current.findIndex((b) => b.id === id);

  if (index === -1) {
    return { success: false, message: 'ไม่พบรายการจองนี้ในระบบ', updatedBookings: current };
  }

  if (current[index].status === 'cancelled') {
    return { success: false, message: 'รายการนี้ถูกยกเลิกไปแล้ว', updatedBookings: current };
  }

  current[index] = {
    ...current[index],
    status: 'cancelled',
    cancelReason: reason || 'ผู้จองขอยกเลิกผ่านระบบ',
    cancelledAt: new Date().toISOString(),
  };

  saveStoredBookings(current);
  return { success: true, message: 'ยกเลิกการจองสำเร็จ คืนช่วงเวลาห้องว่างให้ผู้อื่นเรียบร้อยแล้ว', updatedBookings: current };
}

export function resetToDemoBookings(): Booking[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_BOOKINGS));
  return INITIAL_DEMO_BOOKINGS;
}
