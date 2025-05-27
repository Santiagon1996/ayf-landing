import mongoose from "mongoose";
import { constant } from "shered";

const { Schema, model, models } = mongoose;
// User schema definition
const userSchema = new Schema(
  {
    name: { type: String, required: true, minlength: 3, maxLength: 50 },
    email: { type: String, required: true, unique: true, maxLength: 50 },
    password: { type: String, required: true, minlength: 6, maxLength: 100 },
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: null },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "admin",
    },
  },
  { versionKey: false, timestamps: true }
);

// BLOG schema definition
const blogSchema = new Schema(
  {
    title: { type: String, required: true, minlength: 3, maxLength: 50 },
    description: { type: String, required: true, minlength: 3, maxLength: 500 },
    type: {
      type: String,
      required: true,
      enum: ["accounting", "legal", "news"],
    },
    //   createdAt: { type: Date, default: Date.now },
    //   updatedAt: { type: Date, default: null },
  },
  { versionKey: false, timestamps: true }
);

const User = models.User || model("User", userSchema);
const Blog = models.Blog || model("Blog", blogSchema);

export { User, Blog };
