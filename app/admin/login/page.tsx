import Image from "next/image";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { LoginCargando } from "@/components/admin/LoginCargando";

async function iniciarSesion(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin/inscripciones",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/admin/login?error=1");
    }
    throw error;
  }
}

const inputClase =
  "rounded-lg bg-casi-negro/[0.045] px-4 py-3 text-lg outline-none border border-gray-300 focus:border-naranja";

export default async function LoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const { error } = await searchParams;

  return (
    <div className="relative flex min-h-screen bg-casi-negro">
      {/* Banner corporativo del club como fondo de toda la página, no solo
          de un panel al lado: por eso va absoluto detrás de todo,
          incluyendo el área donde se dibuja la tarjeta del formulario. */}
      <Image
        src="/admin-login-banner.jpg"
        alt=""
        fill
        priority
        className="object-cover"
      />

      {/* Tarjeta del formulario, flotando sobre el fondo. Recorte en punta
          solo en pantallas md+ (en móvil se ve como una tarjeta normal, de
          borde recto). */}
      <div className="relative z-10 flex w-full flex-1 items-center bg-white px-6 py-16 sm:px-10 md:w-[45%] md:flex-none md:[clip-path:polygon(0_0,76%_0,100%_23%,84%_90%,0_100%)] lg:w-[42%]">
        <div className="flex w-full max-w-sm flex-col gap-5 md:ml-[10%]">
          <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight">
            Panel admin
          </h1>

          {error && (
            <p className="rounded-lg bg-rojo/10 px-4 py-2 text-base font-bold text-rojo">
              Credenciales inválidas.
            </p>
          )}

          <form action={iniciarSesion} className="flex flex-col gap-5">
            <LoginCargando />
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
                Email
              </span>
              <input
                type="email"
                name="email"
                required
                className={inputClase}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
                Contraseña
              </span>
              <input
                type="password"
                name="password"
                required
                className={inputClase}
              />
            </label>

            <button
              type="submit"
              className="mt-2 rounded-full bg-naranja px-6 py-4 font-display text-lg font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)] transition-colors hover:bg-casi-negro"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
