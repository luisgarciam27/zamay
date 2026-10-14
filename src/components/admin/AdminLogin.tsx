import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Lock, Mail, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      // If Supabase is not configured, allow demo admin login
      if (email === 'admin@zamay.com' && password === 'zamay2026') {
        localStorage.setItem('zamay_admin_logged', 'true');
        onLoginSuccess();
      } else {
        setErrorMsg('Modo Demo: Usa admin@zamay.com y clave zamay2026');
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.session) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión con Supabase Auth');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = () => {
    localStorage.setItem('zamay_admin_logged', 'true');
    onLoginSuccess();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-[#b08d3c]/30 overflow-hidden p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#56622f] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8 text-[#d4af37]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#23291d]">Panel de Administración</h2>
          <p className="text-xs text-[#23291d]/70">Zamay Estética Spa • Acceso Restringido</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Supabase no configurado (Modo Demo Activo)</p>
              <p className="mt-0.5">Puedes ingresar con:</p>
              <p className="font-mono mt-1">Email: admin@zamay.com</p>
              <p className="font-mono">Clave: zamay2026</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#23291d] mb-1">Correo electrónico:</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b08d3c]" />
              <input
                type="email"
                required
                placeholder="admin@zamay.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f6f4ee] pl-9 pr-4 py-2.5 rounded-xl border border-[#b08d3c]/30 text-sm text-[#23291d] focus:outline-none focus:ring-2 focus:ring-[#56622f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#23291d] mb-1">Contraseña:</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b08d3c]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f6f4ee] pl-9 pr-4 py-2.5 rounded-xl border border-[#b08d3c]/30 text-sm text-[#23291d] focus:outline-none focus:ring-2 focus:ring-[#56622f]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#56622f] hover:bg-[#3f4922] text-white rounded-xl font-bold text-sm shadow transition-colors"
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {!isSupabaseConfigured && (
          <button
            onClick={handleDemoBypass}
            className="w-full py-2.5 bg-[#b08d3c]/20 hover:bg-[#b08d3c]/30 text-[#23291d] rounded-xl font-semibold text-xs transition-colors"
          >
            Acceso Rápido Modo Demo
          </button>
        )}

        <button
          onClick={onBackToHome}
          className="w-full py-2 text-[#23291d]/60 hover:text-[#23291d] text-xs font-medium flex items-center justify-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al Catálogo
        </button>

      </div>
    </div>
  );
};
