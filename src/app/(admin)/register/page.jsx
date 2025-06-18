import { RegisterForm } from "@/components/organisms/RegisterForm";

export const metadata = {
  title: "Registro de Usuario | AyF Asociados",
  description: "Regístrate en AyF Asociados para acceder a nuestros servicios.",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <RegisterForm />
    </main>
  );
}
