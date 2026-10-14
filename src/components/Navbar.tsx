import React from 'react';
import { Scissors, ShoppingBag, Calendar, ShieldCheck, MessageCircle, Home } from 'lucide-react';
import { Servicio, CartItemProducto } from '../types';

interface NavbarProps {
  activeTab: 'servicios' | 'productos' | 'admin';
  setActiveTab: (tab: 'servicios' | 'productos' | 'admin') => void;
  selectedServices: Servicio[];
  cartProducts: CartItemProducto[];
  onOpenBooking: () => void;
  onOpenCart: () => void;
  salonWhatsapp: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedServices,
  cartProducts,
  onOpenBooking,
  onOpenCart,
  salonWhatsapp,
}) => {
  const totalProductsCount = cartProducts.reduce((sum, item) => sum + item.cantidad, 0);

  const handleWhatsappGeneral = () => {
    const text = encodeURIComponent('¡Hola Zamay Estética Spa! Quisiera más información sobre sus servicios y productos.');
    window.open(`https://wa.me/51${salonWhatsapp}?text=${text}`, '_blank');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#f6f4ee]/95 backdrop-blur-md border-b border-[#b08d3c]/20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo / Brand */}
          <div 
            onClick={() => setActiveTab('servicios')}
            className="cursor-pointer flex items-center gap-2 group active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-[#56622f] text-[#f6f4ee] flex items-center justify-center shadow-md font-serif text-xl font-bold border border-[#b08d3c]">
              Z
            </div>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-[#23291d] group-hover:text-[#56622f] transition-colors">
                Zamay Estética Spa
              </h1>
              <p className="text-xs text-[#b08d3c] font-medium tracking-wider uppercase">Huancayo, Perú</p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#ebe7de] p-1 rounded-full border border-[#b08d3c]/20">
            <button
              onClick={() => setActiveTab('servicios')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === 'servicios'
                  ? 'bg-[#56622f] text-[#f6f4ee] shadow-sm'
                  : 'text-[#23291d] hover:text-[#56622f]'
              }`}
            >
              Servicios
            </button>
            <button
              onClick={() => setActiveTab('productos')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === 'productos'
                  ? 'bg-[#56622f] text-[#f6f4ee] shadow-sm'
                  : 'text-[#23291d] hover:text-[#56622f]'
              }`}
            >
              Productos
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* WhatsApp Contact */}
            <button
              onClick={handleWhatsappGeneral}
              title="Escribir por WhatsApp"
              className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Cart / Products badge */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-full bg-[#ebe7de] hover:bg-[#d4af37]/20 text-[#23291d] border border-[#b08d3c]/30 transition-colors active:scale-95"
              title="Carrito de productos"
            >
              <ShoppingBag className="w-5 h-5 text-[#56622f]" />
              {totalProductsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#b08d3c] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {totalProductsCount}
                </span>
              )}
            </button>

            {/* Admin Panel button */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors active:scale-95 ${
                activeTab === 'admin'
                  ? 'bg-[#b08d3c] text-white shadow-sm'
                  : 'bg-[#ebe7de] text-[#23291d] hover:bg-[#d4af37]/20 border border-[#b08d3c]/30'
              }`}
              title="Panel Admin"
            >
              <ShieldCheck className="w-4 h-4 text-[#56622f]" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Native Super App Mobile Bottom Dock */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#f6f4ee]/95 backdrop-blur-lg border-t border-[#b08d3c]/30 px-3 py-2 shadow-2xl flex items-center justify-around">
        <button
          onClick={() => setActiveTab('servicios')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all active:scale-95 ${
            activeTab === 'servicios' ? 'text-[#56622f] font-bold bg-[#ebe7de]' : 'text-[#23291d]/70'
          }`}
        >
          <Scissors className="w-5 h-5" />
          <span className="text-[10px]">Servicios</span>
        </button>

        <button
          onClick={() => setActiveTab('productos')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all active:scale-95 relative ${
            activeTab === 'productos' ? 'text-[#56622f] font-bold bg-[#ebe7de]' : 'text-[#23291d]/70'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px]">Productos</span>
          {totalProductsCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-[#b08d3c]" />
          )}
        </button>

        {selectedServices.length > 0 && (
          <button
            onClick={onOpenBooking}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl bg-[#56622f] text-white shadow-md active:scale-95 animate-pulse"
          >
            <Calendar className="w-5 h-5 text-[#d4af37]" />
            <span className="text-[10px] font-bold">Mi Cita ({selectedServices.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all active:scale-95 ${
            activeTab === 'admin' ? 'text-[#b08d3c] font-bold bg-[#ebe7de]' : 'text-[#23291d]/70'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px]">Admin</span>
        </button>
      </div>
    </>
  );
};
