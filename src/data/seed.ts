import { Servicio, Producto, Profesional, Horario } from '../types';

export const SEED_SERVICIOS: Servicio[] = [
  {
    id: 's1',
    categoria: 'Cabello',
    nombre: 'ALISADO PROMO',
    descripcion: 'Alisado profesional brasileño con hidratación profunda incluida. Brillo espejo y cero frizz por meses.',
    precio: 300.00,
    precio_promo: 119.00,
    duracion_min: 150,
    imagen_url: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80',
    activo: true,
    orden: 1,
  },
  {
    id: 's2',
    categoria: 'Cabello',
    nombre: 'BAÑO DE COLOR',
    descripcion: 'Matizado y revitalización del color sin amoniaco con brillo supremo.',
    precio: 200.00,
    precio_promo: 150.00,
    duracion_min: 60,
    imagen_url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80',
    activo: true,
    orden: 2,
  },
  {
    id: 's3',
    categoria: 'Cabello',
    nombre: 'BALAYAGE',
    descripcion: 'Técnica de iluminación personalizada con corte profesional y tratamiento matizador.',
    precio: 350.00,
    precio_promo: null,
    duracion_min: 180,
    imagen_url: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=600&q=80',
    activo: true,
    orden: 3,
  },
  {
    id: 's4',
    categoria: 'Cabello',
    nombre: 'TRATAMIENTO CÉLULAS MADRE',
    descripcion: 'Hidratación intensiva por un mes, brillo duradero y reparación capilar profunda.',
    precio: 200.00,
    precio_promo: 150.00,
    duracion_min: 60,
    imagen_url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80',
    activo: true,
    orden: 4,
  },
  {
    id: 's5',
    categoria: 'Uñas',
    nombre: 'PEDICURA SPA &GEL',
    descripcion: 'Exfoliación, hidratación profunda, cuidado de cutículas y esmaltado en gel.',
    precio: 85.00,
    precio_promo: 69.00,
    duracion_min: 60,
    imagen_url: 'https://images.unsplash.com/photo-1632345031435-877ff6c2ae3d?auto=format&fit=crop&w=600&q=80',
    activo: true,
    orden: 5,
  },
  {
    id: 's6',
    categoria: 'Rostro y Cejas',
    nombre: 'MICROPIGMENTACIÓN DE CEJAS',
    descripcion: 'Técnica pelo a pelo (Microblading o Powder Brows) para unas cejas perfectas y naturales.',
    precio: 450.00,
    precio_promo: 350.00,
    duracion_min: 120,
    imagen_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
    activo: true,
    orden: 6,
  },
  {
    id: 's7',
    categoria: 'Maquillaje',
    nombre: 'MAQUILLAJE Y PEINADO SOCIAL',
    descripcion: 'Look completo para eventos, fiestas y ocasiones especiales con pestañas incluidas.',
    precio: 180.00,
    precio_promo: 149.90,
    duracion_min: 90,
    imagen_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
    activo: true,
    orden: 7,
  }
];

export const SEED_PRODUCTOS: Producto[] = [
  {
    id: 'p1',
    categoria: 'Capilar',
    nombre: 'Shampoo Post Alisado Sin Sal (500ml)',
    descripcion: 'Prolonga la duración de tu alisado y nutre las fibras capilares.',
    precio: 75.00,
    precio_promo: 60.00,
    imagen_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80',
    stock: 15,
    activo: true,
  },
  {
    id: 'p2',
    categoria: 'Capilar',
    nombre: 'Mascarilla Reparación Profunda Argán',
    descripcion: 'Nutrición intensiva para cabellos secos o procesados químicamente.',
    precio: 90.00,
    precio_promo: 79.00,
    imagen_url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80',
    stock: 10,
    activo: true,
  },
  {
    id: 'p3',
    categoria: 'Skincare',
    nombre: 'Sérum Facial Ácido Hialurónico',
    descripcion: 'Hidratación profunda y efecto tensor antiedad.',
    precio: 120.00,
    precio_promo: 99.00,
    imagen_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    stock: 8,
    activo: true,
  },
  {
    id: 'p4',
    categoria: 'Uñas',
    nombre: 'Kit Cuidado de Manos Hidratante',
    descripcion: 'Crema nutritiva y aceite de cutículas con aroma a vainilla.',
    precio: 55.00,
    precio_promo: 45.00,
    imagen_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
    stock: 20,
    activo: true,
  }
];

export const SEED_PROFESIONALES: Profesional[] = [
  { id: 'prof1', nombre: 'Zamara (Estilista Principal)', activo: true },
  { id: 'prof2', nombre: 'Lucía (Especialista en Uñas y Color)', activo: true },
  { id: 'prof3', nombre: 'Karla (Cosmetóloga y Cejas)', activo: true },
];

export const SEED_HORARIOS: Horario[] = [
  { id: 'h1', dia_semana: 1, hora_inicio: '09:00', hora_fin: '19:00' }, // Lunes
  { id: 'h2', dia_semana: 2, hora_inicio: '09:00', hora_fin: '19:00' }, // Martes
  { id: 'h3', dia_semana: 3, hora_inicio: '09:00', hora_fin: '19:00' }, // Miércoles
  { id: 'h4', dia_semana: 4, hora_inicio: '09:00', hora_fin: '19:00' }, // Jueves
  { id: 'h5', dia_semana: 5, hora_inicio: '09:00', hora_fin: '20:00' }, // Viernes
  { id: 'h6', dia_semana: 6, hora_inicio: '09:00', hora_fin: '20:00' }, // Sábado
  { id: 'h7', dia_semana: 0, hora_inicio: '10:00', hora_fin: '16:00' }, // Domingo
];
