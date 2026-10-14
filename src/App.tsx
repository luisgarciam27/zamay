import React, { useState, useEffect } from 'react';
import { Servicio, Producto, Profesional, Horario, Cita, CartItemProducto } from './types';
import { ZamayAPI, supabase, isSupabaseConfigured } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { Catalog } from './components/Catalog';
import { CartDrawer } from './components/CartDrawer';
import { BookingModal } from './components/BookingModal';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Sparkles, Database, MessageCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'servicios' | 'productos' | 'admin'>('servicios');
  const [catalogSubTab, setCatalogSubTab] = useState<'servicios' | 'productos'>('servicios');

  // Data states
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);

  // User selection states
  const [selectedServices, setSelectedServices] = useState<Servicio[]>([]);
  const [cartProducts, setCartProducts] = useState<CartItemProducto[]>([]);

  // Modals
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Admin session state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('zamay_admin_logged') === 'true';
  });

  // Configurable salon WhatsApp number (Huancayo, Perú)
  const SALON_WHATSAPP = '987654321';

  // Fetch initial data
  useEffect(() => {
    const loadAppData = async () => {
      try {
        const [s, p, pr, h, c] = await Promise.all([
          ZamayAPI.getServicios(),
          ZamayAPI.getProductos(),
          ZamayAPI.getProfesionales(),
          ZamayAPI.getHorarios(),
          ZamayAPI.getCitas(),
        ]);
        setServicios(s);
        setProductos(p);
        setProfesionales(pr);
        setHorarios(h);
        setCitas(c);
      } catch (err) {
        console.error('Error loading initial app data', err);
      }
    };
    loadAppData();
  }, []);

  // Handle service toggle for booking
  const handleToggleService = (servicio: Servicio) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === servicio.id);
      if (exists) {
        return prev.filter(s => s.id !== servicio.id);
      } else {
        return [...prev, servicio];
      }
    });
  };

  // Handle add product to cart
  const handleAddToCartProducto = (producto: Producto) => {
    setCartProducts(prev => {
      const existing = prev.find(item => item.producto.id === producto.id);
      if (existing) {
        return prev.map(item => 
          item.producto.id === producto.id 
            ? { ...item, cantidad: item.cantidad + 1 } 
            : item
        );
      } else {
        return [...prev, { producto, cantidad: 1 }];
      }
    });
    setIsCartOpen(true);
  };

  // Update product quantity in cart
  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartProducts(prev => {
      return prev.map(item => {
        if (item.producto.id === productId) {
          const newQty = item.cantidad + delta;
          return newQty > 0 ? { ...item, cantidad: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItemProducto[];
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartProducts(prev => prev.filter(item => item.producto.id !== productId));
  };

  const handleBookingSuccess = () => {
    setSelectedServices([]);
    // Reload citas
    ZamayAPI.getCitas().then(setCitas);
  };

  return (
    <div className="min-h-screen bg-[#f6f4ee] flex flex-col font-sans text-[#23291d]">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedServices={selectedServices}
        cartProducts={cartProducts}
        onOpenBooking={() => setIsBookingOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        salonWhatsapp={SALON_WHATSAPP}
      />

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'servicios' || activeTab === 'productos' ? (
          <Catalog
            activeTab={activeTab === 'servicios' ? catalogSubTab : 'productos'}
            setActiveTab={(tab) => {
              setActiveTab('servicios');
              setCatalogSubTab(tab);
            }}
            servicios={servicios}
            productos={productos}
            selectedServices={selectedServices}
            onToggleService={handleToggleService}
            onAddToCartProducto={handleAddToCartProducto}
            onOpenBooking={() => setIsBookingOpen(true)}
            onOpenCart={() => setIsCartOpen(true)}
            salonWhatsapp={SALON_WHATSAPP}
          />
        ) : (
          <div>
            {isAdminLoggedIn ? (
              <AdminDashboard
                onLogout={() => {
                  localStorage.removeItem('zamay_admin_logged');
                  setIsAdminLoggedIn(false);
                  setActiveTab('servicios');
                }}
              />
            ) : (
              <AdminLogin
                onLoginSuccess={() => setIsAdminLoggedIn(true)}
                onBackToHome={() => setActiveTab('servicios')}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#23291d] text-[#f6f4ee] py-8 px-4 text-center border-t-2 border-[#b08d3c]">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#56622f] text-[#f6f4ee] flex items-center justify-center font-serif font-bold border border-[#b08d3c]">
              Z
            </span>
            <h3 className="font-serif text-xl font-bold tracking-wide">Zamay Estética Spa</h3>
          </div>
          <p className="text-xs text-[#f6f4ee]/70">
            Huancayo, Perú • Belleza, Cuidado y Bienestar
          </p>
          <p className="text-[11px] text-[#b08d3c]">
            © {new Date().getFullYear()} Zamay Estética Spa. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartProducts={cartProducts}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        salonWhatsapp={SALON_WHATSAPP}
      />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedServices={selectedServices}
        onBookingSuccess={handleBookingSuccess}
        profesionales={profesionales}
        horarios={horarios}
        citasExistentes={citas}
      />
    </div>
  );
}
