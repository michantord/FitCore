/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Zap, Mail, Lock } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-night flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate border border-steel mb-4">
          <Zap className="text-volt w-6 h-6" />
        </div>
        <h1 className="text-center text-4xl font-display font-extrabold text-white tracking-tight">
          Fit<span className="text-volt">Core</span>
        </h1>
        <p className="mt-2 text-center text-[15px] text-muted">
          Entrena sin límites.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div id="login-card" className="bg-slate py-8 px-6 shadow-xl rounded-2xl border border-steel sm:px-10">
          <div className="mb-8">
            <h2 className="text-2xl font-display font-semibold text-white tracking-tight">
              Iniciar Sesión
            </h2>
            <p className="text-sm text-muted mt-1">
              Ingresa a tu cuenta para continuar
            </p>
          </div>

          <form id="login-form" className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label 
                htmlFor="email" 
                className="block text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-muted mb-2"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 bg-night border border-steel rounded-lg text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-volt focus:border-volt sm:text-sm transition-colors"
                  placeholder="usuario@fitcore.com"
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-muted mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 bg-night border border-steel rounded-lg text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-volt focus:border-volt sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-night border-steel rounded text-volt focus:ring-volt focus:ring-offset-night"
                />
                <label htmlFor="remember-me" className="ml-2 block text-[13px] text-muted">
                  Recordarme
                </label>
              </div>

              <div className="text-[13px]">
                <a href="#" className="font-medium text-volt hover:text-white transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="submit-login"
                type="submit"
                className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-[13px] font-medium text-night bg-volt hover:bg-[#b0df3c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-volt focus:ring-offset-night transition-colors"
              >
                Ingresar a FitCore
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-steel" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate text-[11px] font-mono tracking-widest uppercase text-muted">
                  O continuar con
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-between gap-3">
              <button className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-transparent border border-steel text-sm font-medium text-white hover:bg-steel/30 transition-colors">
                Admin
              </button>
              <button className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-transparent border border-steel text-sm font-medium text-white hover:bg-steel/30 transition-colors">
                Usuario
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
