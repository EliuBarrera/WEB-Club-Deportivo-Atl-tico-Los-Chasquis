import Image from "next/image";
import { signOut } from "@/auth";
import { Dock } from "@/components/admin/Dock";

// No hace el chequeo de sesión aquí: los layouts no se re-renderizan en
// cada navegación (partial rendering), así que un redirect solo en este
// archivo no es confiable. El chequeo real vive en cada page.tsx del panel
// admin vía lib/admin/dal.ts.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  async function cerrarSesionAction() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mismo banner corporativo del login, ahora de fondo del panel. Fixed
          para que no se mueva con el scroll del contenido. */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <Image
          src="/admin-banner.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>

      <main className="flex-1 p-6 pb-32">{children}</main>
      <Dock cerrarSesionAction={cerrarSesionAction} />
    </div>
  );
}
