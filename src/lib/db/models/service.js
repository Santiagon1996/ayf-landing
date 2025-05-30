import mongoose from "mongoose";

const { Schema, model, models } = mongoose;
// Blog schema definition
const serviceSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del servicio es obligatorio"],
      trim: true,
      unique: true, // Asegura que no haya dos servicios con el mismo nombre exacto
    },
    slug: {
      // Para URLs amigables (ej. /servicios/derecho-societario)
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Campo para diferenciar el tipo principal: jurídico o contable
    // Esto lo usarás para el filtro principal de navegación (ej. /servicios/juridicos)
    type: {
      type: String,
      enum: ["juridico", "contable"], // Tipos principales de servicio
      required: [
        true,
        "El tipo de servicio (jurídico/contable) es obligatorio",
      ],
    },
    // Campo para la categoría/área más general (ej. Asesoría Jurídica, Área Financiera)
    // Esto puede ayudar a agrupar servicios relacionados en el frontend
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
    description: {
      type: String,
      required: [true, "La descripción breve del servicio es obligatoria"],
    },
    // Sub-servicios o puntos clave que abarca este servicio
    // Puedes listar aquí los detalles específicos (ej. "Asesoramiento tipo de sociedad", "Redacción de actas")
    details: [String], // Array de strings para listar los detalles/alcances específicos

    image: String, // URL de la imagen principal del servicio (opcional)
    priceInfo: String, // Información sobre precios, si aplica (ej. "Costo aparte", "Presupuesto personalizado")
  },
  { versionKey: false, timestamps: true }
);

// Middleware para generar el slug automáticamente a partir del nombre
serviceSchema.pre("save", function (next) {
  if (this.isModified("name") && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/ /g, "-") // Reemplaza espacios por guiones
      .replace(/[^\w-]+/g, ""); // Elimina caracteres no alfanuméricos (excepto guiones)
  }
  next();
});

// Middleware para actualizar la fecha de actualización para findOneAndUpdate
serviceSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

const Service = models.Service || model("Service", serviceSchema);
export { Service };
