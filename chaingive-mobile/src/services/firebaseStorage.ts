import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBAHzTpPUnxMGV6apw8ds_UbNOkiLQHE3A",
  authDomain: "depo-88964.firebaseapp.com",
  projectId: "depo-88964",
  storageBucket: "depo-88964.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export const uploadFile = async (file: Blob, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

export const deleteFile = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

export const uploadImage = async (uri: string, folder: string, fileName: string): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const path = `${folder}/${fileName}`;
  return await uploadFile(blob, path);
};

export default storage;