// storage/fileHandleDB.js
import { openDB } from 'idb';

const DB_NAME = 'fileHandleDB';
const STORE_NAME = 'file_handle';  // 专门存放句柄

/**
 * 存储 handle 到 IndexedDB
 * @param {FileSystemFileHandle|null} handle
 */
export async function saveFileHandle(handle) {
    const db = await openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });
    // 这里只放一个固定 key "pdfHandle", 也可灵活处理多个
    await db.put(STORE_NAME, handle, 'pdfHandle');
}

/**
 * 从 IndexedDB 读取 handle
 * @returns {Promise<FileSystemFileHandle|null>}
 */
export async function loadFileHandle() {
    const db = await openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });
    const handle = await db.get(STORE_NAME, 'pdfHandle');
    return handle || null;
}

/**
 * 清除存储的 handle
 */
export async function removeFileHandle() {
    const db = await openDB(DB_NAME, 1);
    await db.delete(STORE_NAME, 'pdfHandle');
}
