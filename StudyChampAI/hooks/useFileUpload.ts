import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export interface UploadedFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
  mimeType?: string;
}

export interface UseFileUploadReturn {
  uploadedFiles: UploadedFile[];
  isUploading: boolean;
  pickDocument: () => Promise<void>;
  pickImage: () => Promise<void>;
  removeFile: (uri: string) => void;
  clearFiles: () => void;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload images.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const pickDocument = async () => {
    try {
      setIsUploading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Check file size (limit to 10MB)
        if (file.size && file.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a file smaller than 10MB.');
          return;
        }

        const uploadedFile: UploadedFile = {
          uri: file.uri,
          name: file.name,
          type: 'document',
          size: file.size,
          mimeType: file.mimeType,
        };

        setUploadedFiles(prev => [...prev, uploadedFile]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      setIsUploading(true);

      Alert.alert(
        'Select Image',
        'Choose an option',
        [
          { text: 'Camera', onPress: () => openCamera() },
          { text: 'Gallery', onPress: () => openGallery() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error picking image:', error);
      setIsUploading(false);
    }
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        
        const uploadedFile: UploadedFile = {
          uri: image.uri,
          name: `camera_image_${Date.now()}.jpg`,
          type: 'image',
          size: image.fileSize,
          mimeType: 'image/jpeg',
        };

        setUploadedFiles(prev => [...prev, uploadedFile]);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        
        const uploadedFile: UploadedFile = {
          uri: image.uri,
          name: `gallery_image_${Date.now()}.jpg`,
          type: 'image',
          size: image.fileSize,
          mimeType: 'image/jpeg',
        };

        setUploadedFiles(prev => [...prev, uploadedFile]);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (uri: string) => {
    setUploadedFiles(prev => prev.filter(file => file.uri !== uri));
  };

  const clearFiles = () => {
    setUploadedFiles([]);
  };

  return {
    uploadedFiles,
    isUploading,
    pickDocument,
    pickImage,
    removeFile,
    clearFiles,
  };
};
