import { create } from 'zustand';

interface PdfreaderState {
  scale: number;
  currentPage: number;
  numPages: number;
  filename: string;
  doi: string;
  sha: string;
  fileUrl: string;
  extractedText: string;
  /** 新增：文件句柄 */
  fileHandle: FileSystemFileHandle | null;

  // actions
  setScale: (newScale: number) => void;
  setCurrentPage: (currentPage: number) => void;
  setNumPages: (numPages: number) => void;
  saveFileInfo: (
    filename: string,
    doi: string,
    sha: string,
    extractedText: string,
    fileUrl: string
  ) => void;
  /** 新增：设置/清空文件句柄 */
  setFileHandle: (handle: FileSystemFileHandle | null) => void;
}

const usePdfreader = create<PdfreaderState>((set) => ({
  scale: 1.0,
  currentPage: 1,
  numPages: 0,
  filename: '',
  doi: '',
  sha: '',
  fileUrl: '',
  extractedText: '',
  fileHandle: null, // 新增

  setScale: (newScale) => set({ scale: newScale }),
  setCurrentPage: (updater) => set((state) => ({
    currentPage: typeof updater === 'function'
      ? updater(state.currentPage)  // 支持函数式更新
      : updater                      // 支持直接数值
  })),
  setNumPages: (numPages) => set({ numPages }),
  saveFileInfo: (filename, doi, sha, extractedText, fileUrl) =>
    set({ filename, doi, sha, extractedText, fileUrl }),

  // 新增：专门存储 fileHandle
  setFileHandle: (handle) => set({ fileHandle: handle }),
}));

export default usePdfreader;
