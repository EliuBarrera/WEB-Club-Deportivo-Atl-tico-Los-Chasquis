import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

// Inserta una transformación de Cloudinary vía parámetros de URL (Fase 6)
// en vez de guardar copias distintas de la misma imagen. Ej:
// cloudinaryThumb(url, "c_fill,w_96,h_72").
export function cloudinaryThumb(url: string, transform: string): string {
  return url.replace("/upload/", `/upload/${transform}/`);
}