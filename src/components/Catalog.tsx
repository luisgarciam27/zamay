import React, { useState } from 'react';
import { Servicio, Producto, CartItemProducto } from '../types';
import { Plus, Check, Search, ShoppingBag, Clock, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface CatalogProps {
  activeTab: 'servicios' | 'productos';
  setActiveTab: (tab: 'servicios' | 'productos') => void;
  servicios: Servicio[];
  productos: Producto[];
  selectedServices: Servicio[];
  onToggleService: (servicio: Servicio) => void;
  onAddToCartProducto: (producto: Producto) => void;
  onOpenBooking: () => void;
  onOpenCart: () => void;
  salonWhatsapp: string;
}

export const Catalog: React.FC<CatalogProps> = ({
  activeTab,
  setActiveTab,
  servicios,
  productos,
  selectedServices,
  onToggleService,
  onAddToCartProducto,
  onOpenBooking,
  onOpenCart,
  salonWhatsapp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Categories for services
  const serviceCategories = ['Todos', ...Array.from(new Set(servicios.map(s => s.categoria)))];
  // Categories for products
  const productCategories = ['Todos', ...Array.from(new Set(productos.map(p => p.categoria)))];

  const currentCategories = activeTab === 'servicios' ? serviceCategories : productCategories;

  // Filtered items
  const filteredServicios = servicios.filter(s => {
    const matchesSearch = s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'Todos' || s.categoria === selectedCategory;
    return s.activo && matchesSearch && matchesCat;
  });

  const filteredProductos = productos.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'Todos' || p.categoria === selectedCategory;
    return p.activo && matchesSearch && matchesCat;
  });

  // Calculate totals for selected services
  const totalDuration = selectedServices.reduce((acc, s) => acc + s.duracion_min, 0);
  const totalPrice = selectedServices.reduce((acc, s) => acc + (s.precio_promo ?? s.precio), 0);

  const isServiceSelected = (id: string) => selectedServices.some(s => s.id === id);

  return (
    <div className="pb-28">
      {/* Hero Banner */}
      <div className="relative bg-[#56622f] text-[#f6f4ee] py-10 px-4 text-center overflow-hidden border-b-4 border-[#b08d3c]">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#b08d3c_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b08d3c]/30 text-[#f6f4ee] text-xs font-semibold tracking-wider uppercase border border-[#b08d3c]">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" /> Estética & Spa en Huancayo
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
            Realza tu belleza natural
          </h2>
          <p className="text-sm sm:text-base text-[#f6f4ee]/80 font-light max-w-lg mx-auto">
            Disfruta de nuestros tratamientos exclusivos para cabello, uñas, rostro y mucho más con la mejor atención profesional.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        {/* Search and Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-6">
          {/* Tabs */}
          <div className="flex bg-[#ebe7de] p-1 rounded-xl w-full sm:w-auto border border-[#b08d3c]/30">
            <button
              onClick={() => { setActiveTab('servicios'); setSelectedCategory('Todos'); setSearchTerm(''); }}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'servicios'
                  ? 'bg-[#56622f] text-[#f6f4ee] shadow'
                  : 'text-[#23291d] hover:text-[#56622f]'
              }`}
            >
              Servicios ({servicios.filter(s => s.activo).length})
            </button>
            <button
              onClick={() => { setActiveTab('productos'); setSelectedCategory('Todos'); setSearchTerm(''); }}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'productos'
                  ? 'bg-[#56622f] text-[#f6f4ee] shadow'
                  : 'text-[#23291d] hover:text-[#56622f]'
              }`}
            >
              Productos ({productos.filter(p => p.activo).length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b08d3c]" />
            <input
              type="text"
              placeholder={activeTab === 'servicios' ? 'Buscar servicio...' : 'Buscar producto...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white pl-9 pr-4 py-2 rounded-xl text-sm border border-[#b08d3c]/30 focus:outline-none focus:ring-2 focus:ring-[#56622f]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {currentCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-[#b08d3c] text-white shadow-sm'
                  : 'bg-[#ebe7de] text-[#23291d] hover:bg-[#b08d3c]/20 border border-[#b08d3c]/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog Grid with smooth fade-in */}
        {activeTab === 'servicios' ? (
          <motion.div
            key={`servicios-${selectedCategory}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filteredServicios.length === 0 ? (
              <div className="text-center py-16 text-[#23291d]/60">
                <p className="font-serif text-xl">No se encontraron servicios</p>
                <p className="text-sm mt-1">Intenta con otra categoría o término de búsqueda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServicios.map((servicio, idx) => {
                  const selected = isServiceSelected(servicio.id);
                  return (
                    <motion.div
                      key={servicio.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                      className={`bg-white rounded-2xl overflow-hidden border transition-all shadow-sm hover:shadow-md flex flex-col ${
                        selected ? 'border-[#56622f] ring-2 ring-[#56622f]/20 bg-[#f6f4ee]/50' : 'border-[#b08d3c]/20'
                      }`}
                    >
                      <div className="relative h-48 bg-[#ebe7de]">
                        <img
                          src={servicio.imagen_url || 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80'}
                          alt={servicio.nombre}
                          className="w-full h-full object-cover"
                        />
                        {servicio.precio_promo && (
                          <span className="absolute top-3 left-3 bg-[#b08d3c] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                            <Tag className="w-3 h-3" /> OFERTA
                          </span>
                        )}
                        <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#d4af37]" /> {servicio.duracion_min} min
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] font-semibold text-[#b08d3c] uppercase tracking-wider">
                            {servicio.categoria}
                          </span>
                          <h3 className="font-serif text-lg font-bold text-[#23291d] mt-1 line-clamp-1">
                            {servicio.nombre}
                          </h3>
                          <p className="text-xs text-[#23291d]/70 mt-1 line-clamp-2">
                            {servicio.descripcion}
                          </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-[#ebe7de] flex items-center justify-between">
                          <div>
                            {servicio.precio_promo ? (
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-[#56622f]">
                                  S/ {servicio.precio_promo.toFixed(2)}
                                </span>
                                <span className="text-xs text-gray-400 line-through">
                                  S/ {servicio.precio.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-[#56622f]">
                                S/ {servicio.precio.toFixed(2)}
                              </span>
                            )}
                          </div>

                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            whileHover={{ scale: 1.03 }}
                            onClick={() => onToggleService(servicio)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm ${
                              selected
                                ? 'bg-[#56622f] text-white'
                                : 'bg-[#ebe7de] text-[#23291d] hover:bg-[#56622f] hover:text-white'
                            }`}
                          >
                            {selected ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> En mi cita
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" /> Agregar
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`productos-${selectedCategory}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filteredProductos.length === 0 ? (
              <div className="text-center py-16 text-[#23291d]/60">
                <p className="font-serif text-xl">No se encontraron productos</p>
                <p className="text-sm mt-1">Intenta con otra categoría o término de búsqueda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProductos.map((producto, idx) => (
                  <motion.div
                    key={producto.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className="bg-white rounded-2xl overflow-hidden border border-[#b08d3c]/20 shadow-sm hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 bg-[#ebe7de]">
                        <img
                          src={producto.imagen_url || 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80'}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                        />
                        {producto.precio_promo && (
                          <span className="absolute top-3 left-3 bg-[#b08d3c] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                            OFERTA
                          </span>
                        )}
                        <span className="absolute bottom-3 right-3 bg-white/90 text-[#23291d] text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
                          Stock: {producto.stock}
                        </span>
                      </div>
                      <div className="p-4">
                        <span className="text-[11px] font-semibold text-[#b08d3c] uppercase tracking-wider">
                          {producto.categoria}
                        </span>
                        <h3 className="font-serif text-base font-bold text-[#23291d] mt-1 line-clamp-1">
                          {producto.nombre}
                        </h3>
                        <p className="text-xs text-[#23291d]/70 mt-1 line-clamp-2">
                          {producto.descripcion}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <div className="flex items-baseline justify-between mb-3">
                        {producto.precio_promo ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-bold text-[#56622f]">
                              S/ {producto.precio_promo.toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              S/ {producto.precio.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-base font-bold text-[#56622f]">
                            S/ {producto.precio.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.93 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onAddToCartProducto(producto)}
                        className="w-full py-2.5 bg-[#56622f] hover:bg-[#3f4922] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Agregar al carrito
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Floating Bottom Bar for Selected Services */}
      {selectedServices.length > 0 && activeTab === 'servicios' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#23291d] text-[#f6f4ee] py-3.5 px-4 shadow-2xl border-t-2 border-[#b08d3c]">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#b08d3c] text-white flex items-center justify-center font-bold text-sm shadow">
                {selectedServices.length}
              </div>
              <div>
                <p className="text-xs text-[#f6f4ee]/70">Servicios seleccionados</p>
                <div className="flex items-center gap-3 font-semibold text-sm">
                  <span>S/ {totalPrice.toFixed(2)}</span>
                  <span className="text-[#b08d3c]">•</span>
                  <span className="flex items-center gap-1 text-xs text-[#f6f4ee]/90">
                    <Clock className="w-3.5 h-3.5 text-[#d4af37]" /> {totalDuration} min aprox.
                  </span>
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              onClick={onOpenBooking}
              className="w-full sm:w-auto px-6 py-3 bg-[#b08d3c] hover:bg-[#9a7830] text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2"
            >
              Reservar Cita <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};
