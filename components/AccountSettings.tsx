
import React, { useState } from 'react';
import { UserData } from '../types';
import { User, Lock, Save, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';

interface AccountSettingsProps {
    onBack: () => void;
    currentUser: UserData;
    allUsers: UserData[];
    onUpdateUser: (user: UserData, oldUsername?: string) => void;
    playSelectSound: () => void;
    playPurchaseSound: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({
    onBack, currentUser, allUsers, onUpdateUser, playSelectSound, playPurchaseSound
}) => {
    const [username, setUsername] = useState(currentUser.username);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        playSelectSound();

        let hasChanges = false;
        let updatedUser = { ...currentUser };
        const previousUsername = currentUser.username;

        // Username Change Logic
        if (username !== currentUser.username) {
            const trimmed = username.trim().toUpperCase();
            if (trimmed.length === 0 || trimmed.length > 12) {
                 setMessage({type: 'error', text: 'INVALID USERNAME LENGTH'});
                 return;
            }
            const taken = allUsers.some(u => u.username === trimmed && u.username !== currentUser.username);
            if (taken) {
                setMessage({type: 'error', text: 'USERNAME ALREADY TAKEN'});
                return;
            }
            updatedUser.username = trimmed;
            hasChanges = true;
        }

        // Password Change Logic
        if (newPassword) {
            if (oldPassword !== currentUser.password) {
                setMessage({type: 'error', text: 'INCORRECT OLD PASSWORD'});
                return;
            }
            if (newPassword.length < 4) {
                setMessage({type: 'error', text: 'PASSWORD TOO SHORT'});
                return;
            }
            updatedUser.password = newPassword;
            hasChanges = true;
        }

        if (hasChanges) {
            onUpdateUser(updatedUser, previousUsername);
            playPurchaseSound();
            setMessage({type: 'success', text: 'PROFILE UPDATED SUCCESSFULLY'});
            setOldPassword('');
            setNewPassword('');
        } else {
             setMessage({type: 'error', text: 'NO CHANGES DETECTED'});
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-4 md:p-12 bg-black/90 z-50 absolute inset-0 backdrop-blur-sm">
            <div className="w-full max-w-2xl border-2 border-zinc-600 bg-zinc-900 flex flex-col relative shadow-[0_0_50px_rgba(0,255,0,0.1)]">
                
                {/* Header */}
                <div className="p-6 border-b border-zinc-700 bg-black flex items-center gap-4">
                    <User className="text-green-500 w-8 h-8" />
                    <div>
                        <h1 className="font-['Black_Ops_One'] text-2xl text-zinc-100">ACCOUNT SETTINGS</h1>
                        <p className="font-mono text-green-600 text-xs tracking-widest">OPERATIVE PROFILE MANAGER</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="p-8 space-y-8 bg-zinc-900/50 flex-1 overflow-y-auto">
                    
                    {/* Username Section */}
                    <div className="space-y-4 border-b border-zinc-800 pb-8">
                        <h3 className="text-zinc-400 font-mono text-sm border-l-2 border-green-500 pl-2">IDENTIFICATION</h3>
                        <div>
                            <label className="block font-mono text-zinc-500 text-xs mb-2">OPERATIVE ALIAS</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toUpperCase())}
                                    maxLength={12}
                                    className="w-full bg-black border-2 border-zinc-700 text-green-400 font-['Black_Ops_One'] text-xl py-3 pl-12 pr-4 focus:outline-none focus:border-green-500 uppercase"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password Section */}
                    <div className="space-y-4">
                        <h3 className="text-zinc-400 font-mono text-sm border-l-2 border-red-500 pl-2">SECURITY CLEARANCE</h3>
                        <div className="grid gap-4">
                            <div>
                                <label className="block font-mono text-zinc-500 text-xs mb-2">CURRENT PASSWORD (REQUIRED TO CHANGE)</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                                    <input 
                                        type="password" 
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full bg-black border-2 border-zinc-700 text-zinc-300 font-mono text-lg py-3 pl-12 pr-4 focus:outline-none focus:border-red-500 placeholder-zinc-800"
                                        placeholder="ENTER OLD PASSWORD"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-mono text-zinc-500 text-xs mb-2">NEW PASSWORD</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                                    <input 
                                        type="password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-black border-2 border-zinc-700 text-green-400 font-mono text-lg py-3 pl-12 pr-4 focus:outline-none focus:border-green-500 placeholder-zinc-800"
                                        placeholder="ENTER NEW PASSWORD"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Message */}
                    {message && (
                        <div className={`p-4 border flex items-center gap-3 ${message.type === 'success' ? 'bg-green-900/20 border-green-600 text-green-400' : 'bg-red-900/20 border-red-600 text-red-400'}`}>
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                            <span className="font-mono text-sm font-bold">{message.text}</span>
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full py-4 bg-zinc-800 border-2 border-zinc-600 text-zinc-300 hover:bg-green-900/20 hover:border-green-500 hover:text-green-500 transition-all font-['Black_Ops_One'] text-xl flex items-center justify-center gap-2"
                    >
                        <Save size={20} /> SAVE CHANGES
                    </button>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-800 bg-black flex justify-start">
                    <button 
                        onClick={onBack}
                        className="px-6 py-2 border border-zinc-600 text-zinc-400 hover:text-white hover:border-white font-mono flex items-center gap-2 transition-all"
                    >
                        <ArrowLeft size={16} /> CANCEL
                    </button>
                </div>
            </div>
        </div>
    );
};
