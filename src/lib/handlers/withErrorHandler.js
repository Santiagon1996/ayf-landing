import { errorHandler } from "./errorHandler.js";

export const withErrorHandler = (callback) => {
  return async (req, params) => {
    try {
      return await callback(req, params);
    } catch (error) {
      return errorHandler(error);
    }
  };
};
