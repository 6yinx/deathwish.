
import React, { useState } from 'react';
import { Terminal, User, Lock, ChevronRight, AlertTriangle } from 'lucide-react';

interface LoginScreenProps {
  onAttempt: (username: string, pass: string, mode: 'login' | 'register') => { success: boolean; message?: string };
  playSelectSound: () => void;
  existingUsers: string[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onAttempt, playSelectSound, existingUsers }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
        setError('ERROR: ID REQUIRED');
        return;
    }
    if (username.length > 12) {
        setError('ERROR: ID TOO LONG (MAX 12)');
        return;
    }
    if (!password.trim()) {
        setError('ERROR: PASSWORD REQUIRED');
        return;
    }

    playSelectSound();
    const result = onAttempt(username.toUpperCase(), password, isRegistering ? 'register' : 'login');
    
    if (!result.success) {
        setError(`ERROR: ${result.message}`);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
        <div className="w-full max-w-md border-2 border-zinc-700 bg-black/90 p-8 shadow-[0_0_30px_rgba(0,255,0,0.1)]">
            <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
                <Terminal className="text-green-500 w-8 h-8" />
                <div>
                    <h1 className="font-['Black_Ops_One'] text-2xl text-zinc-100">SECURE_LOGIN</h1>
                    <p className="font-mono text-green-600 text-xs tracking-widest">DEATHWISH NETWORK</p>
                </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
                <button 
                    type="button"
                    onClick={() => { setIsRegistering(false); setError(''); }}
                    className={`flex-1 py-2 text-center font-mono text-sm border-b-2 transition-colors ${!isRegistering ? 'border-green-500 text-green-400 bg-green-900/10' : 'border-zinc-800 text-zinc-600'}`}
                >
                    LOGIN
                </button>
                <button 
                    type="button"
                    onClick={() => { setIsRegistering(true); setError(''); }}
                    className={`flex-1 py-2 text-center font-mono text-sm border-b-2 transition-colors ${isRegistering ? 'border-yellow-500 text-yellow-400 bg-yellow-900/10' : 'border-zinc-800 text-zinc-600'}`}
                >
                    REGISTER
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block font-mono text-zinc-500 text-sm mb-2">OPERATIVE ALIAS:</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError('');
                            }}
                            maxLength={12}
                            className="w-full bg-zinc-900 border-2 border-zinc-600 text-green-400 font-['Black_Ops_One'] text-xl py-3 pl-12 pr-4 focus:outline-none focus:border-green-500 uppercase placeholder-zinc-700"
                            placeholder="USERNAME"
                            autoFocus
                        />
                    </div>
                </div>

                <div>
                    <label className="block font-mono text-zinc-500 text-sm mb-2">ACCESS CODE:</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className="w-full bg-zinc-900 border-2 border-zinc-600 text-green-400 font-mono text-xl py-3 pl-12 pr-4 focus:outline-none focus:border-green-500 placeholder-zinc-700"
                            placeholder="PASSWORD"
                        />
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-500 font-mono text-xs animate-pulse bg-red-900/20 p-2 border border-red-900">
                        <AlertTriangle size={12} /> {error}
                    </div>
                )}

                <button 
                    type="submit"
                    className={`
                        w-full py-4 border transition-all font-['Black_Ops_One'] text-xl flex items-center justify-center gap-2 group
                        ${isRegistering 
                            ? 'bg-yellow-900/20 border-yellow-600 text-yellow-500 hover:bg-yellow-600 hover:text-black'
                            : 'bg-green-900/20 border-green-600 text-green-500 hover:bg-green-600 hover:text-black'}
                    `}
                >
                    {isRegistering ? 'CREATE PROFILE' : 'AUTHENTICATE'} 
                    <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </form>
            
            <div className="mt-8 text-center">
                <p className="text-zinc-600 text-[10px] font-mono">
                    WARNING: UNAUTHORIZED ACCESS IS A CLASS A FELONY PUNISHABLE BY MANDATORY REPROGRAMMING.
                </p>
            </div>
        </div>
    </div>
  );
};
