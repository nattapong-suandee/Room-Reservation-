/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Booking, ROOMS } from './types/booking';
import {
  addBooking,
  cancelBooking,
  getStoredBookings,
  resetToDemoBookings,
  saveStoredBookings,
} from './services/storage';
import { BookingForm } from './components/BookingForm';
import { TimetableCalendar } from './components/TimetableCalendar';
import { MyBookingsList } from './components/MyBookingsList';
import { StatsDashboard } from './components/StatsDashboard';
import { TechStackGuide } from './components/TechStackGuide';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  PlusCircle,
  Users,
} from 'lucide-react';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'calendar' | 'book' | 'my-bookings' | 'stats' | 'guide'>('book');

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>(() => getStoredBookings());

  // Slot pre-selection from calendar to form
  const [preselectedSlot, setPreselectedSlot] = useState<{
    roomId: string;
    date: string;
    startTime: string;
  } | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle new booking
  const handleBookingSuccess = (newBooking: Booking) => {
    const updated = addBooking(newBooking);
    setBookings([...updated]);
    showToast(`จองห้องสำเร็จ! รหัส ${newBooking.id}`);
  };

  // Handle cancellation
  const handleCancelBooking = (id: string, reason: string) => {
    const result = cancelBooking(id, reason);
    if (result.success) {
      setBookings([...result.updatedBookings]);
      showToast(result.message);
    }
  };

  // Handle slot clicked on calendar
  const handleSelectSlotFromCalendar = (roomId: string, date: string, startTime: string) => {
    setPreselectedSlot({ roomId, date, startTime });
    setActiveTab('book');
  };

  // Handle Reset to Demo
  const handleResetDemo = () => {
    const resetData = resetToDemoBookings();
    setBookings([...resetData]);
    showToast('รีเซ็ตข้อมูลตัวอย่างเรียบร้อยแล้ว');
  };

  // Handle Import JSON
  const handleImportBookings = (imported: Booking[]) => {
    saveStoredBookings(imported);
    setBookings([...imported]);
    showToast(`นำเข้าข้อมูล ${imported.length} รายการสำเร็จ!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-20 md:pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BAR CONTRACT: Brand — Nav Links — 1 Primary Action */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <button
            onClick={() => setActiveTab('book')}
            className="flex items-center gap-2.5 text-left shrink-0 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-sky-600 transition-colors">
              MS
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block whitespace-nowrap">
                ระบบจองห้องประชุม
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight font-mono">
                MeetingSpace 2026
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Single-line whitespace-nowrap) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('book')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'book'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              จองห้องประชุม
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              ปฏิทินห้องว่าง
            </button>
            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'my-bookings'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              รายการจอง ({bookings.filter((b) => b.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              สถิติการใช้งาน
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'guide'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              Tech Stack & คู่มือ
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setPreselectedSlot(null);
                setActiveTab('book');
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-sky-400" />
              <span>จองห้องทันที</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* TAB 1: Booking Form */}
        {activeTab === 'book' && (
          <BookingForm
            existingBookings={bookings}
            onBookingSuccess={handleBookingSuccess}
            preselectedRoomId={preselectedSlot?.roomId}
            preselectedDate={preselectedSlot?.date}
            preselectedStartTime={preselectedSlot?.startTime}
            onViewCalendar={() => setActiveTab('calendar')}
          />
        )}

        {/* TAB 2: Calendar / Timetable */}
        {activeTab === 'calendar' && (
          <TimetableCalendar
            bookings={bookings}
            onSelectSlotToBook={handleSelectSlotFromCalendar}
          />
        )}

        {/* TAB 3: My Bookings & Self Cancellation */}
        {activeTab === 'my-bookings' && (
          <MyBookingsList
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            onBookNew={() => {
              setPreselectedSlot(null);
              setActiveTab('book');
            }}
          />
        )}

        {/* TAB 4: Statistics Dashboard (Admin) */}
        {activeTab === 'stats' && <StatsDashboard bookings={bookings} />}

        {/* TAB 5: Tech Stack & Beginner Guide */}
        {activeTab === 'guide' && (
          <TechStackGuide
            bookings={bookings}
            onResetDemoData={handleResetDemo}
            onImportBookings={handleImportBookings}
          />
        )}
      </main>

      {/* Mobile-First Bottom Navigation Bar (Natural thumb reach zone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
        <div className="grid grid-cols-5 items-center">
          <button
            onClick={() => setActiveTab('book')}
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl py-1 transition-colors ${
              activeTab === 'book'
                ? 'text-slate-900 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <PlusCircle className={`w-5 h-5 ${activeTab === 'book' ? 'text-sky-600' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">จองห้อง</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl py-1 transition-colors ${
              activeTab === 'calendar'
                ? 'text-slate-900 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className={`w-5 h-5 ${activeTab === 'calendar' ? 'text-sky-600' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">ปฏิทิน</span>
          </button>

          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl py-1 transition-colors relative ${
              activeTab === 'my-bookings'
                ? 'text-slate-900 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className={`w-5 h-5 ${activeTab === 'my-bookings' ? 'text-sky-600' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">รายการจอง</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl py-1 transition-colors ${
              activeTab === 'stats'
                ? 'text-slate-900 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className={`w-5 h-5 ${activeTab === 'stats' ? 'text-sky-600' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">สถิติ</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl py-1 transition-colors ${
              activeTab === 'guide'
                ? 'text-slate-900 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className={`w-5 h-5 ${activeTab === 'guide' ? 'text-sky-600' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">คู่มือ</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-auto bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ระบบจองห้องประชุมอัจฉริยะ (Meeting Room Booking System) · เวลาทำการ 08:30 - 16:30 น.</span>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>จองล่วงหน้าได้สูงสุด 30 วัน</span>
            <span>·</span>
            <span>ระบบป้องกันการจองซ้อน 100%</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
