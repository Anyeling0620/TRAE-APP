import CryptoJS from 'crypto-js';

const SECRET_KEY = 'smart-md-academic-local-secret'; // In a real app, this should be more secure or user-provided

export const encryptKey = (key: string): string => {
  if (!key) return '';
  return CryptoJS.AES.encrypt(key, SECRET_KEY).toString();
};

export const decryptKey = (cipherText: string): string => {
  if (!cipherText) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error('Failed to decrypt key', e);
    return '';
  }
};
