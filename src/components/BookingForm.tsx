import React, { useState, useMemo } from 'react';
import { Booking, ConflictCheckResult, DEPARTMENTS, OPERATING_HOURS, Room, ROOMS, TIME_SLOTS } from '../types/booking';
import {
  calculateDurationHours,
  checkConflict,
  findAlternativeRooms,
  findAlternativeSlots,
  formatThaiDate,
  generateBookingId,
  generateCancelCode,
  timeToMinutes,
} from '../utils/bookingUtils';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  Sparkles,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';

interface BookingFormProps {
  existingBookings: Booking[];
  onBookingSuccess: (newBooking: Booking) => void;
  preselectedRoomId?: string;
  preselectedDate?: string;
  preselectedStartTime?: string;
  onViewCalendar?: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  existingBookings,
  onBookingSuccess,
  preselectedRoomId,
  preselectedDate,
  preselectedStartTime,
  onViewCalendar,
}) => {
  // Form State
  const [selectedRoomId, setSelectedRoomId] = useState<string>(preselectedRoomId || 'room-a');
  
  // Default to today (or preselected) in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const [date, setDate] = useState<string>(preselectedDate || todayStr);
  const [startTime, setStartTime] = useState<string>(preselectedStartTime || '09:00');
  const [endTime, setEndTime] = useState<string>('10:30');

  // Meeting Details
  const [title, setTitle] = useState<string>('');
  const [bookerName, setBookerName] = useState<string>('');
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [attendeesCount, setAttendeesCount] = useState<number>(6);
  const [notes, setNotes] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  // UI state
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Selected room object
  const currentRoom = useMemo(
    () => ROOMS.find((r) => r.id === selectedRoomId) || ROOMS[0],
    [selectedRoomId]
  );

  // Calculate 30 days max date
  const maxDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Real-time conflict detection
  const conflictResult: ConflictCheckResult = useMemo(() => {
    if (!selectedRoomId || !date || !startTime || !endTime) {
      return { hasConflict: false, conflicts: [] };
    }
    return checkConflict(
      {
        roomId: selectedRoomId,
        date,
        startTime,
        endTime,
      },
      existingBookings
    );
  }, [selectedRoomId, date, startTime, endTime, existingBookings]);

  // Duration in hours
  const durationHours = useMemo(
    () => calculateDurationHours(startTime, endTime),
    [startTime, endTime]
  );

  // Alternative available slots in the same room when conflict happens
  const alternativeSlots = useMemo(() => {
    if (!conflictResult.hasConflict) return [];
    const durationMins = (timeToMinutes(endTime) - timeToMinutes(startTime)) || 60;
    return findAlternativeSlots(selectedRoomId, date, durationMins, existingBookings);
  }, [conflictResult.hasConflict, selectedRoomId, date, startTime, endTime, existingBookings]);

  // Alternative available rooms for the exact requested time slot
  const alternativeRooms = useMemo(() => {
    if (!conflictResult.hasConflict) return [];
    return findAlternativeRooms(date, startTime, endTime, selectedRoomId, existingBookings);
  }, [conflictResult.hasConflict, date, startTime, endTime, selectedRoomId, existingBookings]);

  // Equipment toggle
  const toggleEquipment = (item: string) => {
    if (selectedEquipment.includes(item)) {
      setSelectedEquipment(selectedEquipment.filter((e) => e !== item));
    } else {
      setSelectedEquipment([...selectedEquipment, item]);
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!title.trim()) {
      setFormError('กรุณากรอกหัวข้อการประชุม');
      return;
    }
    if (!bookerName.trim()) {
      setFormError('กรุณากรอกชื่อ-นามสกุลของผู้จอง');
      return;
    }
    if (!phone.trim()) {
      setFormError('กรุณากรอกเบอร์โทรศัพท์สำหรับติดต่อ');
      return;
    }
    if (attendeesCount <= 0) {
      setFormError('จำนวนผู้เข้าร่วมต้องมากกว่า 0 คน');
      return;
    }
    if (attendeesCount > currentRoom.capacity) {
      setFormError(`ห้องนี้รองรับได้สูงสุด ${currentRoom.capacity} คน (ระบุไว้ ${attendeesCount} คน)`);
      return;
    }

    // Constraint: 30 days ahead
    if (date < todayStr || date > maxDateStr) {
      setFormError('สามารถจองล่วงหน้าได้ไม่เกิน 30 วัน และไม่สามารถจองย้อนหลังได้');
      return;
    }

    // Strict conflict check
    if (conflictResult.hasConflict) {
      setFormError(conflictResult.message || 'เวลาที่ท่านเลือกทับซ้อนกับการจองอื่น');
      return;
    }

    const newBooking: Booking = {
      id: generateBookingId(),
      roomId: selectedRoomId,
      title: title.trim(),
      bookerName: bookerName.trim(),
      department,
      phone: phone.trim(),
      email: email.trim() || `${bookerName.replace(/\s+/g, '.').toLowerCase()}@organization.ac.th`,
      date,
      startTime,
      endTime,
      attendeesCount,
      notes: notes.trim(),
      equipmentNeeded: selectedEquipment,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      cancelCode: generateCancelCode(),
    };

    onBookingSuccess(newBooking);
    setConfirmedBooking(newBooking);
  };

  // Reset form to book another
  const handleResetForNew = () => {
    setConfirmedBooking(null);
    setTitle('');
    setNotes('');
    setFormError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Confirmation Success Modal / Card */}
      {confirmedBooking && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  จองห้องประชุมสำเร็จ
                </span>
                <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded-md border border-emerald-300 text-emerald-900">
                  รหัสการจอง: {confirmedBooking.id}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {confirmedBooking.title}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                ผู้จอง: <span className="font-semibold text-slate-800">{confirmedBooking.bookerName}</span> ({confirmedBooking.department})
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-emerald-100 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">ห้องประชุม</span>
                  <span className="font-medium text-slate-900">
                    {ROOMS.find((r) => r.id === confirmedBooking.roomId)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">วันที่</span>
                  <span className="font-medium text-slate-900">
                    {formatThaiDate(confirmedBooking.date, true)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">เวลา</span>
                  <span className="font-medium text-slate-900 tabular-nums">
                    {confirmedBooking.startTime} - {confirmedBooking.endTime} น.
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-emerald-200">
                <div className="text-xs text-slate-600">
                  <span>รหัสยกเลิกการจองส่วนบุคคล: </span>
                  <span className="font-mono font-bold text-slate-900 bg-emerald-100 px-2 py-0.5 rounded">
                    {confirmedBooking.cancelCode}
                  </span>
                  <span className="ml-1 text-slate-500">(ใช้สำหรับยืนยันหากต้องการยกเลิก)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetForNew}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    จองห้องอื่นเพิ่ม
                  </button>
                  {onViewCalendar && (
                    <button
                      type="button"
                      onClick={onViewCalendar}
                      className="px-4 py-2 text-xs font-medium text-emerald-800 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      ดูตารางปฏิทิน
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Booking Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-400" />
              แบบฟอร์มจองห้องประชุม
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              ตรวจเช็กเวลาว่างแบบเรียลไทม์ ป้องกันการจองซ้อน 100% · เวลาทำการ 08:30 - 16:30 น.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>จองล่วงหน้าได้ไม่เกิน 30 วัน</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Step 1: Select Room (Color-coded cards) */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              1. เลือกห้องประชุมที่ต้องการ <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ROOMS.map((room) => {
                const isSelected = room.id === selectedRoomId;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`text-left p-3.5 rounded-xl border-2 transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? `${room.theme.borderColor} ${room.theme.bgColor} shadow-sm ring-2 ring-offset-1 ring-slate-900/10`
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: room.theme.color }}
                        />
                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <Users className="w-3 h-3" /> {room.capacity} ที่นั่ง
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">{room.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{room.codeName}</div>
                      <div className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {room.description}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {room.floor}
                      </span>
                      {isSelected ? (
                        <span className="font-semibold text-slate-900 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> เลือกแล้ว
                        </span>
                      ) : (
                        <span className="text-slate-400">คลิกเพื่อเลือก</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Date & Time Selection with LIVE Conflict Prevention */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span>2. วันที่และช่วงเวลาการประชุม</span>
                <span className="text-xs font-normal text-slate-500">(เวลาทำการ 08:30 - 16:30 น.)</span>
              </label>

              {/* Quick Date Shortcuts */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setDate(todayStr)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    date === todayStr
                      ? 'bg-slate-900 text-white font-medium shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  วันนี้
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tmr = new Date();
                    tmr.setDate(tmr.getDate() + 1);
                    const y = tmr.getFullYear();
                    const m = String(tmr.getMonth() + 1).padStart(2, '0');
                    const d = String(tmr.getDate()).padStart(2, '0');
                    setDate(`${y}-${m}-${d}`);
                  }}
                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  พรุ่งนี้
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Date Input */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  วันที่จอง (ไม่เกิน 30 วัน)
                </label>
                <input
                  type="date"
                  min={todayStr}
                  max={maxDateStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-medium"
                  required
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  {formatThaiDate(date, true)}
                </span>
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  เวลาเริ่มประชุม
                </label>
                <select
                  value={startTime}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setStartTime(newStart);
                    // auto adjust end time if needed
                    if (timeToMinutes(newStart) >= timeToMinutes(endTime)) {
                      const nextMins = timeToMinutes(newStart) + 60;
                      if (nextMins <= OPERATING_HOURS.endMinutes) {
                        const h = String(Math.floor(nextMins / 60)).padStart(2, '0');
                        const m = String(nextMins % 60).padStart(2, '0');
                        setEndTime(`${h}:${m}`);
                      }
                    }
                  }}
                  className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-medium"
                >
                  {TIME_SLOTS.slice(0, -1).map((time) => (
                    <option key={time} value={time}>
                      {time} น.
                    </option>
                  ))}
                </select>
              </div>

              {/* End Time */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  เวลาสิ้นสุดประชุม
                </label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-medium"
                >
                  {TIME_SLOTS.slice(1).map((time) => {
                    const isDisabled = timeToMinutes(time) <= timeToMinutes(startTime);
                    return (
                      <option key={time} value={time} disabled={isDisabled}>
                        {time} น. {isDisabled ? '(เวลาน้อยกว่า)' : ''}
                      </option>
                    );
                  })}
                </select>
                <span className="text-[11px] text-slate-500 block mt-1">
                  ระยะเวลา: <strong className="text-slate-700">{durationHours} ชั่วโมง</strong>
                </span>
              </div>
            </div>

            {/* REAL-TIME CONFLICT ALERT & SMART ALTERNATIVE SUGGESTION */}
            {conflictResult.hasConflict ? (
              <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-sm text-red-900 space-y-3">
                <div className="flex items-start gap-2.5">
                  <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-red-950">
                      ตรวจพบเวลาจองชนกัน! (Cannot Book)
                    </div>
                    <div className="text-xs text-red-800 mt-0.5 leading-relaxed">
                      {conflictResult.message}
                    </div>
                  </div>
                </div>

                {/* Conflict Resolution 1: Alternative free slots in this room */}
                {alternativeSlots.length > 0 && (
                  <div className="bg-white/80 p-3 rounded-lg border border-red-200">
                    <span className="text-xs font-semibold text-slate-800 block mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      ช่วงเวลาว่างอื่นใน {currentRoom.name} สำหรับวันนี้:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {alternativeSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setStartTime(slot.startTime);
                            setEndTime(slot.endTime);
                          }}
                          className="px-2.5 py-1 text-xs bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors font-mono font-medium shadow-xs"
                        >
                          {slot.startTime} - {slot.endTime} น.
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conflict Resolution 2: Alternative rooms free at this exact time */}
                {alternativeRooms.length > 0 && (
                  <div className="bg-white/80 p-3 rounded-lg border border-red-200">
                    <span className="text-xs font-semibold text-slate-800 block mb-1.5 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      หรือเปลี่ยนไปใช้ห้องอื่นที่ว่างในเวลานี้ ({startTime} - {endTime} น.):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {alternativeRooms.map((room) => (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => setSelectedRoomId(room.id)}
                          className="px-3 py-1 text-xs font-medium rounded-md border transition-colors flex items-center gap-1.5 bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-xs"
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: room.theme.color }}
                          />
                          {room.name} ({room.capacity} ที่นั่ง)
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    ช่วงเวลานี้ว่าง! <strong>{currentRoom.name}</strong> วันที่ {formatThaiDate(date, false)} เวลา {startTime} - {endTime} น. พร้อมบันทึกการจอง
                  </span>
                </div>
                <span className="font-semibold text-emerald-800 hidden sm:inline">
                  {durationHours} ชม.
                </span>
              </div>
            )}
          </div>

          {/* Step 3: Meeting Topic & Booker Information */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-900">
              3. รายละเอียดการประชุมและข้อมูลผู้จอง
            </label>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                หัวข้อการประชุม / กิจกรรม <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น ประชุมทบทวนแผนงาน Q4, สัมภาษณ์งานพนักงานใหม่, สัมมนาทีม IT"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ชื่อ-นามสกุล ผู้จอง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น สมชาย วิจิตรศิลป์"
                  value={bookerName}
                  onChange={(e) => setBookerName(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  หน่วยงาน / ฝ่าย <span className="text-red-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  เบอร์โทรศัพท์สำหรับติดต่อ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="เช่น 081-234-5678 หรือ เบอร์ภายใน 1402"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  จำนวนผู้เข้าร่วมประชุม (คน) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={currentRoom.capacity}
                    value={attendeesCount}
                    onChange={(e) => setAttendeesCount(Number(e.target.value))}
                    className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                    required
                  />
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    (สูงสุด {currentRoom.capacity} ที่นั่ง)
                  </span>
                </div>
              </div>
            </div>

            {/* Equipment Request */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                อุปกรณ์ประจำห้องที่ต้องการใช้งาน
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentRoom.equipment.map((equip) => {
                  const isChecked = selectedEquipment.includes(equip);
                  return (
                    <label
                      key={equip}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-slate-100 border-slate-400 font-medium text-slate-900'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleEquipment(equip)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span>{equip}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                หมายเหตุเพิ่มเติม / สิ่งที่ต้องการให้อำนวยความสะดวก (ถ้ามี)
              </label>
              <textarea
                rows={2}
                placeholder="เช่น ขอจัดโต๊ะแบบ U-Shape, ขอเตรียมชุดชากาแฟ, มีผู้เข้าร่วมภายนอก..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Error Banner */}
          {formError && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex items-center gap-2 text-xs text-red-900">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Action Button: Mobile-First Big Hit Target */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={conflictResult.hasConflict}
              className={`w-full min-h-[50px] rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-sm ${
                conflictResult.hasConflict
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              {conflictResult.hasConflict
                ? 'ไม่สามารถบันทึกได้ (เวลาชนกับการจองอื่น)'
                : `ยืนยันการจอง ${currentRoom.name} (${startTime} - ${endTime} น.)`}
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2">
              เมื่อกดบันทึก ข้อมูลจะถูกจัดเก็บทันที และระบบจะสร้างรหัสสำหรับยกเลิกการจองให้ท่าน
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
