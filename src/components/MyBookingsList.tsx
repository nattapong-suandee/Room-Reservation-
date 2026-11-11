import React, { useState, useMemo } from 'react';
import { Booking, ROOMS } from '../types/booking';
import { calculateDurationHours, formatThaiDate } from '../utils/bookingUtils';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Phone,
  Search,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';

interface MyBookingsListProps {
  bookings: Booking[];
  onCancelBooking: (id: string, reason: string) => void;
  onBookNew: () => void;
}

export const MyBookingsList: React.FC<MyBookingsListProps> = ({
  bookings,
  onCancelBooking,
  onBookNew,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');

  // Cancel dialog state
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelCodeInput, setCancelCodeInput] = useState<string>('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status filter
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      // Room filter
      if (roomFilter !== 'all' && b.roomId !== roomFilter) return false;

      // Text search: matches title, bookerName, id, phone, or department
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchName = b.bookerName.toLowerCase().includes(q);
        const matchId = b.id.toLowerCase().includes(q);
        const matchPhone = b.phone.includes(q);
        const matchDept = b.department.toLowerCase().includes(q);
        if (!matchTitle && !matchName && !matchId && !matchPhone && !matchDept) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, searchQuery, statusFilter, roomFilter]);

  // Open Cancel Dialog
  const handleOpenCancel = (b: Booking) => {
    setBookingToCancel(b);
    setCancelReason('');
    setCancelCodeInput('');
    setCancelError(null);
  };

  // Confirm Cancellation
  const handleConfirmCancel = () => {
    if (!bookingToCancel) return;

    if (!cancelReason.trim()) {
      setCancelError('กรุณาระบุเหตุผลในการขอยกเลิกการจอง');
      return;
    }

    // Optional PIN verification if provided
    if (cancelCodeInput.trim() && cancelCodeInput.trim() !== bookingToCancel.cancelCode) {
      setCancelError('รหัส PIN ยกเลิกการจองไม่ถูกต้อง (โปรดตรวจสอบรหัสที่ได้รับตอนบันทึกการจอง)');
      return;
    }

    onCancelBooking(bookingToCancel.id, cancelReason.trim());
    setBookingToCancel(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้จอง, รหัสการจอง (เช่น BK-1001), หัวข้อ, เบอร์โทร..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({bookings.length})
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-3 py-2 rounded-lg transition-all ${
                statusFilter === 'confirmed'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ใช้งานอยู่ ({bookings.filter((b) => b.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-2 rounded-lg transition-all ${
                statusFilter === 'cancelled'
                  ? 'bg-white text-red-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ยกเลิกแล้ว ({bookings.filter((b) => b.status === 'cancelled').length})
            </button>
          </div>
        </div>

        {/* Room Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1">
          <span className="text-xs text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> กรองตามห้อง:
          </span>
          <button
            onClick={() => setRoomFilter('all')}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors whitespace-nowrap ${
              roomFilter === 'all'
                ? 'bg-slate-900 text-white font-medium'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทุกห้อง
          </button>
          {ROOMS.map((room) => {
            const isActive = roomFilter === room.id;
            return (
              <button
                key={room.id}
                onClick={() => setRoomFilter(room.id)}
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
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">ไม่พบรายการจองที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือกดปุ่มด้านล่างเพื่อเริ่มสร้างการจองห้องประชุมใหม่
          </p>
          <button
            onClick={onBookNew}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            จองห้องประชุมทันที
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b) => {
            const room = ROOMS.find((r) => r.id === b.roomId) || ROOMS[0];
            const isCancelled = b.status === 'cancelled';
            const duration = calculateDurationHours(b.startTime, b.endTime);

            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
                  isCancelled
                    ? 'border-slate-200 bg-slate-50/70 opacity-75'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left: Info */}
                  <div className="space-y-2 flex-1">
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1.5"
                        style={{
                          backgroundColor: room.theme.bgColor,
                          color: room.theme.color,
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: room.theme.color }}
                        />
                        {room.name}
                      </span>

                      <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {b.id}
                      </span>

                      {isCancelled ? (
                        <span className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-red-500" /> ยกเลิกแล้ว
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ยืนยันการจอง
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className={`text-base font-bold ${isCancelled ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {b.title}
                    </h3>

                    {/* Meta Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1 gap-x-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatThaiDate(b.date, true)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="tabular-nums font-medium text-slate-800">
                          {b.startTime} - {b.endTime} น. ({duration} ชม.)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.attendeesCount} คน</span>
                      </div>
                    </div>

                    {/* Booker info */}
                    <div className="text-xs text-slate-500 pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100">
                      <span>
                        ผู้จอง: <strong className="text-slate-700">{b.bookerName}</strong>
                      </span>
                      <span>·</span>
                      <span>{b.department}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" /> {b.phone}
                      </span>
                    </div>

                    {/* Cancellation details if cancelled */}
                    {isCancelled && b.cancelReason && (
                      <div className="bg-red-50/80 p-2.5 rounded-lg border border-red-200 text-xs text-red-900 mt-2">
                        <span className="font-semibold block">เหตุผลการยกเลิก:</span>
                        <span>{b.cancelReason}</span>
                        {b.cancelledAt && (
                          <span className="text-[10px] text-red-600 block mt-0.5">
                            บันทึกยกเลิกเมื่อ: {new Date(b.cancelledAt).toLocaleString('th-TH')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => handleOpenCancel(b)}
                        className="px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors flex items-center gap-1.5 active:scale-95 shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ยกเลิกการจอง</span>
                      </button>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      PIN: {b.cancelCode}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {bookingToCancel && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  ยืนยันการยกเลิกการจองห้อง?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  เมื่อยกเลิกแล้ว ช่วงเวลาของห้องนี้จะถูกปล่อยว่างให้บุคลากรท่านอื่นสามารถจองได้ทันที
                </p>
              </div>

              {/* Booking Summary Box */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-900">{bookingToCancel.title}</div>
                <div className="text-slate-600">
                  {ROOMS.find((r) => r.id === bookingToCancel.roomId)?.name} · {formatThaiDate(bookingToCancel.date, false)} ({bookingToCancel.startTime} - {bookingToCancel.endTime} น.)
                </div>
                <div className="text-slate-500">
                  ผู้จอง: {bookingToCancel.bookerName}
                </div>
              </div>

              {/* Cancel Reason Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ระบุเหตุผลในการยกเลิก <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น ติดภารกิจด่วน, เลื่อนวันประชุม, จัดประชุมออนไลน์แทน..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {/* Cancel PIN confirmation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัส PIN ยืนยันการยกเลิก (4 หลัก) <span className="text-slate-400 font-normal">(รหัสของคุณคือ {bookingToCancel.cancelCode})</span>
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder={`กรอก ${bookingToCancel.cancelCode}`}
                  value={cancelCodeInput}
                  onChange={(e) => setCancelCodeInput(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Error display */}
              {cancelError && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-2.5 text-xs text-red-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{cancelError}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setBookingToCancel(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ปิด / ไม่ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs"
              >
                ยืนยันการยกเลิกห้อง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
