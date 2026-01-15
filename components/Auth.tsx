import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { APP_NAME } from '../utils/constants';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // This ensures the link in the email points to the current domain (localhost or vercel app)
            emailRedirectTo: `${window.location.origin}/`, 
            data: {
              username: email.split('@')[0], // Default username
            },
          },
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Verifique o seu email para confirmar o registo!' });
      }
    } catch (error: any) {
      let errorMsg = error.message;
      
      // Help diagnose configuration issues
      if (errorMsg === 'Failed to fetch') {
        errorMsg = 'Erro de conexão. Verifique a internet ou as variáveis de ambiente (VITE_SUPABASE_URL) no Vercel.';
        console.error('Supabase Connection Error:', error);
      }
      
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-dark">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/20 p-4 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M6.5 6.5l11 11M21 21l-1-1M3 3l1 1m0 0l3 3M7 7l3 3M17 17l3 3M5 5l2 2m4 4l2 2m-2-2l-4-4" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">{APP_NAME}</h2>
          <p className="mt-2 text-sm text-slate-400">
            {isLogin ? 'Bem-vindo de volta, atleta.' : 'Começa a tua jornada hoje.'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full rounded-lg border-0 bg-surface py-3 px-4 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full rounded-lg border-0 bg-surface py-3 px-4 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${message.type === 'error' ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-lg bg-primary py-3 px-4 text-sm font-semibold text-white hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              isLogin ? 'Entrar' : 'Criar Conta'
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-400">
            {isLogin ? 'Não tens conta?' : 'Já tens conta?'}
            <button
              onClick={() => { setIsLogin(!isLogin); setMessage(null); }}
              className="ml-2 font-medium text-primary hover:text-blue-400"
            >
              {isLogin ? 'Regista-te' : 'Faz Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};