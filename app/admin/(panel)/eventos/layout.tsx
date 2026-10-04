import { PestanaEventoProvider } from "@/components/admin/PestanaEventoContext";

// Solo envuelve la página para conservar la pestaña activa del editor
// entre guardados (ver PestanaEventoContext).
export default function EventosLayout({ children }: LayoutProps<"/admin/eventos">) {
  return <PestanaEventoProvider>{children}</PestanaEventoProvider>;
}
