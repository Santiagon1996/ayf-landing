import mongoose from "mongoose";
import { slugify } from "../../utils/slugify.js";
//import { ICON_NAMES } from "../../../components/icons/icons.js";
const { Schema, model, models } = mongoose;

// BLOG schema definition
const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "El título de la novedad es obligatorio"],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, "La categoría es obligatoria."],
      enum: {
        values: [
          "juridico",
          "contable",
          "fiscal",
          "laboral",
          "noticias-generales",
        ],
        message: 'La categoría "{VALUE}" no es válida.',
      },
      lowercase: true,
      trim: true,
    },
    slug: {
      // URL amigable para SEO (ej. /novedades/mi-titulo-de-novedad)
      type: String,
      // required: [true, "El slug es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      // <--- Sugerencia 3: Campo de descripción/resumen
      type: String,
      trim: true,
      maxlength: [500, "La descripción no puede exceder los 500 caracteres"],
    },
    content: {
      type: String,
      required: [true, "El contenido de la novedad es obligatorio"],
    },
    author: {
      type: String,
      required: [true, "El autor es obligatorio."],
      default: "Estudio Jurídico/Contable",
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    // iconUrl: {
    //   type: String,
    //   enum: ICON_NAMES, // Asegura que solo se guarden nombres de iconos válidos
    //   default: "General", // Establece un icono por defecto de tu lista
    //   required: [true, "El icono del servicio es obligatorio"], // Podrías hacerlo requerido si siempre debe tener uno
    // },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Middleware para generar el slug automáticamente
blogSchema.pre("validate", function (next) {
  // Si es un documento nuevo O si el título ha sido modificado, genera un slug
  if (this.isNew || this.isModified("title")) {
    if (this.title) {
      this.slug = slugify(this.title, { lower: true, strict: true });
    }
  }
  next();
});
// Middleware para actualizar la fecha de actualización para findOneAndUpdate
// Este hook ya lo tienes y es útil si haces actualizaciones directas con findOneAndUpdate
blogSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update && update.title) {
    this.set({ slug: slugify(update.title, { lower: true, strict: true }) });
  }
  next();
});

const Blog = models.Blog || model("Blog", blogSchema);

export { Blog };
