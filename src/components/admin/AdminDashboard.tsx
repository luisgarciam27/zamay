import React, { useState, useEffect } from 'react';
import { Servicio, Producto, Profesional, Horario, Cita } from '../../types';
import { ZamayAPI, supabase, isSupabaseConfigured } from '../../lib/supabase';
import { 
  Calendar as CalendarIcon, Clock, Users, Scissors, ShoppingBag, 
  CheckCircle2, XCircle, Plus, Edit, Trash2, Upload, LogOut, 
  Filter, Database, ChevronRight, Phone, Sparkles, AlertCircle 
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'servicios' | 'productos' | 'profesionales' | 'horarios' | 'clientas' | 'sql'>('agenda');

  // Data states
  const [citas, setCitas] = useState<Cita[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);

  // Agenda filters
  const [agendaView, setAgendaView] = useState<'dia' | 'semana'>('dia');
  const [filterProf, setFilterProf] = useState<string>('todos');
  const [selectedAgendaDate, setSelectedAgendaDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Modals for CRUD
  const [editingServicio, setEditingServicio] = useState<Partial<Servicio> | null>(null);
  const [editingProducto, setEditingProducto] = useState<Partial<Producto> | null>(null);
  const [editingProfesional, setEditingProfesional] = useState<Partial<Profesional> | null>(null);
  const [editingHorario, setEditingHorario] = useState<Partial<Horario> | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      const [c, s, p, pr, h] = await Promise.all([
        ZamayAPI.getCitas(),
        ZamayAPI.getServicios(),
        ZamayAPI.getProductos(),
        ZamayAPI.getProfesionales(),
        ZamayAPI.getHorarios(),
      ]);
      setCitas(c);
      setServicios(s);
      setProductos(p);
      setProfesionales(pr);
      setHorarios(h);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Supabase Realtime subscription on "citas" as requested by prompt
    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel('public:citas')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'citas' }, payload => {
          loadData();
        })
        .subscribe();
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Update appointment status (Completada / Cancelada)
  const handleUpdateCitaStatus = async (id: string, estado: 'confirmada' | 'completada' | 'cancelada') => {
    try {
      await ZamayAPI.actualizarEstadoCita(id, estado);
      await loadData();
    } catch (err: any) {
      alert('Error al actualizar cita: ' + err.message);
    }
  };

  // Image upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'servicio' | 'producto') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await ZamayAPI.uploadImage(file);
      if (type === 'servicio' && editingServicio) {
        setEditingServicio({ ...editingServicio, imagen_url: url });
      } else if (type === 'producto' && editingProducto) {
        setEditingProducto({ ...editingProducto, imagen_url: url });
      }
    } catch (err: any) {
      alert('Error al subir imagen: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Servicio
  const handleSaveServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingServicio) return;
    try {
      await ZamayAPI.saveServicio(editingServicio);
      setEditingServicio(null);
      await loadData();
    } catch (err: any) {
      alert('Error al guardar servicio: ' + err.message);
    }
  };

  // Save Producto
  const handleSaveProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProducto) return;
    try {
      await ZamayAPI.saveProducto(editingProducto);
      setEditingProducto(null);
      await loadData();
    } catch (err: any) {
      alert('Error al guardar producto: ' + err.message);
    }
  };

  // Save Profesional
  const handleSaveProfesional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfesional) return;
    try {
      await ZamayAPI.saveProfesional(editingProfesional);
      setEditingProfesional(null);
      await loadData();
    } catch (err: any) {
      alert('Error al guardar profesional: ' + err.message);
    }
  };

  // Save Horario
  const handleSaveHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHorario) return;
    try {
      await ZamayAPI.saveHorario(editingHorario);
      setEditingHorario(null);
      await loadData();
    } catch (err: any) {
      alert('Error al guardar horario: ' + err.message);
    }
  };

  // Derived client list from citas
  const getClientasList = () => {
    const map = new Map<string, { nombre: string; telefono: string; ultimaVisita: string; totalVisitas: number }>();
    citas.forEach(c => {
      const key = c.cliente_telefono;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          nombre: c.cliente_nombre,
          telefono: c.cliente_telefono,
          ultimaVisita: c.inicio,
          totalVisitas: 1,
        });
      } else {
        existing.totalVisitas += 1;
        if (new Date(c.inicio) > new Date(existing.ultimaVisita)) {
          existing.ultimaVisita = c.inicio;
        }
      }
    });
    return Array.from(map.values());
  };

  const clientasList = getClientasList();

  // Filtered appointments for agenda
  const filteredCitas = citas.filter(c => {
    const cDate = new Date(c.inicio).toISOString().split('T')[0];
    if (agendaView === 'dia' && cDate !== selectedAgendaDate) return false;
    if (filterProf !== 'todos' && c.profesional_nombre !== filterProf) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f6f4ee] pb-12">
      {/* Admin Header */}
      <div className="bg-[#56622f] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#b08d3c] rounded-full flex items-center justify-center font-bold text-lg">
              ⚙️
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold">Zamay Estética Spa • Panel Admin</h1>
              <p className="text-xs text-[#f6f4ee]/80">Gestión de citas, servicios y productos</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-700/80 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
          {[
            { id: 'agenda', label: 'Agenda', icon: CalendarIcon },
            { id: 'servicios', label: 'Servicios', icon: Scissors },
            { id: 'productos', label: 'Productos', icon: ShoppingBag },
            { id: 'profesionales', label: 'Profesionales', icon: Users },
            { id: 'horarios', label: 'Horarios', icon: Clock },
            { id: 'clientas', label: 'Clientas', icon: Users },
            { id: 'sql', label: 'SQL & RLS Schema', icon: Database },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#b08d3c] text-white shadow'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        {/* TAB 1: AGENDA */}
        {activeTab === 'agenda' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-[#b08d3c]/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex bg-[#ebe7de] p-1 rounded-xl">
                  <button
                    onClick={() => setAgendaView('dia')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      agendaView === 'dia' ? 'bg-[#56622f] text-white' : 'text-[#23291d]'
                    }`}
                  >
                    Vista Día
                  </button>
                  <button
                    onClick={() => setAgendaView('semana')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      agendaView === 'semana' ? 'bg-[#56622f] text-white' : 'text-[#23291d]'
                    }`}
                  >
                    Vista General
                  </button>
                </div>

                {agendaView === 'dia' && (
                  <input
                    type="date"
                    value={selectedAgendaDate}
                    onChange={(e) => setSelectedAgendaDate(e.target.value)}
                    className="bg-[#f6f4ee] px-3 py-1.5 rounded-xl border border-[#b08d3c]/30 text-xs font-bold text-[#23291d]"
                  />
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-[#b08d3c]" />
                <select
                  value={filterProf}
                  onChange={(e) => setFilterProf(e.target.value)}
                  className="bg-[#f6f4ee] px-3 py-1.5 rounded-xl border border-[#b08d3c]/30 text-xs font-bold text-[#23291d] w-full sm:w-auto"
                >
                  <option value="todos">Todos los profesionales</option>
                  {profesionales.map(p => (
                    <option key={p.id} value={p.nombre}>{p.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Citas List */}
            <div className="bg-white rounded-2xl border border-[#b08d3c]/20 shadow-sm overflow-hidden">
              <div className="p-4 bg-[#ebe7de] border-b border-[#b08d3c]/20 flex justify-between items-center">
                <h3 className="font-serif font-bold text-[#23291d]">
                  Agenda de Citas ({filteredCitas.length})
                </h3>
                <span className="text-xs text-[#56622f] font-semibold">Sincronización en tiempo real activa</span>
              </div>

              {filteredCitas.length === 0 ? (
                <div className="text-center py-16 text-[#23291d]/60">
                  <CalendarIcon className="w-12 h-12 mx-auto text-[#b08d3c]/40 mb-2" />
                  <p className="font-serif text-lg">No hay citas registradas</p>
                  <p className="text-xs">Las reservas de tus clientas aparecerán aquí automáticamente.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredCitas.map(cita => {
                    const startStr = new Date(cita.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const endStr = new Date(cita.fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const dateStr = new Date(cita.inicio).toLocaleDateString();

                    return (
                      <div key={cita.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#f6f4ee]/50 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              cita.estado === 'confirmada' ? 'bg-amber-100 text-amber-800' :
                              cita.estado === 'completada' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {cita.estado}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">{dateStr} • {startStr} - {endStr}</span>
                          </div>

                          <h4 className="font-serif text-base font-bold text-[#23291d]">{cita.cliente_nombre}</h4>
                          <p className="text-xs text-[#56622f] font-semibold flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {cita.cliente_telefono}
                          </p>
                          <p className="text-xs text-[#23291d]/80">
                            <strong>Servicio(s):</strong> {cita.servicio_nombre}
                          </p>
                          <p className="text-xs text-[#b08d3c] font-medium">
                            <strong>Especialista:</strong> {cita.profesional_nombre}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {cita.estado === 'confirmada' && (
                            <>
                              <button
                                onClick={() => handleUpdateCitaStatus(cita.id, 'completada')}
                                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm"
                                title="Marcar como completada (Dispara reseña automática)"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Completada
                              </button>
                              <button
                                onClick={() => handleUpdateCitaStatus(cita.id, 'cancelada')}
                                className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Cancelar
                              </button>
                            </>
                          )}
                          {cita.estado !== 'confirmada' && (
                            <button
                              onClick={() => handleUpdateCitaStatus(cita.id, 'confirmada')}
                              className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold"
                            >
                              Reabrir
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SERVICIOS CRUD */}
        {activeTab === 'servicios' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-serif text-2xl font-bold text-[#23291d]">Gestión de Servicios</h2>
              <button
                onClick={() => setEditingServicio({ activo: true, orden: servicios.length + 1 })}
                className="px-4 py-2 bg-[#56622f] hover:bg-[#3f4922] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Nuevo Servicio
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {servicios.map(s => (
                <div key={s.id} className="bg-white p-4 rounded-2xl border border-[#b08d3c]/20 shadow-sm flex flex-col justify-between">
                  <div>
                    <img src={s.imagen_url || 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=400&q=80'} alt={s.nombre} className="w-full h-36 object-cover rounded-xl mb-3 bg-gray-100" />
                    <span className="text-[10px] font-bold text-[#b08d3c] uppercase">{s.categoria}</span>
                    <h3 className="font-serif text-base font-bold text-[#23291d]">{s.nombre}</h3>
                    <p className="text-xs text-[#23291d]/70 mt-1 line-clamp-2">{s.descripcion}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-bold text-[#56622f]">S/ {s.precio_promo ?? s.precio}</span>
                      {s.precio_promo && <span className="text-xs text-gray-400 line-through">S/ {s.precio}</span>}
                      <span className="text-xs text-[#b08d3c] ml-auto">⏱ {s.duracion_min} min</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
                    <button
                      onClick={() => setEditingServicio(s)}
                      className="px-3 py-1.5 bg-[#ebe7de] hover:bg-[#d4af37]/20 text-[#23291d] rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('¿Eliminar servicio?')) {
                          await ZamayAPI.deleteServicio(s.id);
                          await loadData();
                        }
                      }}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTOS CRUD */}
        {activeTab === 'productos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-serif text-2xl font-bold text-[#23291d]">Gestión de Productos</h2>
              <button
                onClick={() => setEditingProducto({ activo: true, stock: 10 })}
                className="px-4 py-2 bg-[#56622f] hover:bg-[#3f4922] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Nuevo Producto
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {productos.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-2xl border border-[#b08d3c]/20 shadow-sm flex flex-col justify-between">
                  <div>
                    <img src={p.imagen_url || 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80'} alt={p.nombre} className="w-full h-32 object-cover rounded-xl mb-3 bg-gray-100" />
                    <span className="text-[10px] font-bold text-[#b08d3c] uppercase">{p.categoria}</span>
                    <h3 className="font-serif text-sm font-bold text-[#23291d]">{p.nombre}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-bold text-[#56622f]">S/ {p.precio_promo ?? p.precio}</span>
                      <span className="text-xs text-[#b08d3c] ml-auto">Stock: {p.stock}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
                    <button
                      onClick={() => setEditingProducto(p)}
                      className="px-3 py-1.5 bg-[#ebe7de] hover:bg-[#d4af37]/20 text-[#23291d] rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('¿Eliminar producto?')) {
                          await ZamayAPI.deleteProducto(p.id);
                          await loadData();
                        }
                      }}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROFESIONALES CRUD */}
        {activeTab === 'profesionales' && (
          <div className="space-y-6 max-w-2xl">
            <div className="flex justify-between items-center">
              <h2 className="font-serif text-2xl font-bold text-[#23291d]">Profesionales</h2>
              <button
                onClick={() => setEditingProfesional({ activo: true })}
                className="px-4 py-2 bg-[#56622f] hover:bg-[#3f4922] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Nuevo Profesional
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#b08d3c]/20 shadow-sm divide-y divide-gray-100">
              {profesionales.map(prof => (
                <div key={prof.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#b08d3c] text-white flex items-center justify-center font-bold">
                      {prof.nombre.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-[#23291d]">{prof.nombre}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${prof.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                        {prof.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingProfesional(prof)}
                      className="px-3 py-1.5 bg-[#ebe7de] text-[#23291d] rounded-xl text-xs font-semibold"
                    >
                      Editar
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('¿Eliminar profesional?')) {
                          await ZamayAPI.deleteProfesional(prof.id);
                          await loadData();
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: HORARIOS CRUD */}
        {activeTab === 'horarios' && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex justify-between items-center">
              <h2 className="font-serif text-2xl font-bold text-[#23291d]">Horarios de Atención</h2>
            </div>

            <div className="bg-white rounded-2xl border border-[#b08d3c]/20 shadow-sm divide-y divide-gray-100">
              {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((diaNombre, idx) => {
                const horarioItem = horarios.find(h => h.dia_semana === idx);
                return (
                  <div key={idx} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-[#23291d]">{diaNombre}</h4>
                      <p className="text-xs text-[#23291d]/70">
                        {horarioItem ? `${horarioItem.hora_inicio} - ${horarioItem.hora_fin}` : 'Cerrado'}
                      </p>
                    </div>

                    <button
                      onClick={() => setEditingHorario(horarioItem || { dia_semana: idx, hora_inicio: '09:00', hora_fin: '19:00' })}
                      className="px-3 py-1.5 bg-[#ebe7de] text-[#23291d] rounded-xl text-xs font-semibold"
                    >
                      Configurar Horario
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: CLIENTAS LIST */}
        {activeTab === 'clientas' && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#23291d]">Directorio de Clientas ({clientasList.length})</h2>
            <div className="bg-white rounded-2xl border border-[#b08d3c]/20 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {clientasList.length === 0 ? (
                  <div className="p-8 text-center text-[#23291d]/60">No hay clientas registradas aún.</div>
                ) : (
                  clientasList.map((cl, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-serif font-bold text-[#23291d]">{cl.nombre}</h4>
                        <p className="text-xs text-[#56622f] font-semibold flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {cl.telefono}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#b08d3c]">{cl.totalVisitas} citas totales</p>
                        <p className="text-[11px] text-gray-500">Última visita: {new Date(cl.ultimaVisita).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SQL & RLS SCHEMA */}
        {activeTab === 'sql' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-white p-6 rounded-2xl border border-[#b08d3c]/20 shadow-sm space-y-4">
              <h2 className="font-serif text-2xl font-bold text-[#23291d] flex items-center gap-2">
                <Database className="w-6 h-6 text-[#56622f]" /> Supabase SQL Schema & RLS Policies
              </h2>
              <p className="text-xs text-[#23291d]/80">
                Copia y ejecuta el siguiente script SQL en tu panel de Supabase SQL Editor para crear las tablas necesarias, configurar las políticas RLS y habilitar Realtime.
              </p>

              <pre className="bg-[#23291d] text-[#f6f4ee] p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
{`-- 1. TABLA SERVICIOS
create table if not exists servicios (
  id uuid default gen_random_uuid() primary key,
  categoria text not null,
  nombre text not null,
  descripcion text,
  precio numeric not null,
  precio_promo numeric,
  duracion_min integer not null default 60,
  imagen_url text,
  activo boolean default true,
  orden integer default 0
);

-- 2. TABLA PRODUCTOS
create table if not exists productos (
  id uuid default gen_random_uuid() primary key,
  categoria text not null,
  nombre text not null,
  descripcion text,
  precio numeric not null,
  precio_promo numeric,
  imagen_url text,
  stock integer default 10,
  activo boolean default true
);

-- 3. TABLA PROFESIONALES
create table if not exists profesionales (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  activo boolean default true
);

-- 4. TABLA HORARIOS
create table if not exists horarios (
  id uuid default gen_random_uuid() primary key,
  dia_semana integer not null, -- 0 (Dom) a 6 (Sab)
  hora_inicio text not null,
  hora_fin text not null
);

-- 5. TABLA CITAS (EXISTENTE - Manteniendo estructura exacta)
create table if not exists citas (
  id uuid default gen_random_uuid() primary key,
  cliente_nombre text not null,
  cliente_telefono text not null,
  servicio_nombre text not null,
  profesional_nombre text not null,
  inicio timestamptz not null,
  fin timestamptz not null,
  estado text check (estado in ('confirmada', 'completada', 'cancelada')) default 'confirmada',
  recordatorio_24h boolean default false,
  recordatorio_2h boolean default false,
  resena_enviada boolean default false,
  created_at timestamptz default now()
);

-- HABILITAR REALTIME
alter publication supabase_realtime add table citas;

-- POLÍTICAS RLS (Row Level Security)
alter table servicios enable row level security;
alter table productos enable row level security;
alter table profesionales enable row level security;
alter table horarios enable row level security;
alter table citas enable row level security;

create policy "Anon lee servicios activos" on servicios for select using (activo = true);
create policy "Admin todo servicios" on servicios for all using (auth.role() = 'authenticated');

create policy "Anon lee productos activos" on productos for select using (activo = true);
create policy "Admin todo productos" on productos for all using (auth.role() = 'authenticated');

create policy "Anon lee profesionales activos" on profesionales for select using (activo = true);
create policy "Admin todo profesionales" on profesionales for all using (auth.role() = 'authenticated');

create policy "Anon lee horarios" on horarios for select using (true);
create policy "Admin todo horarios" on horarios for all using (auth.role() = 'authenticated');

create policy "Anon lee citas inicio fin" on citas for select using (true);
create policy "Anon inserta citas" on citas for insert with check (true);
create policy "Admin todo citas" on citas for all using (auth.role() = 'authenticated');
`}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* MODAL EDIT SERVICIO */}
      {editingServicio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#23291d]">
              {editingServicio.id ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h3>
            <form onSubmit={handleSaveServicio} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold">Categoría:</label>
                <input
                  type="text"
                  required
                  value={editingServicio.categoria || ''}
                  onChange={e => setEditingServicio({ ...editingServicio, categoria: e.target.value })}
                  className="w-full bg-[#f6f4ee] p-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold">Nombre:</label>
                <input
                  type="text"
                  required
                  value={editingServicio.nombre || ''}
                  onChange={e => setEditingServicio({ ...editingServicio, nombre: e.target.value })}
                  className="w-full bg-[#f6f4ee] p-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold">Descripción:</label>
                <textarea
                  value={editingServicio.descripcion || ''}
                  onChange={e => setEditingServicio({ ...editingServicio, descripcion: e.target.value })}
                  className="w-full bg-[#f6f4ee] p-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold">Precio Normal (S/):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingServicio.precio || ''}
                    onChange={e => setEditingServicio({ ...editingServicio, precio: parseFloat(e.target.value) })}
                    className="w-full bg-[#f6f4ee] p-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold">Precio Promo (S/):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingServicio.precio_promo ?? ''}
                    onChange={e => setEditingServicio({ ...editingServicio, precio_promo: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full bg-[#f6f4ee] p-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold">Duración (minutos):</label>
                <input
                  type="number"
                  required
                  value={editingServicio.duracion_min || 60}
                  onChange={e => setEditingServicio({ ...editingServicio, duracion_min: parseInt(e.target.value) })}
                  className="w-full bg-[#f6f4ee] p-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold">Imagen (URL o Subir a Supabase Storage bucket "zamay"):</label>
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="text"
                    value={editingServicio.imagen_url || ''}
                    onChange={e => setEditingServicio({ ...editingServicio, imagen_url: e.target.value })}
                    className="flex-1 bg-[#f6f4ee] p-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                  <label className="px-3 py-2 bg-[#56622f] text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-4 h-4" /> Subir
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'servicio')} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingServicio(null)}
                  className="px-4 py-2 bg-gray-200 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#56622f] text-white rounded-xl text-xs font-bold"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT PRODUCTO */}
      {editingProducto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#23291d]">
              {editingProducto.id ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <form onSubmit={handleSaveProducto} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold">Categoría:</label>
                <input
                  type="text"
                  required
                  value={editingProducto.categoria || ''}
                  onChange={e => setEditingProducto({ ...editingProducto, categoria: e.target.value })}
                  className="w-full bg-[#f6f4ee] p-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold">Nombre:</label>
                <input
                  type="text"
                  required
                  value={editingProducto.nombre || ''}
                  onChange={e => setEditingProducto({ ...editingProducto, nombre: e.target.value })}
                  className="w-full bg-[#f6f4ee] p-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold">Descripción:</label>
                <textarea
                  value={editingProducto.descripcion || ''}
                  onChange={e => setEditingProducto({ ...editingProducto, descripcion: e.target.value })}
                  className="w-full bg-[#f6f4ee] p-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold">Precio:</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProducto.precio || ''}
                    onChange={e => setEditingProducto({ ...editingProducto, precio: parseFloat(e.target.value) })}
                    className="w-full bg-[#f6f4ee] p-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold">Promo:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProducto.precio_promo ?? ''}
                    onChange={e => setEditingProducto({ ...editingProducto, precio_promo: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full bg-[#f6f4ee] p-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold">Stock:</label>
                  <input
                    type="number"
                    required
                    value={editingProducto.stock || 10}
                    onChange={e => setEditingProducto({ ...editingProducto, stock: parseInt(e.target.value) })}
                    className="w-full bg-[#f6f4ee] p-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold">Imagen (URL o Subir a bucket "zamay"):</label>
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="text"
                    value={editingProducto.imagen_url || ''}
                    onChange={e => setEditingProducto({ ...editingProducto, imagen_url: e.target.value })}
                    className="flex-1 bg-[#f6f4ee] p-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                  <label className="px-3 py-2 bg-[#56622f] text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-4 h-4" /> Subir
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'producto')} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProducto(null)}
                  className="px-4 py-2 bg-gray-200 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#56622f] text-white rounded-xl text-xs font-bold"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
