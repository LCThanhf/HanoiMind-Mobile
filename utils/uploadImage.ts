import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * BƯỚC 1: Xử lý ảnh (Resize, Xoay, Nén)
 */
export const processImage = async (uri: string) => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }], // Tự động co về chiều ngang 1024px (giữ tỉ lệ)
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG } // Nén 80% cho nhẹ
  );
  return result.uri;
};

/**
 * BƯỚC 2: Upload lên Cloudinary
 */
export const upImageToCloudinary = async (processedUri: string): Promise<string | null> => {
  const formData = new FormData();
  
  formData.append('file', {
    uri: processedUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as any);
  
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.secure_url; // Trả về link string
  } catch (error) {
    console.error("Lỗi upload:", error);
    return null;
  }
};

/**
 * BƯỚC 3: Hàm "nấu" URL theo yêu cầu (Truyền param trực tiếp)
 */
export const getCdnUrl = (url: string, transform: string = 'w_400,h_400,c_fill,q_auto,f_auto,g_auto') => {
  if (!url || !url.includes('cloudinary.com')) return url;
  // Cloudinary không thích dấu cách trong chuỗi biến đổi
  const cleanTransform = transform.replace(/\s+/g, ''); 
  return url.replace('/upload/', `/upload/${cleanTransform}/`);
};

