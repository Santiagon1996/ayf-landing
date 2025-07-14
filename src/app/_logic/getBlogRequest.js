import { errors } from "shared";
import { handleApiError } from "@/lib/handlers/handleApiError";

const { SystemError } = errors;

export const getBlogRequest = async () => {
  let response;
  let body;

  try {
    response = await fetch(`/api/blogs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    throw new SystemError("Error al obtener los blogs", error.message);
  }

  if (response.status === 200) {
    try {
      body = await response.json();
      return body;
    } catch (error) {
      throw new SystemError(
        "Error al parsear la respuesta JSON de los servicios",
        error.message
      );
    }
  }

  if (!response.ok) {
    await handleApiError(response);
  }
};
