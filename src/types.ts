export interface Servicio {
  id: string;
  categoria: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_promo?: number | null;
  duracion_min: number;
  imagen_url?: string;
  activo: boolean;
  orden: number;
}

export interface Producto {
  id: string;
  categoria: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_promo?: number | null;
  imagen_url?: string;
  stock: number;
  activo: boolean;
}

export interface Profesional {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface Horario {
  id: string;
  dia_semana: number; // 0 (Domingo) a 6 (Sábado)
  hora_inicio: string; // "09:00"
  hora_fin: string; // "19:00"
}

export interface Cita {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  servicio_nombre: string;
  profesional_nombre: string;
  inicio: string; // ISO timestamptz
  fin: string; // ISO timestamptz
  estado: 'confirmada' | 'completada' | 'cancelada';
  recordatorio_24h?: boolean;
  recordatorio_2h?: boolean;
  resena_enviada?: boolean;
  created_at?: string;
}

export interface CartItemProducto {
  producto: Producto;
  cantidad: number;
}
