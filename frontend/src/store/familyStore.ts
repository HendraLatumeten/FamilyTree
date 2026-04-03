import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface Member {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthDate?: string;
  posX?: number | null;
  posY?: number | null;
  title?: string | null;
  photoUrl?: string | null;
}

interface Relationship {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  relationshipType: 'PARENT' | 'SPOUSE';
}

interface FamilyState {
  members: Member[];
  relationships: Relationship[];
  loading: boolean;
  fetchTree: (token: string) => Promise<void>;
  addMember: (member: Omit<Member, 'id'>) => Member;
  addRelationship: (rel: Omit<Relationship, 'id'>) => Relationship;
  deleteMember: (token: string, id: string) => Promise<void>;
  updatePosition: (token: string, id: string, posX: number, posY: number) => Promise<void>;
  updateBulkPositions: (token: string, positions: { id: string; posX: number; posY: number }[]) => Promise<void>;
  syncTree: (token: string, positions: { id: string; posX: number; posY: number }[]) => Promise<Member[]>;
  updateMemberDetails: (token: string, id: string, details: { name?: string; title?: string }) => Promise<void>;
  uploadMemberPhoto: (token: string, id: string, file: File) => Promise<string>;
  publishTree: (token: string) => Promise<string>;
  fetchPublicTree: (shareId: string) => Promise<void>;
  shareId: string | null;
}

export const useFamilyStore = create<FamilyState>((set) => ({
  members: [],
  relationships: [],
  loading: false,
  shareId: null,
  fetchTree: async (token) => {
    set({ loading: true });
    try {
      const { data } = await axios.get(`${API_URL}/family/tree`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ members: data.members, relationships: data.relationships });
    } finally {
      set({ loading: false });
    }
  },
  addMember: (member) => {
    const newMember = { ...member, id: `temp-${Date.now()}` } as Member;
    set((state) => ({ members: [...state.members, newMember] }));
    return newMember;
  },
  addRelationship: (rel) => {
    const newRel = { ...rel, id: `temp-rel-${Date.now()}` } as Relationship;
    set((state) => ({ relationships: [...state.relationships, newRel] }));
    return newRel;
  },
  deleteMember: async (token, id) => {
    await axios.delete(`${API_URL}/family/members/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
      relationships: state.relationships.filter((r) => r.fromMemberId !== id && r.toMemberId !== id),
    }));
  },
  updatePosition: async (token, id, posX, posY) => {
    await axios.patch(`${API_URL}/family/members/${id}/position`, { posX, posY }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, posX, posY } : m)),
    }));
  },
  updateBulkPositions: async (token, positions) => {
    await axios.patch(`${API_URL}/family/members/bulk/positions`, { positions }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({
      members: state.members.map((m) => {
        const update = positions.find((p) => p.id === m.id);
        return update ? { ...m, posX: update.posX, posY: update.posY } : m;
      }),
    }));
  },
  syncTree: async (token, positions) => {
    const state = useFamilyStore.getState();
    const newMembers = state.members.filter(m => m.id.startsWith('temp-'));
    const newRelationships = state.relationships.filter(r => r.id?.startsWith('temp-rel-'));
    
    await axios.post(`${API_URL}/family/members/sync`, {
      newMembers,
      newRelationships,
      positions
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const { data } = await axios.get(`${API_URL}/family/tree`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    set({ members: data.members, relationships: data.relationships });
    return data.members;
  },
  updateMemberDetails: async (token, id, details) => {
    if (id.startsWith('temp-')) {
      set((state) => ({
        members: state.members.map((m) => (m.id === id ? { ...m, ...details } : m)),
      }));
      return;
    }

    const { data } = await axios.patch(`${API_URL}/family/members/${id}`, details, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, ...data } : m)),
    }));
  },
  uploadMemberPhoto: async (token, id, file) => {
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const { data } = await axios.post(`${API_URL}/family/members/${id}/photo`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      set((state) => ({
        members: state.members.map((m) => (m.id === id ? data : m)),
      }));
      return data.photoUrl;
    } catch (err: any) {
      console.error("[STORE] Error uploading member photo:", err.response?.data || err.message);
      throw err;
    }
  },
  publishTree: async (token) => {
    const { data } = await axios.patch(`${API_URL}/family/publish`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set({ shareId: data.shareId });
    return data.shareId;
  },
  fetchPublicTree: async (shareId) => {
    set({ loading: true });
    try {
      const { data } = await axios.get(`${API_URL}/family/public/${shareId}`);
      set({ members: data.members, relationships: data.relationships, shareId });
    } finally {
      set({ loading: false });
    }
  },
}));
