import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { constant } from "shared";

const { EMAIL_REGEX, NAME_REGEX, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } =
  constant;

const { Schema, model, models } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      lowercase: true,
      match: [NAME_REGEX, "Por favor, usa un formato de nombre válido"],
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [EMAIL_REGEX, "Por favor, usa un formato de email válido"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [
        PASSWORD_MIN_LENGTH,
        "La contraseña debe tener al menos 8 caracteres",
      ],
      maxlength: [
        PASSWORD_MAX_LENGTH,
        "La contraseña no puede tener más de 20 caracteres",
      ],
      select: false, // No devolver la contraseña por defecto en las consultas
    },
    role: {
      type: String,
      enum: ["admin", "editor", "viewer"],
      default: "admin", // Siempre será "admin"
    },
  },
  { versionKey: false, timestamps: true } // Añade createdAt y updatedAt automáticamente y desactiva __v
);

// Middleware para encriptar la contraseña antes de guardar
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
// Middleware para actualizar la fecha de actualización
userSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});
// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = models.User || model("User", userSchema);
export { User };
