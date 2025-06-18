import { LoginForm } from "@/components/organisms/LoginForm";

export const metadata = {
  title: "Login de Usuario | AyF Asociados",
  description:
    "Autenticate en AyF Asociados para acceder a nuestros servicios.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </main>
  );
}
