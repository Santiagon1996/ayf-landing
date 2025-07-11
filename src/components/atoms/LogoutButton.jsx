import { useRouter } from "next/navigation";
import { logoutUserRequest } from "@/app/_logic/logoutUserRequest.js";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUserRequest();
      Swal.fire({
        icon: "success",
        title: "Sesión cerrada",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error al cerrar sesión",
        text: err.message,
      });
    }
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      Cerrar sesión
    </Button>
  );
}
