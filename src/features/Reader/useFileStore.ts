import { create } from 'zustand';

export interface FileData {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  // We don't store the raw File object in Zustand as it's not serializable for persistence if we used persist middleware here,
  // but for runtime state it's fine. However, we use IndexedDB for long term.
}

interface FileStoreState {
  files: FileData[];
  activeFileId: string | null;
  isProcessing: boolean;
  progress: string;
  
  setFiles: (files: FileData[]) => void;
  addFile: (file: FileData) => void;
  selectFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  setProcessing: (isProcessing: boolean, progress?: string) => void;
  removeFile: (id: string) => void;
}

export const useFileStore = create<FileStoreState>((set) => ({
  files: [],
  activeFileId: null,
  isProcessing: false,
  progress: '',

  setFiles: (files) => set({ files }),
  addFile: (file) => set((state) => ({ 
    files: [file, ...state.files], 
    activeFileId: file.id 
  })),
  selectFile: (id) => set({ activeFileId: id }),
  updateFileContent: (id, content) => set((state) => ({
    files: state.files.map(f => f.id === id ? { ...f, content } : f)
  })),
  setProcessing: (isProcessing, progress = '') => set({ isProcessing, progress }),
  removeFile: (id) => set((state) => ({
    files: state.files.filter(f => f.id !== id),
    activeFileId: state.activeFileId === id ? null : state.activeFileId
  })),
}));
