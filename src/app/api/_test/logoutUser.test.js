// src/app/api/_test/logoutUser.test.js

// Importa la función a testear
import { logoutUser } from "@/app/api/_logic/logoutUser.js";
// Importa las clases de error
import { errors } from "shared";

const { SystemError } = errors;

// Importa las referencias de los mocks directamente desde tu archivo mock.
// La ruta es relativa desde tu archivo de test hasta el archivo mock.
// Asumiendo que '__mocks__' está en la raíz de tu proyecto (al mismo nivel que 'src'):
import { mockDelete, mockCookies } from "../../../__mocks__/next/headers.js";
// Si tu carpeta '__mocks__' estuviera dentro de 'src' (es decir, 'src/__mocks__'), la ruta sería:
// import { mockDelete, mockCookies } from "../../__mocks__/next/headers.js";

describe("logoutUser Logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should successfully log out the user by deleting the accessToken cookie", async () => {
    await logoutUser();

    expect(mockCookies).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith("accessToken");
  });

  test("should throw a SystemError if there is an error deleting the accessToken cookie", async () => {
    const simulatedErrorMessage = "Failed to delete cookie";

    // Configuramos el mock para que `mockDelete` lance un error UNA SOLA VEZ.
    mockDelete.mockImplementationOnce(() => {
      throw new Error(simulatedErrorMessage);
    });

    // Llamamos a logoutUser() UNA SOLA VEZ y capturamos la promesa.
    const logoutPromise = logoutUser();

    // Hacemos ambas aserciones sobre la MISMA promesa rechazada.
    await expect(logoutPromise).rejects.toThrow(SystemError);
    await expect(logoutPromise).rejects.toThrow(
      "Error interno al cerrar la sesión"
    );

    // Las verificaciones de llamadas al mock también se aplican a esa única ejecución.
    expect(mockCookies).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith("accessToken");
  });
});
