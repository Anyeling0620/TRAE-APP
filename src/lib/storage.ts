import { openDB, DBSchema } from 'idb';

interface ParsedFile {
  id: string;
  name: string;
  content: string; // Markdown content
  createdAt: number;
  updatedAt: number;
}

interface SmartMDDB extends DBSchema {
  files: {
    key: string;
    value: ParsedFile;
    indexes: { 'by-date': number };
  };
}

const DB_NAME = 'smart-md-academic-db';
const STORE_NAME = 'files';

export const initDB = async () => {
  return openDB<SmartMDDB>(DB_NAME, 1, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, {
        keyPath: 'id',
      });
      store.createIndex('by-date', 'updatedAt');
    },
  });
};

export const saveFile = async (file: ParsedFile) => {
  const db = await initDB();
  return db.put(STORE_NAME, file);
};

export const getFiles = async () => {
  const db = await initDB();
  return db.getAllFromIndex(STORE_NAME, 'by-date');
};

export const getFile = async (id: string) => {
  const db = await initDB();
  return db.get(STORE_NAME, id);
};

export const deleteFile = async (id: string) => {
  const db = await initDB();
  return db.delete(STORE_NAME, id);
};
