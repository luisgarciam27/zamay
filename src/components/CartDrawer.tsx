import React from 'react';
import { CartItemProducto } from '../types';
import { X, Trash2, Plus, Minus, MessageCircle, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartProducts: CartItemProducto[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  salonWhatsapp: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartProducts,
  onUpdateQuantity,
  onRemoveItem,
  salonWhatsapp,
}) => {
  if (!isOpen) return null;

  const totalCartPrice = cartProducts.reduce((sum, item) => {
    const price = item.producto.precio_promo ?? item.producto.precio;
    return sum + price * item.cantidad;
  }, 0);

  const handleCheckoutWhatsapp = () => {
    let message = '¡Hola Zamay Estética Spa! Quisiera hacer el pedido de los siguientes productos:\n\n';
    cartProducts.forEach((item, index) => {
      const price = item.producto.precio_promo ?? item.producto.precio;
      message += `${index + 1}. *${item.producto.nombre}* x ${item.cantidad} - S/ ${(price * item.cantidad).toFixed(2)}\n`;
    });
    message += `\n*Total a pagar: S/ ${totalCartPrice.toFixed(2)}*\n\nPor favor, confirmarme el método de pago y entrega en Huancayo. ¡Gracias!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/51${salonWhatsapp}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
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
          if (info.offset.y > 100 || info.velocity.y > 300) {
            onClose();
          }
        }}
        className="relative w-full sm:max-w-md bg-[#f6f4ee] rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[88vh] border-t sm:border border-[#b08d3c]/30 z-10 overflow-hidden cursor-grab active:cursor-grabbing"
      >
        {/* Luxury Header with integrated drag handle */}
        <div className="bg-[#56622f] text-white pt-3 pb-4 px-5 flex flex-col cursor-default">
          <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-3 sm:hidden" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#b08d3c] flex items-center justify-center text-white shadow-inner">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-serif text-lg font-bold tracking-wide">Carrito de Productos</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors active:scale-95 text-white/90">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body with Swipe-to-Remove Items (Right swipe) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 cursor-default">
          {cartProducts.length === 0 ? (
            <div className="text-center py-16 text-[#23291d]/60 space-y-2">
              <ShoppingBag className="w-12 h-12 mx-auto text-[#b08d3c]/40" />
              <p className="font-serif text-lg font-medium">Tu carrito está vacío</p>
              <p className="text-xs">Agrega productos desde la pestaña Productos para pedirlos por WhatsApp.</p>
            </div>
          ) : (
            <AnimatePresence>
              {cartProducts.map(item => {
                const unitPrice = item.producto.precio_promo ?? item.producto.precio;
                return (
                  <div key={item.producto.id} className="relative rounded-2xl overflow-hidden bg-red-600 shadow-sm">
                    {/* Background indicator when swiping right */}
                    <div className="absolute inset-y-0 left-0 w-full bg-red-600 flex items-center pl-6 text-white font-bold text-xs gap-2">
                      <Trash2 className="w-5 h-5 animate-bounce" /> Desliza para eliminar
                    </div>

                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 120, height: 0 }}
                      transition={{ duration: 0.2 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 120 }}
                      dragElastic={{ right: 0.5 }}
                      onDragEnd={(e, info) => {
                        if (info.offset.x > 70) {
                          onRemoveItem(item.producto.id);
                        }
                      }}
                      className="bg-white p-3.5 rounded-2xl border border-[#b08d3c]/20 shadow-sm flex gap-3.5 items-center relative z-10 touch-pan-y"
                    >
                      <img
                        src={item.producto.imagen_url || 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=200&q=80'}
                        alt={item.producto.nombre}
                        className="w-16 h-16 object-cover rounded-xl bg-gray-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-sm font-bold text-[#23291d] truncate">{item.producto.nombre}</h4>
                        <p className="text-xs font-semibold text-[#56622f] mt-0.5">S/ {unitPrice.toFixed(2)} c/u</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-[#b08d3c]/30 rounded-xl overflow-hidden bg-[#f6f4ee]">
                            <button
                              onClick={() => onUpdateQuantity(item.producto.id, -1)}
                              className="p-1.5 hover:bg-[#ebe7de] text-[#23291d] active:scale-95"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-bold">{item.cantidad}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.producto.id, 1)}
                              className="p-1.5 hover:bg-[#ebe7de] text-[#23291d] active:scale-95"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.producto.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors ml-auto active:scale-95"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {cartProducts.length > 0 && (
          <div className="p-4 bg-white border-t border-[#b08d3c]/30 space-y-3 pb-6 sm:pb-4 cursor-default">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#23291d]/70 font-medium">Total a pagar:</span>
              <span className="font-serif text-xl font-bold text-[#56622f]">S/ {totalCartPrice.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckoutWhatsapp}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <MessageCircle className="w-5 h-5" /> Pedir por WhatsApp
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
