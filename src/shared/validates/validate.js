import { constant } from "../constants/constants.js";
import { ValidateError } from "../errors/errors.js";

export const validate = {
  string(string, explain = "string") {
    if (typeof string !== "string")
      throw new ValidateError(`Invalid ${explain} ${string}`);
  },
  number(number, options = {}, explain = "number") {
    if (typeof number !== "number" || isNaN(number))
      throw new ValidateError(`Invalid ${explain}: ${number}`);
    if (options.min !== undefined && number < options.min)
      throw new ValidateError(
        `Invalid ${explain} (minimum ${options.min}): ${number}`
      );
    if (options.max !== undefined && number > options.max)
      throw new ValidateError(
        `Invalid ${explain} (maximum ${options.max}): ${number}`
      );
  },

  text(text, options = {}, explain = "text") {
    this.string(text, explain);
    if (constant.EMPTY_OR_BLANK_REGEX.test(text))
      throw new ValidateError(`Invalid ${explain}: ${text}`);
    if (options.minLength !== undefined && text.length < options.minLength)
      throw new ValidateError(
        `Invalid ${explain} (minimum length ${options.minLength}): ${text}`
      );
    if (options.maxLength !== undefined && text.length > options.maxLength)
      throw new ValidateError(
        `Invalid ${explain} (maximum length ${options.maxLength}): ${text}`
      );
    if (options.allowedValues && !options.allowedValues.includes(text))
      throw new ValidateError(
        `Invalid ${explain} (allowed values: ${options.allowedValues.join(
          ", "
        )}): ${text}`
      );
  },
  maxLength(value, maxLength, explain) {
    if (value && value.length > maxLength)
      // Añadida verificación de null/undefined
      throw new ValidateError(
        `Invalid ${explain} (maximum length ${maxLength}): ${value}`
      );
  },
  minLength(value, minLength, explain) {
    if (value && value.length < minLength)
      // Añadida verificación de null/undefined
      throw new ValidateError(
        `Invalid ${explain} (minimum length ${minLength}): ${value}`
      );
  },
  name(value, explain = "name") {
    this.text(value, { minLength: 3, maxLength: 50 }, explain);
    if (!constant.NAME_REGEX.test(value))
      throw new ValidateError(`Invalid ${explain}: ${value}`);
  },
  username(username, explain = "username") {
    this.text(username, explain), this.minLength(username, 3, explain);
    this.maxLength(username, 20, explain);
  },
  password(password, explain = "password") {
    this.text(password, explain), this.minLength(password, 5, explain);
    this.maxLength(password, 20, explain);
  },
  email(email, explain = "email") {
    this.string(email, explain);
    if (!constant.EMAIL_REGEX.test(email))
      throw new ValidateError(`Invalid ${explain} ${email}`);
    this.maxLength(email, 30, explain);
  },
  url(value, fieldName) {
    const urlRegex = /^https?:\/\/[^\s$.?#].[^\s]*$/;
    if (Array.isArray(value)) {
      value.forEach((url) => {
        this.string(url, `URL in ${fieldName}`);
        if (!urlRegex.test(url)) {
          throw new ValidateError(`Invalid URL in ${fieldName}: ${url}`);
        }
      });
    } else {
      this.string(value, `URL in ${fieldName}`);
      if (!urlRegex.test(value)) {
        throw new ValidateError(`Invalid URL in ${fieldName}: ${value}`);
      }
    }
  },
  id(id, explain = "id") {
    this.text(id, { minLength: 1, maxLength: 25 }, explain); // Asegurando que no esté vacío
  },
};
