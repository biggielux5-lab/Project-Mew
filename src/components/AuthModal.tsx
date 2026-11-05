/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, LogIn, UserPlus, KeyRound, Check, Sparkles, X, Shield, ArrowRight, Camera } from 'lucide-react';
import { ImageUploadModal } from './ImageUploadModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'profile' | 'recovery';
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { currentUser, allUsers, login, register, switchUser, updateProfile, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'profile' | 'recovery'>(
    currentUser && initialMode === 'profile' ? 'profile' : initialMode
  );
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);

  // Forms
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || AVATAR_PRESETS[0]);
  const [recoverySent, setRecoverySent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login(email);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao efetuar login.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Preencha os campos obrigatórios.');
      return;
    }
    try {
      await register(name, email, selectedAvatar);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao criar conta.');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      bio,
      avatar: selectedAvatar,
    });
    setSuccessMsg('Perfil atualizado com sucesso!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setRecoverySent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#12131d] border border-purple-900/40 rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-purple-900/20 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                {mode === 'login' && 'Acesso ao Project Mew'}
                {mode === 'register' && 'Cadastrar Nova Conta'}
                {mode === 'recovery' && 'Recuperação de Acesso'}
                {mode === 'profile' && 'Perfil do Usuário'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'profile' ? 'Gerencie seus dados e avatar' : 'Plataforma oficial Além da Próxima Rota'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="text-xs text-rose-400 font-medium bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/50">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="text-xs text-emerald-400 font-medium bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/50 flex items-center gap-1.5">
            <Check className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* Quick Demo Switcher (Instant 1-click test between GM and Players!) */}
        {mode !== 'profile' && (
          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block">
              Acesso Rápido de Demonstração (1 Clique)
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    switchUser(u.id);
                    onClose();
                  }}
                  className={`p-1.5 rounded-lg border text-left transition-all flex items-center gap-2 ${
                    currentUser?.id === u.id
                      ? 'bg-purple-900/50 border-purple-500 text-purple-200'
                      : 'bg-black/40 border-zinc-800 text-slate-400 hover:text-slate-200 hover:border-zinc-700'
                  }`}
                >
                  <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                  <div className="truncate">
                    <div className="text-[11px] font-bold truncate leading-tight text-white">{u.name}</div>
                    <div className="text-[9px] text-purple-400 uppercase font-mono">{u.role === 'admin' ? 'Mestre' : 'Jogador'}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mode: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@projectmew.com"
                className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Senha</label>
                <button
                  type="button"
                  onClick={() => setMode('recovery')}
                  className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-lg transition-all"
            >
              Entrar na Plataforma
            </button>

            <div className="text-center pt-2 border-t border-zinc-800 text-xs text-slate-400">
              Não possui uma conta?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-purple-400 hover:underline font-bold"
              >
                Cadastre-se gratuitamente
              </button>
            </div>
          </form>
        )}

        {/* Mode: REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nome de Exibição *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Treinador Lucas, Narrador Bruno..."
                className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">E-mail *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Senha *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            {/* Avatar picker */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Escolha seu Avatar</label>
              <div className="flex items-center gap-2">
                {AVATAR_PRESETS.map((av, idx) => (
                  <img
                    key={idx}
                    src={av}
                    alt="preset"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 transition-all ${
                      selectedAvatar === av ? 'border-purple-500 scale-110 shadow-md shadow-purple-900' : 'border-zinc-700 opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-lg transition-all"
            >
              Criar Conta no Project Mew
            </button>

            <div className="text-center pt-2 border-t border-zinc-800 text-xs text-slate-400">
              Já possui conta?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-purple-400 hover:underline font-bold"
              >
                Faça login
              </button>
            </div>
          </form>
        )}

        {/* Mode: RECOVERY */}
        {mode === 'recovery' && (
          <div className="space-y-4">
            {recoverySent ? (
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-2 text-xs text-purple-200">
                <Check className="w-5 h-5 text-emerald-400" />
                <p className="font-bold text-white text-sm">Instruções enviadas com sucesso!</p>
                <p>
                  Enviamos um link de redefinição de senha para o e-mail informado. Verifique sua caixa de entrada.
                </p>
                <button
                  onClick={() => {
                    setRecoverySent(false);
                    setMode('login');
                  }}
                  className="mt-3 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Voltar ao Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecovery} className="space-y-4">
                <p className="text-xs text-slate-400">
                  Informe o e-mail cadastrado para enviarmos instruções de recuperação da sua conta.
                </p>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">E-mail Cadastrado</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="flex-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-slate-300"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white"
                  >
                    Recuperar Senha
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Mode: PROFILE */}
        {mode === 'profile' && currentUser && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-black/40 border border-zinc-800">
              <img
                src={selectedAvatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-purple-500 shadow-md"
              />
              <div>
                <h4 className="font-bold text-white text-sm">{currentUser.name}</h4>
                <div className="text-xs text-slate-400">{currentUser.email}</div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  Membro desde {new Date(currentUser.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nome de Exibição</label>
              <input
                type="text"
                value={name || currentUser.name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Bio / Perfil de Jogador</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Estilo de jogo, preferências de narrador ou jogador..."
                className="w-full bg-[#181928] border border-purple-900/30 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Trocar Avatar</label>
              <div className="flex items-center gap-2 mb-2">
                {AVATAR_PRESETS.map((av, idx) => (
                  <img
                    key={idx}
                    src={av}
                    alt="preset"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 transition-all ${
                      selectedAvatar === av ? 'border-purple-500 scale-110 shadow-md' : 'border-zinc-700 opacity-60'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIsImageUploadOpen(true)}
                className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-purple-900/40 text-purple-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Enviar Foto do Computador ou Link Web</span>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                Encerrar Sessão (Logout)
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        )}
      </div>

      <ImageUploadModal
        isOpen={isImageUploadOpen}
        title="Alterar Foto de Perfil"
        currentImageUrl={selectedAvatar}
        defaultFallbackUrl={AVATAR_PRESETS[0]}
        onClose={() => setIsImageUploadOpen(false)}
        onSave={(newUrl) => setSelectedAvatar(newUrl)}
      />
    </div>
  );
};
