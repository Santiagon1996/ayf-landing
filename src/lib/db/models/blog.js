import mongoose from "mongoose";

const { Schema, model, models } = mongoose;
// BLOG schema definition
const blogSchema = new Schema({
  title: {
    type: String,
    required: [true, "El título de la novedad es obligatorio"],
    trim: true,
    unique: true, // Los títulos de novedades suelen ser únicos
  },
  slug: {
    // URL amigable para SEO (ej. /novedades/mi-titulo-de-novedad)
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  content: {
    type: String,
    required: [true, "El contenido de la novedad es obligatorio"],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId, // Si tienes un modelo User, puedes enlazarlo
    ref: "User",
    required: [true, "El autor es obligatorio"],
  },
  category: {
    type: String,
    enum: ["general", "fiscal", "legal", "actualidad"], // Ejemplos de categorías
    default: "general",
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  tags: [String], // Array de strings para etiquetas
  image: String, // URL de la imagen principal de la novedad
});

// Puedes añadir un pre-save hook para generar el slug automáticamente
blogSchema.pre("save", function (next) {
  if (this.isModified("title") && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  }
  next();
});

const Blog = models.Blog || model("Blog", blogSchema);

export { Blog };
