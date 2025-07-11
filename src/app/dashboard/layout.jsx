"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Importa los componentes de Shadcn UI
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/atoms/LogoutButton";
import { Menu } from "lucide-react";
import { Toaster } from "sonner";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Visión General", href: "/dashboard" },
    { name: "Servicios", href: "/dashboard/service" },
    { name: "Blogs", href: "/dashboard/blogs" },
  ];

  const SidebarNav = ({ isMobile = false, closeSheet }) => (
    <nav className={cn("flex flex-col", isMobile ? "px-2 pt-4" : "mt-6")}>
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:text-gray-900 dark:text-gray-50 dark:hover:text-gray-50",
                "bg-gray-100 dark:bg-gray-800", // Clases por defecto para fondo claro/oscuro
                {
                  "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-50":
                    pathname === item.href, // Resaltado para activo
                  "hover:bg-gray-200 dark:hover:bg-gray-700":
                    pathname !== item.href, // Hover para inactivo
                }
              )}
              onClick={isMobile ? closeSheet : undefined} // Cierra el Sheet al hacer clic en móvil
            >
              {/* Aquí podrías poner un icono para cada item, por ejemplo:
              {item.name === "Visión General" && <Home className="h-4 w-4" />}
              {item.name === "Servicios" && <Briefcase className="h-4 w-4" />}
              {item.name === "Blogs" && <FileText className="h-4 w-4" />}
              */}
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar fijo para pantallas grandes */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-blue-600 text-lg"
            >
              {/* <Package2 className="h-6 w-6" /> */}{" "}
              {/* Aquí iría un icono de tu logo */}
              <span>AdminPanel</span>
            </Link>
          </div>
          <div className="flex-1">
            <SidebarNav />
          </div>
        </div>
      </div>

      {/* Contenido Principal + Header + Sidebar móvil */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          {/* Botón para abrir el sidebar en móvil */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold text-blue-600"
              >
                {/* <Package2 className="h-6 w-6" /> */}
                <span>Admin/Panel</span>
              </Link>
              <SidebarNav
                isMobile={true}
                closeSheet={() => {
                  /* Lógica para cerrar el Sheet */
                }}
              />
              {/* Puedes añadir más elementos específicos para el sidebar móvil aquí */}
            </SheetContent>
          </Sheet>

          <h1 className="text-xl font-semibold text-gray-800 ml-4 hidden md:block">
            {navItems.find((item) => pathname.startsWith(item.href))?.name ||
              "Dashboard"}
          </h1>

          <div className="w-full flex-1">
            {/* Aquí puedes tener un Search o cualquier otro elemento en el header */}
          </div>

          {/* Menú de usuario/admin en el header */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/AyF-Logo.png" alt="User Avatar" />
                  <AvatarFallback>AD</AvatarFallback>{" "}
                  {/* Iniciales del admin */}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogoutButton />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Área donde se renderizarán las páginas anidadas */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
