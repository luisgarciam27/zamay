import { createClient } from '@supabase/supabase-js';
import { Servicio, Producto, Profesional, Horario, Cita } from '../types';
import { SEED_SERVICIOS, SEED_PRODUCTOS, SEED_PROFESIONALES, SEED_HORARIOS } from '../data/seed';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// LocalStorage fallback keys
const LS_KEYS = {
  SERVICIOS: 'zamay_servicios_v1',
  PRODUCTOS: 'zamay_productos_v1',
  PROFESIONALES: 'zamay_profesionales_v1',
  HORARIOS: 'zamay_horarios_v1',
  CITAS: 'zamay_citas_v1',
};

// Helper to get with LS fallback
function getLocalStorageData<T>(key: string, seed: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(item);
  } catch {
    return seed;
  }
}

function setLocalStorageData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving to localStorage', err);
  }
}

// Data service wrappers
export const ZamayAPI = {
  async getServicios(): Promise<Servicio[]> {
    if (supabase) {
      const { data, error } = await supabase.from('servicios').select('*').order('orden', { ascending: true });
      if (!error && data && data.length > 0) return data;
    }
    return getLocalStorageData<Servicio[]>(LS_KEYS.SERVICIOS, SEED_SERVICIOS);
  },

  async saveServicio(servicio: Partial<Servicio>): Promise<Servicio> {
    if (supabase) {
      const id = servicio.id;
      const rest = { ...servicio };
      delete (rest as any).id;

      if (id && !id.startsWith('temp_')) {
        const { data, error } = await supabase.from('servicios').update(rest).eq('id', id).select().single();
        if (!error && data) return data;
      } else {
        const { data, error } = await supabase.from('servicios').insert([rest]).select().single();
        if (!error && data) return data;
      }
    }
    // Fallback LS
    const items = getLocalStorageData<Servicio[]>(LS_KEYS.SERVICIOS, SEED_SERVICIOS);
    const newId = servicio.id || 's_' + Date.now();
    const updatedItem = { ...servicio, id: newId } as Servicio;
    const index = items.findIndex(i => i.id === newId);
    let newItems;
    if (index >= 0) {
      newItems = items.map(i => i.id === newId ? updatedItem : i);
    } else {
      newItems = [...items, updatedItem];
    }
    setLocalStorageData(LS_KEYS.SERVICIOS, newItems);
    return updatedItem;
  },

  async deleteServicio(id: string): Promise<void> {
    if (supabase) {
      await supabase.from('servicios').delete().eq('id', id);
    }
    const items = getLocalStorageData<Servicio[]>(LS_KEYS.SERVICIOS, SEED_SERVICIOS);
    setLocalStorageData(LS_KEYS.SERVICIOS, items.filter(i => i.id !== id));
  },

  async getProductos(): Promise<Producto[]> {
    if (supabase) {
      const { data, error } = await supabase.from('productos').select('*');
      if (!error && data && data.length > 0) return data;
    }
    return getLocalStorageData<Producto[]>(LS_KEYS.PRODUCTOS, SEED_PRODUCTOS);
  },

  async saveProducto(producto: Partial<Producto>): Promise<Producto> {
    if (supabase) {
      const id = producto.id;
      const rest = { ...producto };
      delete (rest as any).id;

      if (id && !id.startsWith('temp_')) {
        const { data, error } = await supabase.from('productos').update(rest).eq('id', id).select().single();
        if (!error && data) return data;
      } else {
        const { data, error } = await supabase.from('productos').insert([rest]).select().single();
        if (!error && data) return data;
      }
    }
    const items = getLocalStorageData<Producto[]>(LS_KEYS.PRODUCTOS, SEED_PRODUCTOS);
    const newId = producto.id || 'p_' + Date.now();
    const updatedItem = { ...producto, id: newId } as Producto;
    const index = items.findIndex(i => i.id === newId);
    let newItems;
    if (index >= 0) {
      newItems = items.map(i => i.id === newId ? updatedItem : i);
    } else {
      newItems = [...items, updatedItem];
    }
    setLocalStorageData(LS_KEYS.PRODUCTOS, newItems);
    return updatedItem;
  },

  async deleteProducto(id: string): Promise<void> {
    if (supabase) {
      await supabase.from('productos').delete().eq('id', id);
    }
    const items = getLocalStorageData<Producto[]>(LS_KEYS.PRODUCTOS, SEED_PRODUCTOS);
    setLocalStorageData(LS_KEYS.PRODUCTOS, items.filter(i => i.id !== id));
  },

  async getProfesionales(): Promise<Profesional[]> {
    if (supabase) {
      const { data, error } = await supabase.from('profesionales').select('*');
      if (!error && data && data.length > 0) return data;
    }
    return getLocalStorageData<Profesional[]>(LS_KEYS.PROFESIONALES, SEED_PROFESIONALES);
  },

  async saveProfesional(prof: Partial<Profesional>): Promise<Profesional> {
    if (supabase) {
      const id = prof.id;
      const rest = { ...prof };
      delete (rest as any).id;

      if (id && !id.startsWith('temp_')) {
        const { data, error } = await supabase.from('profesionales').update(rest).eq('id', id).select().single();
        if (!error && data) return data;
      } else {
        const { data, error } = await supabase.from('profesionales').insert([rest]).select().single();
        if (!error && data) return data;
      }
    }
    const items = getLocalStorageData<Profesional[]>(LS_KEYS.PROFESIONALES, SEED_PROFESIONALES);
    const newId = prof.id || 'prof_' + Date.now();
    const updatedItem = { ...prof, id: newId } as Profesional;
    const index = items.findIndex(i => i.id === newId);
    let newItems;
    if (index >= 0) {
      newItems = items.map(i => i.id === newId ? updatedItem : i);
    } else {
      newItems = [...items, updatedItem];
    }
    setLocalStorageData(LS_KEYS.PROFESIONALES, newItems);
    return updatedItem;
  },

  async deleteProfesional(id: string): Promise<void> {
    if (supabase) {
      await supabase.from('profesionales').delete().eq('id', id);
    }
    const items = getLocalStorageData<Profesional[]>(LS_KEYS.PROFESIONALES, SEED_PROFESIONALES);
    setLocalStorageData(LS_KEYS.PROFESIONALES, items.filter(i => i.id !== id));
  },

  async getHorarios(): Promise<Horario[]> {
    if (supabase) {
      const { data, error } = await supabase.from('horarios').select('*');
      if (!error && data && data.length > 0) return data;
    }
    return getLocalStorageData<Horario[]>(LS_KEYS.HORARIOS, SEED_HORARIOS);
  },

  async saveHorario(horario: Partial<Horario>): Promise<Horario> {
    if (supabase) {
      const id = horario.id;
      const rest = { ...horario };
      delete (rest as any).id;

      if (id && !id.startsWith('temp_')) {
        const { data, error } = await supabase.from('horarios').update(rest).eq('id', id).select().single();
        if (!error && data) return data;
      } else {
        const { data, error } = await supabase.from('horarios').insert([rest]).select().single();
        if (!error && data) return data;
      }
    }
    const items = getLocalStorageData<Horario[]>(LS_KEYS.HORARIOS, SEED_HORARIOS);
    const newId = horario.id || 'h_' + Date.now();
    const updatedItem = { ...horario, id: newId } as Horario;
    const index = items.findIndex(i => i.id === newId);
    let newItems;
    if (index >= 0) {
      newItems = items.map(i => i.id === newId ? updatedItem : i);
    } else {
      newItems = [...items, updatedItem];
    }
    setLocalStorageData(LS_KEYS.HORARIOS, newItems);
    return updatedItem;
  },

  async getCitas(): Promise<Cita[]> {
    if (supabase) {
      const { data, error } = await supabase.from('citas').select('*').order('inicio', { ascending: true });
      if (!error && data) return data;
    }
    return getLocalStorageData<Cita[]>(LS_KEYS.CITAS, [
      {
        id: 'c_demo_1',
        cliente_nombre: 'María Huamán',
        cliente_telefono: '987654321',
        servicio_nombre: 'ALISADO PROMO',
        profesional_nombre: 'Zamara (Estilista Principal)',
        inicio: new Date(Date.now() + 3600000 * 4).toISOString(),
        fin: new Date(Date.now() + 3600000 * 6.5).toISOString(),
        estado: 'confirmada',
        recordatorio_24h: false,
        recordatorio_2h: false,
        resena_enviada: false,
      }
    ]);
  },

  async crearCita(cita: Omit<Cita, 'id' | 'created_at'>): Promise<Cita> {
    if (supabase) {
      const { data, error } = await supabase.from('citas').insert([cita]).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    // LS Fallback
    const items = getLocalStorageData<Cita[]>(LS_KEYS.CITAS, []);
    const newCita: Cita = {
      ...cita,
      id: 'c_' + Date.now(),
      created_at: new Date().toISOString()
    };
    setLocalStorageData(LS_KEYS.CITAS, [...items, newCita]);
    return newCita;
  },

  async actualizarEstadoCita(id: string, estado: 'confirmada' | 'completada' | 'cancelada'): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('citas').update({ estado }).eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }
    const items = getLocalStorageData<Cita[]>(LS_KEYS.CITAS, []);
    const updated = items.map(c => c.id === id ? { ...c, estado } : c);
    setLocalStorageData(LS_KEYS.CITAS, updated);
  },

  async uploadImage(file: File): Promise<string> {
    if (supabase) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage.from('zamay').upload(filePath, file);
      if (uploadError) {
        throw new Error('Error al subir imagen al bucket "zamay": ' + uploadError.message);
      }
      const { data } = supabase.storage.from('zamay').getPublicUrl(filePath);
      return data.publicUrl;
    }
    // Fallback: convert to base64 data url for preview/local mode
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};
