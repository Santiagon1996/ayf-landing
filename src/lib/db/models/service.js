import mongoose from "mongoose";
import { slugify } from "../../utils/slugify.js";
import { ICON_NAMES } from "../../../components/icons/icons.js";

const { Schema, model, models } = mongoose;

const serviceSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del servicio es obligatorio"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["juridico", "contable"],
      required: [
        true,
        "El tipo de servicio (jurídico/contable) es obligatorio",
      ],
    },
    category: {
      type: String,
      enum: [
        "asesoria-juridica",
        "area-contable-fiscal",
        "area-financiera",
        "servicios-complementarios",
      ],
      required: [true, "La categoría del servicio es obligatoria"],
    },
    shortDescription: {
      type: String,
      required: [true, "La descripción breve del servicio es obligatoria"],
      maxlength: [
        300,
        "La descripción breve no puede exceder los 300 caracteres",
      ],
      trim: true,
    },
    fullDescription: {
      type: String,
      required: [true, "La descripción completa del servicio es obligatoria"],
    },
    details: [String],

    iconUrl: {
      type: String,
      enum: ICON_NAMES, // Asegura que solo se guarden nombres de iconos válidos
      default: "General", // Establece un icono por defecto de tu lista
      required: [true, "El icono del servicio es obligatorio"], // Podrías hacerlo requerido si siempre debe tener uno
    },
  },
  { versionKey: false, timestamps: true }
);

serviceSchema.pre("validate", function (next) {
  if (this.isNew || this.isModified("name")) {
    // isNew cubre la primera creación
    if (this.name && !this.slug) {
      this.slug = slugify(this.name);
    }
    // Opcional: si el nombre se modifica y ya hay un slug, puedes decidir si actualizarlo o no.
    // Por ahora, solo si no hay slug, lo genera.
  }
  next();
});

// Middleware para actualizar la fecha de actualización para findOneAndUpdate
// Este hook ya lo tienes y es útil si haces actualizaciones directas con findOneAndUpdate
serviceSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

const Service = models.Service || model("Service", serviceSchema);
export { Service };
