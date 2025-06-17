import { cookies } from "next/headers";
import { errors } from "shared";

const { SystemError } = errors;

export const logoutUser = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("accessToken"); // Operación de eliminación de cookie
    // Opcional: Si tienes un refresh token, también deberías eliminarlo aquí
    // cookies().delete('refreshToken');

    // Si la operación de borrado de cookie es exitosa, simplemente retornamos
    // No necesitamos retornar 'true' explícitamente a menos que la ruta lo espere,
    // pero retornar void (nada) o true es aceptable.
  } catch (error) {
    // Si cookies().delete() lanzara un error por alguna razón (muy raro)
    console.error("Error al eliminar la cookie de acceso:", error);
    throw new SystemError("Error interno al cerrar la sesión", error.message);
  }
};
