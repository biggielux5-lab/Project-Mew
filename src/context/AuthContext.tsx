/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Campaign, PlayerRole } from '../types';
import { storageService } from '../services/storageService';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  activeCampaign: Campaign | null;
  campaigns: Campaign[];
  isGM: boolean;
  userRoleInActiveCampaign: PlayerRole | null;
  login: (email: string) => Promise<void>;
  register: (name: string, email: string, avatar?: string) => Promise<void>;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateProfile: (data: Partial<User>) => void;
  selectCampaign: (id: string | null) => void;
  refreshCampaigns: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(storageService.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(storageService.getUsers());
  const [campaigns, setCampaigns] = useState<Campaign[]>(storageService.getCampaigns());
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(() => {
    const all = storageService.getCampaigns();
    return all.length > 0 ? all[0].id : null;
  });

  const refreshCampaigns = () => {
    const updated = storageService.getCampaigns();
    setCampaigns(updated);
  };

  const refreshAll = () => {
    setCurrentUser(storageService.getCurrentUser());
    setAllUsers(storageService.getUsers());
    refreshCampaigns();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId) || null;

  const userRoleInActiveCampaign: PlayerRole | null = React.useMemo(() => {
    if (!currentUser || !activeCampaign) return null;
    if (activeCampaign.gmId === currentUser.id) return 'gm';
    const playerRecord = activeCampaign.players.find((p) => p.userId === currentUser.id);
    return playerRecord ? playerRecord.role : null;
  }, [currentUser, activeCampaign]);

  const isGM = userRoleInActiveCampaign === 'gm' || userRoleInActiveCampaign === 'co-gm';

  const login = async (email: string) => {
    const user = storageService.login(email);
    setCurrentUser(user);
    refreshAll();
  };

  const register = async (name: string, email: string, avatar?: string) => {
    const user = storageService.register(name, email, avatar);
    setCurrentUser(user);
    refreshAll();
  };

  const logout = () => {
    storageService.logout();
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      storageService.setCurrentUser(target);
      setCurrentUser(target);
      refreshCampaigns();
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = storageService.updateUserProfile({ ...data, id: currentUser.id });
    setCurrentUser(updated);
    setAllUsers(storageService.getUsers());
  };

  const selectCampaign = (id: string | null) => {
    setActiveCampaignId(id);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        activeCampaign,
        campaigns,
        isGM,
        userRoleInActiveCampaign,
        login,
        register,
        logout,
        switchUser,
        updateProfile,
        selectCampaign,
        refreshCampaigns,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
