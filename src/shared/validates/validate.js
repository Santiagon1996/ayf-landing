import { z } from "zod";
import { constant } from "../constants/constants.js";
import error from "../errors/errors.js";
import { ICON_NAMES } from "../../components/icons/icons.js";

const { ValidateError, SystemError } = error;

// --- User Schema Definition ---
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
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(50, "La contraseña no puede superar los 50 caracteres"),
});
// --- User Login Schema Definition ---
const userLoginSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede superar los 50 caracteres")
    .regex(constant.NAME_REGEX, "El nombre debe ser válido"),

  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(50, "La contraseña no puede superar los 50 caracteres"),
});
// --- User ID Schema Definition ---
const idSchema = z.object({
  userId: z
    .string()
    .min(24, "El ID de usuario debe tener 24 caracteres")
    .max(24, "El ID de usuario no puede superar los 24 caracteres")
    .regex(constant.ID_REGEX, "El ID de usuario debe ser un ID válido"),
});
// --- Service Schema Definition ---
const serviceSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre del servicio debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder los 100 caracteres"), // Ajusta el max si es diferente
  slug: z
    .string()
    .regex(
      /^[a-z0-9-]+$/,
      "El slug debe ser URL-friendly (solo letras, números y guiones)"
    )
    .min(3, "El slug debe tener al menos 3 caracteres")
    .optional(), // <-- ¡IMPORTANTE! El slug es opcional en Zod si Mongoose lo auto-genera
  type: z.enum(["juridico", "contable"], {
    errorMap: () => ({
      message:
        "El tipo de servicio (jurídico/contable) es obligatorio y debe ser 'juridico' o 'contable'",
    }),
  }),
  category: z.enum(
    [
      "asesoria-juridica",
      "area-contable-fiscal",
      "area-financiera",
      "servicios-complementarios",
    ],
    {
      errorMap: () => ({
        message:
          "La categoría del servicio es obligatoria y debe ser una de las predefinidas",
      }),
    }
  ),
  shortDescription: z
    .string()
    .min(1, "La descripción breve del servicio es obligatoria")
    .max(300, "La descripción breve no puede exceder los 300 caracteres"), // <-- ¡Mismo mensaje que en el test!
  fullDescription: z
    .string()
    .min(1, "La descripción completa del servicio es obligatoria"),
  details: z.array(
    z.string().min(1, "Cada detalle debe ser una cadena no vacía")
  ),
  iconUrl: z
    .enum(ICON_NAMES, {
      // Ahora valida que sea uno de los nombres de icono permitidos
      required_error: "El icono es obligatorio.",
      invalid_type_error: "El icono seleccionado no es válido.",
    })
    .optional()
    .default("General"),
});
const updateServiceSchema = serviceSchema.partial();

// --- Blog Schema Definition ---
const blogSchema = z.object({
  title: z
    .string({
      required_error: "El título de la novedad es obligatorio",
      invalid_type_error: "El título debe ser una cadena de texto.",
    })

    .min(5, "El título debe tener al menos 5 caracteres.")
    .max(200, "El título no puede exceder los 200 caracteres."),

  category: z
    .enum(["juridico", "contable", "fiscal", "laboral", "noticias-generales"], {
      required_error: "La categoría es obligatoria.",
      invalid_type_error: 'La categoría "{VALUE}" no es válida.',
    })
    .transform((val) => val.toLowerCase()),

  slug: z
    .string({
      invalid_type_error: "El slug debe ser una cadena de texto.",
    })
    .toLowerCase()
    .min(1, "El slug no puede estar vacío si se proporciona.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El slug debe ser una URL amigable (letras, números y guiones)."
    )
    .optional(),

  description: z
    .string({
      invalid_type_error: "La descripción debe ser una cadena de texto.",
    })
    .max(500, "La descripción no puede exceder los 500 caracteres")
    .optional(),

  content: z
    .string({
      required_error: "El contenido de la novedad es obligatorio",
      invalid_type_error: "El contenido debe ser una cadena de texto.",
    })
    .min(20, "El contenido debe tener al menos 20 caracteres."),

  author: z
    .string({
      required_error: "El autor es obligatorio.",
      invalid_type_error: "El autor debe ser una cadena de texto.",
    })
    .min(3, "El autor debe tener al menos 3 caracteres.")
    .default("Estudio Jurídico/Contable"),

  publishedAt: z
    .preprocess(
      (arg) => {
        if (
          typeof arg === "string" ||
          typeof arg === "number" ||
          arg instanceof Date
        ) {
          return new Date(arg);
        }
        return arg;
      },
      z.date({
        required_error: "La fecha de publicación es obligatoria.",
        invalid_type_error: "La fecha de publicación no es una fecha válida.",
      })
    )
    .default(() => new Date()), // Use a function for default date in Zod

  isPublished: z.boolean().default(false),

  // iconUrl: z
  //   .enum(ICON_NAMES, {
  //     // Ahora valida que sea uno de los nombres de icono permitidos
  //     required_error: "El icono es obligatorio.",
  //     invalid_type_error: "El icono seleccionado no es válido.",
  //   })
  //   .optional()
  //   .default("General"),
  viewsCount: z.number().int().min(0).default(0),
});
const updateBlogSchema = blogSchema.partial();

// --- Contact Form Schema Definition ---
const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(50, "El nombre no puede exceder los 50 caracteres."),
  email: z.string().email("Por favor, ingresa una dirección de correo válida."),
  subject: z
    .string()
    .min(5, "El asunto debe tener al menos 5 caracteres.")
    .max(100, "El asunto no puede exceder los 100 caracteres."),
  message: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres.")
    .max(500, "El mensaje no puede exceder los 500 caracteres."),
});

// --- Validation Function ---
const validateService = (data) => {
  try {
    const parseData = serviceSchema.parse(data);
    return parseData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      throw new ValidateError("Validation failed for service data", details);
    }
    throw new SystemError(
      "Unexpected error during service validation",
      error.message
    );
  }
};
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
const validateId = (data) => {
  try {
    idSchema.parse({ userId: data });
    return data;
  } catch (error) {
    const detailedErrors = error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw new ValidateError("Validation failed for user ID", detailedErrors);
  }
};
const validateBlog = (data) => {
  try {
    return blogSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      throw new ValidateError("Validation failed for blog post data", details);
    }
    throw new SystemError(
      "Unexpected error during blog post validation",
      error.message
    );
  }
};

const validateContactForm = (data) => {
  try {
    return contactFormSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      throw new ValidateError(
        "Validation failed for contact form data",
        details
      );
    }
    throw new SystemError(
      "Unexpected error during contact form validation",
      error.message
    );
  }
};
const validate = {
  userRegisterSchema,
  userLoginSchema,
  idSchema,
  serviceSchema,
  updateServiceSchema,
  contactFormSchema,
  blogSchema,
  updateBlogSchema,
  validateUserRegister,
  validateUserLogin,
  validateId,
  validateService,
  validateBlog,
  validateContactForm,
};

export { validate };
