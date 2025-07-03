// Donde quieras mostrar el icono (ej: en la tabla o en la página de detalle del blog)
import { ICON_OPTIONS } from "@/lib/icons"; // Asegúrate de que esta ruta sea correcta

// ... dentro de tu componente funcional
const BlogIcon = ({ iconName }) => {
  const IconComponent = ICON_OPTIONS[iconName];
  return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
};

// ... y luego en tu JSX
<TableCell>
  <BlogIcon iconName={blog.iconUrl} />
</TableCell>;
