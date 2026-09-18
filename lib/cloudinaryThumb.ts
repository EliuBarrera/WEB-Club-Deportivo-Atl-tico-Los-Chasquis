// Inserta una transformación de Cloudinary vía parámetros de URL (Fase 6)
// en vez de guardar copias distintas de la misma imagen. Ej:
// cloudinaryThumb(url, "c_fill,w_96,h_72"). Vive aparte de lib/cloudinary.ts
// (que trae el SDK completo, solo servidor) porque esto es texto puro y
// también se usa desde components/admin/EventosLista.tsx, un Client
// Component (Fase 11) — importar cualquier cosa de lib/cloudinary.ts ahí
// metería el SDK de Cloudinary (que necesita `fs`) al bundle del navegador.
export function cloudinaryThumb(url: string, transform: string): string {
  return url.replace("/upload/", `/upload/${transform}/`);
}
