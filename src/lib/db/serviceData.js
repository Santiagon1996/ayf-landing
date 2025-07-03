// src/db/data/servicesData.js

const services = [
  // 1. Asesoría jurídica (Category: "asesoria-juridica")
  {
    name: "Derecho Societario",
    type: "juridico",
    category: "asesoria-juridica",
    shortDescription:
      "Asesoramiento integral en constitución, reformas y gestión de sociedades.",
    fullDescription:
      "Ofrecemos asesoramiento legal especializado en derecho societario, abarcando desde la elección del tipo societario más conveniente, la constitución de nuevas empresas, reformas estatutarias, aumentos de capital, cambios de sede social, hasta la redacción de actas de directorio y asambleas, y el mantenimiento de libros obligatorios. Brindamos también asesoramiento a socios y en la elaboración de pactos de socios para una gobernanza corporativa efectiva.",
    details: [
      "Asesoramiento tipo de sociedad convenido",
      "Constitución de sociedades",
      "Reformas estatutarias, aumentos de capital, cambios de sede, etc.",
      "Redacción de actas y libros obligatorios",
      "Asesoramiento legal para socios, pactos de socios",
    ],
    // Nuevo iconUrl: usando un nombre de ICON_OPTIONS
    iconUrl: "Empresarial", // FaBuilding
  },
  {
    name: "Contratos Comerciales",
    type: "juridico",
    category: "asesoria-juridica",
    shortDescription:
      "Redacción, análisis y revisión de contratos para sus operaciones comerciales.",
    fullDescription:
      "Expertos en la redacción, análisis y revisión de una amplia gama de contratos comerciales, incluyendo contratos de prestación de servicios, locación, distribución, colaboración empresarial, acuerdos de confidencialidad (NDA), y otros instrumentos legales necesarios para la operación segura de su negocio. Nos aseguramos de que sus acuerdos sean sólidos y protejan sus intereses.",
    details: [
      "Redacción de contratos comerciales (prestación de servicios, locación, distribución, colaboración, confidencialidad, etc.)",
      "Análisis y revisión de contratos existentes",
    ],
    // Nuevo iconUrl: usando un nombre de ICON_OPTIONS
    iconUrl: "Legal", // FaBalanceScale (quizás el más cercano disponible)
  },
  {
    name: "Derecho Laboral",
    type: "juridico",
    category: "asesoria-juridica",
    shortDescription:
      "Asesoramiento en contratos laborales, desvinculación y acuerdos con terceros.",
    fullDescription:
      "Brindamos asesoramiento integral en derecho laboral, incluyendo la redacción de contratos laborales, acuerdos de desvinculación de personal y la elaboración de contratos con proveedores, franquicias y licencias. Nuestro objetivo es garantizar el cumplimiento de la normativa laboral vigente y proteger tanto los derechos del empleador como los del empleado.",
    details: [
      "Contratos laborales y acuerdos de desvinculación",
      "Contratos con proveedores, franquicias, licencias",
    ],
    // Nuevo iconUrl: usando un nombre de ICON_OPTIONS
    iconUrl: "Laboral", // FaBriefcase
  },
  {
    name: "Derecho Digital",
    type: "juridico",
    category: "asesoria-juridica",
    shortDescription:
      "Protección de activos digitales, datos personales y contratos electrónicos.",
    fullDescription:
      "Especialistas en derecho digital, ofreciendo servicios en la protección de marcas y patentes en el ámbito digital, la elaboración y revisión de contratos electrónicos, la validez de la firma digital, el manejo de prueba electrónica en litigios y el cumplimiento de la normativa de protección de datos personales. Adaptamos su negocio al entorno digital con seguridad jurídica.",
    details: [
      "Marcas y patentes",
      "Contratos electrónicos y firma digital",
      "Prueba electrónica",
      "Protección de datos personales",
    ],
    // Nuevo iconUrl: usando un nombre de ICON_OPTIONS
    iconUrl: "Información", // MdInfo (el más cercano disponible para "Digital")
  },
  {
    name: "Derecho Laboral Empresarial",
    type: "juridico",
    category: "asesoria-juridica",
    shortDescription:
      "Gestión de personal, auditorías y defensa ante organismos laborales.",
    fullDescription:
      "Asesoramiento completo en la gestión de personal, desde altas y bajas, hasta auditorías laborales preventivas para asegurar el cumplimiento normativo. Brindamos asistencia en conflictos individuales o colectivos y representamos a su empresa en defensa ante intimaciones de AFIP, Ministerio de Trabajo o sindicatos, buscando soluciones eficaces y minimizando riesgos.",
    details: [
      "Altas y bajas de personal",
      "Auditorías laborales preventivas",
      "Asistencia en conflictos individuales o colectivos",
      "Defensa ante intimaciones de AFIP / Ministerio / sindicatos",
    ],
    // Nuevo iconUrl: usando un nombre de ICON_OPTIONS
    iconUrl: "Laboral", // FaBriefcase (reutilizado)
  },
  {
    name: "Cumplimiento Normativo (Compliance)",
    type: "juridico",
    category: "asesoria-juridica",
    shortDescription:
      "Asesoramiento básico en las obligaciones legales mínimas para su negocio.",
    fullDescription:
      "Ofrecemos un asesoramiento básico en compliance para asegurar que su empresa cumpla con las obligaciones legales mínimas requeridas. Identificamos los riesgos normativos más relevantes y le guiamos en la implementación de las políticas y procedimientos esenciales para evitar sanciones y fortalecer la ética empresarial.",
    details: [
      "Asesoramiento básico en compliance (obligaciones legales mínimas)",
    ],
    // Nuevo iconUrl: usando un nombre de ICON_OPTIONS
    iconUrl: "Jurídico", // MdOutlineGavel (el más cercano disponible)
  },
  {
    name: "Representación y Reclamos Legales",
    type: "juridico",
    category: "asesoria-juridica",
    shortDescription:
      "Gestión de comunicaciones legales, acuerdos y mediaciones prejudiciales.",
    fullDescription:
      "Representamos a nuestros clientes en la gestión de comunicaciones legales, incluyendo la redacción y envío de cartas documento, intimaciones, y la negociación de acuerdos extrajudiciales. Además, brindamos representación y asistencia en mediaciones prejudiciales, buscando resolver conflictos de manera eficiente y evitar procesos judiciales prolongados.",
    details: [
      "Cartas documento, intimaciones, acuerdos extrajudiciales",
      "Representación en mediaciones prejudiciales",
    ],
    // Nuevo iconUrl: usando un nombre de ICON_OPTIONS
    iconUrl: "Legal", // FaBalanceScale (reutilizado)
  },
  // 2. Área contable y fiscal (Category: "area-contable-fiscal")
  {
    name: "Fiscal e Impositivo",
    type: "contable",
    category: "area-contable-fiscal",
    shortDescription:
      "Gestión integral de impuestos, inscripciones y atención de inspecciones fiscales.",
    fullDescription:
      "Servicios completos en materia fiscal e impositiva: inscripciones en Impuestos Nacionales, provinciales y municipales, habilitaciones de locales comerciales, análisis y optimización del encuadre tributario (Monotributo, Responsable Inscripto), liquidación mensual de impuestos, presentación de declaraciones juradas, y atención de inspecciones o requerimientos de organismos fiscales. Buscamos maximizar su eficiencia fiscal.",
    details: [
      "Inscripciones en Impuestos Nacionales, provinciales, y municipales",
      "Habilitaciones de locales comerciales",
      "Análisis y optimización del encuadre tributario (monotributo, RI)",
      "Liquidación mensual de impuestos y presentación de declaraciones juradas",
      "Atención de inspecciones o requerimientos fiscales",
    ],
    // Nuevo iconUrl: usando un nombre de ICON_OPTIONS
    iconUrl: "Contable", // MdOutlineAccountBalance (el más cercano disponible para fiscal)
  },
  {
    name: "Contabilidad General",
    type: "contable",
    category: "area-contable-fiscal",
    shortDescription:
      "Diseño contable, registros, balances y análisis de rentabilidad.",
    fullDescription:
      "Organizamos la contabilidad de su empresa desde el diseño del plan de cuentas, registrando todas las operaciones y emitiendo reportes contables. Realizamos el armado de balances anuales conforme a la normativa vigente y proporcionamos informes de gestión detallados, incluyendo análisis de rentabilidad para una toma de decisiones informada.",
    details: [
      "Diseño de plan de cuentas",
      "Registraciones contables, emisión de reportes",
      "Armado de balances anuales",
      "Informes de gestión y análisis de rentabilidad",
    ],
    // Nuevo iconUrl: usando un nombre de ICON_OPTIONS
    iconUrl: "Contable", // MdOutlineAccountBalance
  },
  {
    name: "Liquidación de Sueldos y Cargas Sociales",
    type: "contable",
    category: "area-contable-fiscal",
    shortDescription:
      "Liquidación de haberes, cargas sociales y confección de documentación laboral.",
    fullDescription:
      "Nos encargamos de la liquidación precisa de sueldos y cargas sociales de su personal, garantizando el cumplimiento de la normativa laboral y previsional. Realizamos la confección de recibos de sueldo y toda la documentación laboral requerida, liberándolo de una tarea compleja y sujeta a constantes cambios normativos.",
    details: [
      "Liquidación de sueldos y cargas sociales",
      "Confección de recibos y documentación laboral",
    ],
    // Nuevo iconUrl: usando un nombre de ICON_OPTIONS
    iconUrl: "Laboral", // FaBriefcase (reutilizado, el más cercano a sueldos/cargas)
  },
  // 3. Área financiera (Category: "area-financiera")
  {
    name: "Asesoría Financiera",
    type: "contable",
    category: "area-financiera",
    shortDescription:
      "Análisis de flujo de fondos, estructura de costos y planificación de inversiones.",
    fullDescription:
      "Proveemos asesoría financiera para optimizar la gestión de recursos de su empresa. Realizamos análisis de flujo de fondos, estructuración detallada de costos y precios para maximizar la rentabilidad, y planificación de cartera de inversiones para asegurar el crecimiento y la solidez financiera de su negocio.",
    details: [
      "Análisis de flujo de fondos",
      "Estructuración de costos y precios",
      "Planificación de cartera de inversiones",
    ],
    // Nuevo iconUrl: usando un nombre de ICON_OPTIONS
    iconUrl: "Contable", // MdOutlineAccountBalance (el más cercano para finanzas en tu lista)
  },
  {
    name: "Detección de Riesgos",
    type: "juridico",
    category: "area-financiera",
    shortDescription:
      "Identificación de riesgos contractuales y legales en sus operaciones diarias.",
    fullDescription:
      "Nuestro servicio se centra en la detección proactiva de riesgos contractuales o legales inherentes a las operaciones comerciales y financieras comunes. Analizamos sus procesos y contratos para identificar posibles vulnerabilidades y le brindamos recomendaciones para mitigar estos riesgos, protegiendo así los activos y la continuidad de su negocio.",
    details: [
      "Detección de riesgos contractuales o legales en operaciones comunes",
    ],
    // Nuevo iconUrl: usando un nombre de ICON_OPTIONS
    iconUrl: "Legal", // FaBalanceScale (reutilizado)
  },
  // 4. Servicios complementarios (Category: "servicios-complementarios")
  {
    name: "Certificaciones de Ingresos",
    type: "contable",
    category: "servicios-complementarios",
    shortDescription:
      "Emisión de certificaciones de ingresos para diversos trámites.",
    fullDescription:
      "Emitimos certificaciones de ingresos avaladas por profesionales matriculados, necesarias para la tramitación de créditos, alquileres, visas, o cualquier otro requerimiento que exija la demostración formal de sus ingresos. Nuestro servicio garantiza la validez y confiabilidad de la documentación presentada.",
    details: [],
    // Nuevo iconUrl: usando un nombre de ICON_OPTIONS
    iconUrl: "Contable", // MdOutlineAccountBalance (el más cercano para certificaciones)
  },
  {
    name: "Armado de Balances",
    type: "contable",
    category: "servicios-complementarios",
    shortDescription: "Preparación y presentación de balances anuales.",
    fullDescription:
      "Nos encargamos de la preparación y presentación de los balances anuales de su empresa, cumpliendo con todas las normativas contables y fiscales vigentes. Este servicio, aunque complementario, es fundamental para la salud financiera y el cumplimiento legal de su organización.",
    details: ["Este servicio tiene un costo aparte."],
    // Nuevo iconUrl: usando un nombre de ICON_OPTIONS
    iconUrl: "Contable", // MdOutlineAccountBalance (el más cercano para balances)
  },
];

export { services };
