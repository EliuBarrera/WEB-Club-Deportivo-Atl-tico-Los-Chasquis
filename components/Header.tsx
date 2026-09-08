import Image from "next/image";
import Link from "next/link";

// Encabezado mínimo compartido por las páginas públicas (Fase 9): hasta
// ahora ninguna página tenía forma de volver a "/" salvo el botón atrás del
// navegador — al agregar una home real, hace falta este mínimo de
// navegación. Server component simple, sin menú móvil ni estado: solo dos
// enlaces, no hace falta más.
export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-4 sm:px-8">
      <Link href="/" className="flex items-center gap-2">
        {/* El wordmark de cropped-cropped-Logo-png.png viene en texto claro
            (pensado para fondo oscuro, ver public/admin-banner.jpg) y queda
            casi invisible sobre el fondo crema del sitio público — se usa
            solo el ícono del corredor (transparente, sí funciona en claro)
            junto con el nombre en la tipografía real del sitio. */}
        <Image
          src="/Logo.png"
          alt=""
          width={36}
          height={48}
          priority
          className="h-9 w-auto"
        />
        <span className="font-display text-base font-black uppercase leading-none tracking-tight text-casi-negro sm:text-lg">
          Los Chasquis
        </span>
      </Link>
      <nav className="flex items-center gap-6">
        <Link
          href="/eventos"
          className="font-display text-sm font-bold uppercase tracking-wide text-casi-negro"
        >
          Eventos
        </Link>
        <Link
          href="/transparencia"
          className="font-display text-sm font-bold uppercase tracking-wide text-casi-negro"
        >
          Transparencia
        </Link>
      </nav>
    </header>
  );
}
