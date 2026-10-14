import React, { useState, useEffect } from 'react';
import { Servicio, Profesional, Horario, Cita } from '../types';
import { ZamayAPI } from '../lib/supabase';
import { X, Calendar as CalendarIcon, Clock, User, CheckCircle2, ArrowRight, ArrowLeft, Phone, Scissors, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedServices: Servicio[];
  onBookingSuccess: () => void;
  profesionales: Profesional[];
  horarios: Horario[];
  citasExistentes: Cita[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedServices,
  onBookingSuccess,
  profesionales,
  horarios,
  citasExistentes,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [selectedProfId, setSelectedProfId] = useState<string>('cualquiera');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [clienteNombre, setClienteNombre] = useState<string>('');
  const [clienteTelefono, setClienteTelefono] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const totalDuration = selectedServices.reduce((acc, s) => acc + s.duracion_min, 0);
  const totalPrice = selectedServices.reduce((acc, s) => acc + (s.precio_promo ?? s.precio), 0);

  // Calculate available time slots for selectedDate & totalDuration & selectedProfId
  const getAvailableSlots = () => {
    if (!selectedDate) return [];

    const dateObj = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = dateObj.getDay(); // 0 (Dom) to 6 (Sab)

    // Find schedule for this day of week
    const horarioDia = horarios.find(h => h.dia_semana === dayOfWeek);
    if (!horarioDia) return []; // Closed

    const [startH, startM] = horarioDia.hora_inicio.split(':').map(Number);
    const [endH, endM] = horarioDia.hora_fin.split(':').map(Number);

    const slots: string[] = [];
    let currentMinutes = startH * 60 + startM;
    const closingMinutes = endH * 60 + endM;

    // Filter existing confirmed appointments for this date and professional
    const dayAppointments = citasExistentes.filter(c => {
      if (c.estado !== 'confirmada') return false;
      const cDate = new Date(c.inicio).toISOString().split('T')[0];
      if (cDate !== selectedDate) return false;
      if (selectedProfId !== 'cualquiera') {
        const profName = profesionales.find(p => p.id === selectedProfId)?.nombre;
        if (c.profesional_nombre !== profName) return false;
      }
      return true;
    });

    const now = new Date();
    const isToday = selectedDate === now.toISOString().split('T')[0];
    const currentTotalMinutesNow = now.getHours() * 60 + now.getMinutes();

    while (currentMinutes + totalDuration <= closingMinutes) {
      const slotHour = Math.floor(currentMinutes / 60);
      const slotMin = currentMinutes % 60;
      const timeStr = `${String(slotHour).padStart(2, '0')}:${String(slotMin).padStart(2, '0')}`;

      // Check if slot is in the past for today
      if (isToday && currentMinutes <= currentTotalMinutesNow) {
        currentMinutes += 30; // 30 min blocks
        continue;
      }

      // Check overlap with existing appointments
      const slotStartDateTime = new Date(`${selectedDate}T${timeStr}:00`).getTime();
      const slotEndDateTime = slotStartDateTime + totalDuration * 60 * 1000;

      let hasOverlap = false;
      for (const app of dayAppointments) {
        const appStart = new Date(app.inicio).getTime();
        const appEnd = new Date(app.fin).getTime();
        if (slotStartDateTime < appEnd && slotEndDateTime > appStart) {
          hasOverlap = true;
          break;
        }
      }

      if (!hasOverlap) {
        slots.push(timeStr);
      }

      currentMinutes += 30; // 30 min increments
    }

    return slots;
  };

  const availableSlots = getAvailableSlots();

  const handleConfirmBooking = async () => {
    // Validate phone: 9 digits, starts with 9
    const phoneRegex = /^9\d{8}$/;
    if (!phoneRegex.test(clienteTelefono.trim())) {
      setErrorMsg('El número de WhatsApp debe tener 9 dígitos y empezar con 9 (Ej: 987654321).');
      return;
    }
    if (!clienteNombre.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const servicioNombre = selectedServices.map(s => s.nombre).join(' + ');
      const profName = selectedProfId === 'cualquiera' 
        ? 'Cualquier especialista' 
        : (profesionales.find(p => p.id === selectedProfId)?.nombre || 'Especialista Zamay');

      const inicioISO = new Date(`${selectedDate}T${selectedTimeSlot}:00`).toISOString();
      const finISO = new Date(new Date(`${selectedDate}T${selectedTimeSlot}:00`).getTime() + totalDuration * 60 * 1000).toISOString();

      await ZamayAPI.crearCita({
        cliente_nombre: clienteNombre.trim(),
        cliente_telefono: clienteTelefono.trim(),
        servicio_nombre: servicioNombre,
        profesional_nombre: profName,
        inicio: inicioISO,
        fin: finISO,
        estado: 'confirmada',
      });

      setStep(6); // Success step
    } catch (err: any) {
      setErrorMsg('Error al registrar la cita: ' + (err.message || 'Intente nuevamente'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => { if (step !== 6) onClose(); }}
      />

      {/* Sheet Container with Swipe-to-Close */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={(e, info) => {
          if ((info.offset.y > 100 || info.velocity.y > 300) && step !== 6) {
            onClose();
          }
        }}
        className="relative w-full sm:max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden border-t sm:border border-[#b08d3c]/30 z-10 max-h-[92vh] flex flex-col cursor-grab active:cursor-grabbing"
      >
        {/* Luxury Header with integrated drag handle */}
        <div className="bg-[#56622f] text-white pt-3 pb-4 px-5 flex flex-col cursor-default">
          <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-3 sm:hidden" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#b08d3c] flex items-center justify-center text-white shadow-inner">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-serif text-xl font-bold tracking-wide">Reserva tu Cita</h2>
            </div>
            {step !== 6 && (
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors active:scale-95 text-white/90">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar steps */}
        {step < 6 && (
          <div className="bg-[#ebe7de] px-4 py-3 flex items-center justify-between text-[11px] font-semibold text-[#56622f] cursor-default border-b border-[#b08d3c]/20">
            {[
              { num: 1, label: 'Servicios' },
              { num: 2, label: 'Especialista' },
              { num: 3, label: 'Fecha' },
              { num: 4, label: 'Hora' },
              { num: 5, label: 'Datos' },
            ].map(s => (
              <div key={s.num} className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === s.num ? 'bg-[#b08d3c] text-white shadow' : step > s.num ? 'bg-[#56622f] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s.num}
                </span>
                <span className={`hidden sm:inline ${step === s.num ? 'text-[#56622f] font-bold' : 'text-gray-500'}`}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 pb-8 sm:pb-6 cursor-default">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Step 1: Review Services */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#23291d]">Servicios Seleccionados</h3>
              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                {selectedServices.map(s => (
                  <div key={s.id} className="flex justify-between items-center p-3.5 bg-[#f6f4ee] rounded-2xl border border-[#b08d3c]/20 shadow-sm">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#23291d]">{s.nombre}</h4>
                      <p className="text-xs text-[#23291d]/70 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-[#b08d3c]" /> {s.duracion_min} min
                      </p>
                    </div>
                    <span className="font-bold text-sm text-[#56622f]">
                      S/ {(s.precio_promo ?? s.precio).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm font-bold text-[#23291d]">
                <span className="text-gray-600 font-sans">Total estimado:</span>
                <div className="text-right">
                  <span className="font-serif text-2xl text-[#56622f]">S/ {totalPrice.toFixed(2)}</span>
                  <p className="text-xs text-[#b08d3c] font-medium">{totalDuration} min en total</p>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full mt-4 py-3.5 bg-[#56622f] hover:bg-[#3f4922] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Choose Professional */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#23291d]">Elige tu Especialista</h3>
              <p className="text-xs text-[#23291d]/70">Puedes elegir a tu especialista de preferencia o dejar que asignemos al disponible.</p>
              
              <div className="space-y-2.5">
                <div
                  onClick={() => setSelectedProfId('cualquiera')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between active:scale-[0.99] shadow-sm ${
                    selectedProfId === 'cualquiera'
                      ? 'bg-[#56622f] text-white border-[#56622f] shadow'
                      : 'bg-[#f6f4ee] text-[#23291d] border-[#b08d3c]/30 hover:border-[#56622f]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${selectedProfId === 'cualquiera' ? 'bg-[#b08d3c] text-white' : 'bg-white text-[#56622f]'}`}>
                      ★
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm">Cualquier Especialista Disponible</h4>
                      <p className={`text-xs ${selectedProfId === 'cualquiera' ? 'text-white/80' : 'text-[#23291d]/60'}`}>Asignación rápida según horario</p>
                    </div>
                  </div>
                </div>

                {profesionales.filter(p => p.activo).map(prof => (
                  <div
                    key={prof.id}
                    onClick={() => setSelectedProfId(prof.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between active:scale-[0.99] shadow-sm ${
                      selectedProfId === prof.id
                        ? 'bg-[#56622f] text-white border-[#56622f] shadow'
                        : 'bg-[#f6f4ee] text-[#23291d] border-[#b08d3c]/30 hover:border-[#56622f]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${selectedProfId === prof.id ? 'bg-[#b08d3c] text-white' : 'bg-white text-[#56622f]'}`}>
                        {prof.nombre.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm">{prof.nombre}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-3 bg-[#ebe7de] text-[#23291d] rounded-2xl font-semibold text-xs flex items-center gap-1 active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-[#56622f] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1 shadow active:scale-95"
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Choose Date */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#23291d]">Selecciona la Fecha</h3>
              <p className="text-xs text-[#23291d]/70">Elige el día para tu cita en Zamay Estética Spa.</p>

              <div>
                <label className="block text-xs font-semibold text-[#23291d] mb-1">Fecha de la cita:</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#f6f4ee] p-3.5 rounded-2xl border border-[#b08d3c]/40 font-medium text-sm text-[#23291d] focus:outline-none focus:ring-2 focus:ring-[#56622f]"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-3 bg-[#ebe7de] text-[#23291d] rounded-2xl font-semibold text-xs flex items-center gap-1 active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-3 bg-[#56622f] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1 shadow active:scale-95"
                >
                  Ver Horas Libres <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Choose Time Slot */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#23291d]">Horarios Disponibles</h3>
              <p className="text-xs text-[#23291d]/70">
                Fecha: <span className="font-bold text-[#56622f]">{selectedDate}</span> ({totalDuration} min de duración)
              </p>

              {availableSlots.length === 0 ? (
                <div className="p-6 text-center bg-[#f6f4ee] rounded-2xl border border-[#b08d3c]/20">
                  <p className="font-serif text-base font-bold text-red-700">No hay horarios disponibles</p>
                  <p className="text-xs text-[#23291d]/70 mt-1">El salón está cerrado en este día o la agenda está completa. Por favor elige otra fecha.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {availableSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTimeSlot(time)}
                      className={`py-3 rounded-2xl text-xs font-bold border transition-all active:scale-95 ${
                        selectedTimeSlot === time
                          ? 'bg-[#56622f] text-white border-[#56622f] shadow'
                          : 'bg-[#f6f4ee] text-[#23291d] border-[#b08d3c]/30 hover:border-[#56622f]'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-3 bg-[#ebe7de] text-[#23291d] rounded-2xl font-semibold text-xs flex items-center gap-1 active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                  disabled={!selectedTimeSlot}
                  onClick={() => setStep(5)}
                  className={`flex-1 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1 shadow transition-all active:scale-95 ${
                    selectedTimeSlot ? 'bg-[#56622f] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Customer Details */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#23291d]">Tus Datos de Contacto</h3>
              <p className="text-xs text-[#23291d]/70">Ingresa tu nombre y tu número de WhatsApp para enviarte la confirmación.</p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#23291d] mb-1">Nombre completo:</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b08d3c]" />
                    <input
                      type="text"
                      placeholder="Ej. María Huamán"
                      value={clienteNombre}
                      onChange={(e) => setClienteNombre(e.target.value)}
                      className="w-full bg-[#f6f4ee] pl-10 pr-4 py-3.5 rounded-2xl border border-[#b08d3c]/30 text-sm text-[#23291d] focus:outline-none focus:ring-2 focus:ring-[#56622f]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#23291d] mb-1">WhatsApp (9 dígitos, empieza con 9):</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b08d3c]" />
                    <input
                      type="tel"
                      maxLength={9}
                      placeholder="Ej. 987654321"
                      value={clienteTelefono}
                      onChange={(e) => setClienteTelefono(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#f6f4ee] pl-10 pr-4 py-3.5 rounded-2xl border border-[#b08d3c]/30 text-sm text-[#23291d] focus:outline-none focus:ring-2 focus:ring-[#56622f]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#f6f4ee] rounded-2xl border border-[#b08d3c]/20 text-xs space-y-1.5 text-[#23291d]/80">
                <p><strong>Cita:</strong> {selectedServices.map(s => s.nombre).join(' + ')}</p>
                <p><strong>Fecha y Hora:</strong> {selectedDate} a las {selectedTimeSlot}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(4)}
                  className="px-5 py-3 bg-[#ebe7de] text-[#23291d] rounded-2xl font-semibold text-xs flex items-center gap-1 active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                  disabled={loading}
                  onClick={handleConfirmBooking}
                  className="flex-1 py-3.5 bg-[#b08d3c] hover:bg-[#9a7830] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
                >
                  {loading ? 'Confirmando...' : 'Confirmar Cita'}
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Success Screen */}
          {step === 6 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#23291d]">¡Tu cita está confirmada!</h3>
              <p className="text-sm text-[#23291d]/80 max-w-sm mx-auto">
                Te llegará un mensaje de confirmación a tu WhatsApp al número <span className="font-bold text-[#56622f]">{clienteTelefono}</span>.
              </p>

              <div className="p-4 bg-[#f6f4ee] rounded-2xl border border-[#b08d3c]/30 text-xs text-left space-y-1.5">
                <p><strong>Cliente:</strong> {clienteNombre}</p>
                <p><strong>Servicios:</strong> {selectedServices.map(s => s.nombre).join(' + ')}</p>
                <p><strong>Fecha:</strong> {selectedDate}</p>
                <p><strong>Hora:</strong> {selectedTimeSlot}</p>
                <p><strong>Total:</strong> S/ {totalPrice.toFixed(2)}</p>
              </div>

              <button
                onClick={() => {
                  onBookingSuccess();
                  onClose();
                }}
                className="w-full py-3.5 bg-[#56622f] hover:bg-[#3f4922] text-white rounded-2xl font-bold text-sm shadow transition-transform active:scale-95"
              >
                Entendido / Volver al Inicio
              </button>
            </div>
          )}

        </div>

      </motion.div>
    </div>
  );
};
