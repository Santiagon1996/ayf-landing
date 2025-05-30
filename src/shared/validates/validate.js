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

const validateUserRegister = (data) => {
  try {
    userRegisterSchema.parse(data);
  } catch (error) {
    throw new ValidateError(error.errors.map((e) => e.message).join(", "));
  }
};

const validateUserLogin = (data) => {
  try {
    userLoginSchema.parse(data);
  } catch (error) {
    throw new ValidateError(error.errors.map((e) => e.message).join(", "));
  }
};

const validate = {
  userRegisterSchema,
  userLoginSchema,
  validateUserRegister,
  validateUserLogin,
};

export { validate };
