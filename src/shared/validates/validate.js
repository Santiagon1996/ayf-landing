import { z } from "zod";
import { constant } from "../constants/constants.js";
import error from "../errors/errors.js";

const { ValidateError } = error;

const userRegisterSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede superar los 50 caracteres")
    .regex(
      constant.NAME_REGEX,
      "El nombre solo puede contener letras y espacios"
    ),

  email: z
    .string()
    .email("Email inválido")
    .max(50, "El email no puede superar los 50 caracteres")
    .regex(constant.EMAIL_REGEX, "El email debe ser válido"),

  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(50, "La contraseña no puede superar los 50 caracteres"),
});

const userLoginSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede superar los 50 caracteres")
    .regex(constant.NAME_REGEX, "El nombre debe ser válido"),

  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(50, "La contraseña no puede superar los 50 caracteres"),
});

const userIdSchema = z.object({
  userId: z
    .string()
    .min(24, "El ID de usuario debe tener 24 caracteres")
    .max(24, "El ID de usuario no puede superar los 24 caracteres")
    .regex(constant.ID_REGEX, "El ID de usuario debe ser un ID válido"),
});
const validateUserRegister = (data) => {
  try {
    userRegisterSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      throw new ValidateError(
        "Validation failed for user registration",
        details
      );
    }
    throw new SystemError("Unexpected error during validation", error.message);
  }
};

const validateUserLogin = (data) => {
  try {
    userLoginSchema.parse(data);
  } catch (error) {
    const detailedErrors = error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw new ValidateError("Validation failed for user login", detailedErrors);
  }
};

const validateUserId = (data) => {
  try {
    userIdSchema.parse({ userId: data });
  } catch (error) {
    const detailedErrors = error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw new ValidateError("Validation failed for user ID", detailedErrors);
  }
};

const validate = {
  userRegisterSchema,
  userLoginSchema,
  userIdSchema,
  validateUserRegister,
  validateUserLogin,
  validateUserId,
};

export { validate };
