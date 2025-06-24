/*CRUD BLOG */
import { createBlogRequest } from "./createBlogRequest.js";
import { deleteBlogRequest } from "./deleteBlogRequest.js";
import { getBlogByIdRequest } from "./getBlogByIdRequest.js";
import { getBlogRequest } from "./getBlogRequest.js";
import { updateBlogRequest } from "./updateBlogRequest.js";
/*CRUD SERVICE */
import { createServiceRequest } from "./createServiceRequest.js";
import { deleteServiceRequest } from "./deleteServiceRequest.js";
import { getServiceByIdRequest } from "./getServiceByIdRequest.js";
import { getServiceRequest } from "./getServiceRequest.js";
import { updateServiceRequest } from "./updateServiceRequest.js";
/* USER Register && Login */
import { registerUserRequest } from "./registerUserRequest.js";
import { loginUserRequest } from "./loginUserRequest.js";
//import { logoutUserRequest } from "./logoutUserRequest.js";

export {
  createBlogRequest,
  deleteBlogRequest,
  getBlogByIdRequest,
  getBlogRequest,
  updateBlogRequest,
  createServiceRequest,
  deleteServiceRequest,
  getServiceByIdRequest,
  getServiceRequest,
  updateServiceRequest,
  registerUserRequest,
  loginUserRequest,
  // logoutUserRequest,
};
