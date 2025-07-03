// src/components/BlogListTable.jsx (o en un archivo src/lib/icons.js)
import {
  FaBlog,
  FaNewspaper,
  FaBalanceScale,
  FaBuilding,
  FaBriefcase,
  FaQuestion,
  FaPaperPlane,
} from "react-icons/fa";
import {
  MdArticle,
  MdCategory,
  MdInfo,
  MdOutlineAccountBalance,
  MdOutlineGavel,
} from "react-icons/md";
// ... importa cualquier otro icono que quieras de otras colecciones (Bs, Ai, etc.)

// Define un objeto o array de iconos que quieres ofrecer
// Usaremos un objeto para mapear un 'nombre amigable' a su componente real
export const ICON_OPTIONS = {
  // Font Awesome (Fa)
  Blog: FaBlog,
  Noticias: FaNewspaper,
  Legal: FaBalanceScale,
  Empresarial: FaBuilding,
  Laboral: FaBriefcase,
  General: FaQuestion,
  // Material Design (Md)
  Artículo: MdArticle,
  Categoría: MdCategory,
  Información: MdInfo,
  Contable: MdOutlineAccountBalance,
  Jurídico: MdOutlineGavel,
  // Otros iconos que quieras añadir
  Avion: FaPaperPlane,
};

// Puedes también tener un array de solo los nombres para el Select
export const ICON_NAMES = Object.keys(ICON_OPTIONS);
