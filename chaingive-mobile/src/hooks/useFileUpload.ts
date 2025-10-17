import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage, deleteFile } from '../services/firebaseStorage';

interface UploadResult {
  url: string;
  path: string;
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const pickImage = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access camera roll is required!');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  const takePhoto = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access camera is required!');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  const uploadFile = async (uri: string, folder: string, fileName?: string): Promise<UploadResult | null> => {
    try {
      setUploading(true);
      setProgress(0);

      const name = fileName || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const url = await uploadImage(uri, folder, name);
      const path = `${folder}/${name}`;

      setProgress(100);
      return { url, path };
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeFile = async (path: string): Promise<boolean> => {
    try {
      await deleteFile(path);
      return true;
    } catch (error) {
      console.error('Delete failed:', error);
      return false;
    }
  };

  return {
    uploading,
    progress,
    pickImage,
    takePhoto,
    uploadFile,
    removeFile,
  };
};