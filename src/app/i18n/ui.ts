import type { Lang } from '../core/content.types';

/** Every string in the chrome. Lesson prose lives in content/, not here. */
export interface UiStrings {
  siteName: string;
  tagline: string;
  htmlTitleSuffix: string;
  nav: {
    curriculum: string;
    about: string;
    skipToContent: string;
    menu: string;
  };
  home: {
    eyebrow: string;
    heading: string;
    lede: string;
    startCta: string;
    curriculumCta: string;
    freeHeading: string;
    freeBody: string;
    pathHeading: string;
    pathLede: string;
    lessonsReady: string;
    beingWritten: string;
    principleHeading: string;
    principles: { title: string; body: string }[];
  };
  module: {
    label: string;
    lessons: string;
    noLessonsYet: string;
    noLessonsBody: string;
    backToCurriculum: string;
  };
  lesson: {
    minutes: string;
    previous: string;
    next: string;
    inModule: string;
    backToModule: string;
    onThisPage: string;
    interactive: string;
  };
  callout: Record<'note' | 'warning' | 'key' | 'safety', string>;
  widget: {
    reset: string;
    unavailable: string;
    total: string;
    current: string;
    voltage: string;
    resistance: string;
    power: string;
    solveFor: string;
    add: string;
    remove: string;
    series: string;
    parallel: string;
    supply: string;
    branch: string;
    equivalent: string;
    arrangement: string;
    load: string;
    noLoad: string;
    /** R2 ∥ RL in words, for the loaded divider's spoken formula. */
    r2ParallelLoad: string;
    output: string;
    idealOutput: string;
    error: string;
    outputImpedance: string;
    drawnCurrent: string;
    wasted: string;
    exactValue: string;
    /** Kirchhoff instrument. The formulas themselves are built in the widget. */
    kirchhoffSpoken: string;
    kirchhoffCircuit: string;
    nodeVoltage: string;
    /** Direction words, composed as "<from> V1 <to> A". */
    from: string;
    to: string;
    ground: string;
    noCurrent: string;
    delivering: string;
    absorbing: string;
    noPower: string;
    kcl: string;
    kvlLeft: string;
    kvlRight: string;
    currentIn: string;
    currentOut: string;
    signConvention: string;
  };
  theme: { toggle: string; light: string; dark: string };
  langSwitch: { label: string; other: string };
  notFound: { heading: string; body: string; cta: string };
  footer: { built: string; source: string; license: string; free: string };
}

const en: UiStrings = {
  siteName: 'Workbench',
  tagline: 'Interactive electronics, from Ohm’s law to the gerbers',
  htmlTitleSuffix: 'Workbench',
  nav: {
    curriculum: 'Curriculum',
    about: 'About',
    skipToContent: 'Skip to content',
    menu: 'Menu',
  },
  home: {
    eyebrow: 'Interactive electronics course',
    heading: 'Every idea comes with a control you can move.',
    lede: 'A full course in electronics — from what voltage actually is, through op-amps and motor drivers, to a board you can send to a fab. Nothing is explained in words alone: each concept ships with an instrument you drag, and a consequence you see or hear at the same instant.',
    startCta: 'Start with Ohm’s law',
    curriculumCta: 'See the whole path',
    freeHeading: 'All of it, free, forever.',
    freeBody:
      'Most sites teach you the basics and put the part you actually needed behind a paywall. There is no paid tier here and there is not going to be one. The PCB module — trace width, return paths, impedance, the files a fab needs — is the hardest thing to find written well, and it is on the same open page as the first lesson.',
    pathHeading: 'The path',
    pathLede:
      'Twelve modules in a strict order: each one uses what the last one built. The numbering is dependency, not decoration.',
    lessonsReady: 'lessons ready',
    beingWritten: 'being written',
    principleHeading: 'How this is built',
    principles: [
      {
        title: 'Instruments, not illustrations',
        body: 'An oscilloscope, a Bode plot, a logic analyser, a trace-width calculator. Real tools you operate, drawn live from the numbers you set — not screenshots of somebody else’s bench.',
      },
      {
        title: 'Schematics you can interrogate',
        body: 'Every circuit is drawn as vector symbols, not a flat image. The text highlights the part it is talking about, current animates along the wires, and the values update as you change them.',
      },
      {
        title: 'Written for someone who can already code',
        body: 'You are not afraid of a formula or a slider, so the pace assumes that. What it does not assume is that you know what a return path is, or why your divider sags.',
      },
    ],
  },
  module: {
    label: 'Module',
    lessons: 'Lessons',
    noLessonsYet: 'Being written',
    noLessonsBody:
      'This module is planned and scoped but its lessons are not published yet. The modules ahead of it are, and they come first for a reason.',
    backToCurriculum: 'All modules',
  },
  lesson: {
    minutes: 'min',
    previous: 'Previous',
    next: 'Next',
    inModule: 'in',
    backToModule: 'Back to module',
    onThisPage: 'On this page',
    interactive: 'Interactive',
  },
  callout: {
    note: 'Note',
    warning: 'Watch out',
    key: 'Key idea',
    safety: 'Safety',
  },
  widget: {
    reset: 'Reset',
    unavailable: 'This instrument failed to load.',
    total: 'Total',
    current: 'Current',
    voltage: 'Voltage',
    resistance: 'Resistance',
    power: 'Power',
    solveFor: 'Solve for',
    add: 'Add resistor',
    remove: 'Remove',
    series: 'Series',
    parallel: 'Parallel',
    supply: 'Supply',
    branch: 'Branch',
    equivalent: 'Equivalent resistance',
    arrangement: 'Arrangement',
    load: 'Load',
    noLoad: 'None',
    r2ParallelLoad: 'R2 in parallel with RL',
    output: 'Output',
    idealOutput: 'Unloaded',
    error: 'Error',
    outputImpedance: 'Output impedance',
    drawnCurrent: 'Load current',
    wasted: 'Wasted in the divider',
    exactValue: 'exact value',
    kirchhoffSpoken:
      'Currents into a node add up to zero, and voltages around a loop add up to zero',
    kirchhoffCircuit:
      'V1 through R1 and V2 through R3 both feed node A, and R2 runs from A to ground.',
    nodeVoltage: 'Voltage at A',
    from: 'from',
    to: 'to',
    ground: 'ground',
    noCurrent: 'no current',
    delivering: 'delivering',
    absorbing: 'absorbing (being charged)',
    noPower: 'neither (no power)',
    kcl: 'KCL at A',
    kvlLeft: 'KVL left loop',
    kvlRight: 'KVL right loop',
    currentIn: 'in',
    currentOut: 'out',
    signConvention:
      'Signs: I1 and I3 count positive flowing into A, I2 flowing from A to ground. Power counts positive when current leaves a source by its + terminal (delivering) and negative when current is forced in there (absorbing). The arrows show the real direction.',
  },
  theme: { toggle: 'Switch theme', light: 'Light', dark: 'Dark' },
  langSwitch: { label: 'Language', other: 'Español' },
  notFound: {
    heading: 'Open circuit',
    body: 'There is no page at this address. The connection goes nowhere.',
    cta: 'Back to the curriculum',
  },
  footer: {
    built: 'Built on a home server in Alberta.',
    source: 'Source on GitHub',
    license: 'Code MIT · Content CC BY-SA 4.0',
    free: 'Free and open — no accounts, no paid tier, no tracking.',
  },
};

const es: UiStrings = {
  siteName: 'Banco de Trabajo',
  tagline: 'Electrónica interactiva, de la ley de Ohm a los gerbers',
  htmlTitleSuffix: 'Banco de Trabajo',
  nav: {
    curriculum: 'Temario',
    about: 'Acerca de',
    skipToContent: 'Ir al contenido',
    menu: 'Menú',
  },
  home: {
    eyebrow: 'Curso interactivo de electrónica',
    heading: 'Cada idea trae un control que puedes mover.',
    lede: 'Un curso completo de electrónica: desde qué es realmente la tensión, pasando por amplificadores operacionales y controladores de motores, hasta una placa que puedes mandar a fabricar. Nada se explica solo con palabras: cada concepto lleva un instrumento que arrastras y una consecuencia que ves u oyes en el mismo instante.',
    startCta: 'Empezar por la ley de Ohm',
    curriculumCta: 'Ver la ruta completa',
    freeHeading: 'Todo, gratis, siempre.',
    freeBody:
      'Casi todos los sitios te enseñan lo básico y dejan detrás de un muro de pago justo la parte que necesitabas. Aquí no hay plan de pago y no lo va a haber. El módulo de PCB —ancho de pista, caminos de retorno, impedancia, los archivos que pide un fabricante— es lo más difícil de encontrar bien escrito, y está en la misma página abierta que la primera lección.',
    pathHeading: 'La ruta',
    pathLede:
      'Doce módulos en orden estricto: cada uno usa lo que construyó el anterior. La numeración es dependencia, no decoración.',
    lessonsReady: 'lecciones listas',
    beingWritten: 'en preparación',
    principleHeading: 'Cómo está hecho',
    principles: [
      {
        title: 'Instrumentos, no ilustraciones',
        body: 'Un osciloscopio, un diagrama de Bode, un analizador lógico, una calculadora de ancho de pista. Herramientas de verdad que manejas, dibujadas en vivo a partir de los valores que pones, no capturas del banco de otro.',
      },
      {
        title: 'Esquemas que puedes explorar',
        body: 'Cada circuito se dibuja con símbolos vectoriales, no como una imagen plana. El texto resalta la pieza de la que habla, una animación muestra la corriente recorriendo los cables y los valores se actualizan mientras los cambias.',
      },
      {
        title: 'Escrito para quien ya sabe programar',
        body: 'No te asusta una fórmula ni un control deslizante, así que el ritmo lo da por hecho. Lo que no da por hecho es que sepas qué es un camino de retorno, ni por qué baja la salida de tu divisor.',
      },
    ],
  },
  module: {
    label: 'Módulo',
    lessons: 'Lecciones',
    noLessonsYet: 'En preparación',
    noLessonsBody:
      'Este módulo está planificado y acotado, pero sus lecciones todavía no están publicadas. Las de los módulos anteriores sí, y van primero por algo.',
    backToCurriculum: 'Todos los módulos',
  },
  lesson: {
    minutes: 'min',
    previous: 'Anterior',
    next: 'Siguiente',
    inModule: 'en',
    backToModule: 'Volver al módulo',
    onThisPage: 'En esta página',
    interactive: 'Interactivo',
  },
  callout: {
    note: 'Nota',
    warning: 'Cuidado',
    key: 'Idea clave',
    safety: 'Seguridad',
  },
  widget: {
    reset: 'Reiniciar',
    unavailable: 'Este instrumento no se pudo cargar.',
    total: 'Total',
    current: 'Corriente',
    voltage: 'Tensión',
    resistance: 'Resistencia',
    power: 'Potencia',
    solveFor: 'Calcular',
    add: 'Agregar resistor',
    remove: 'Quitar',
    series: 'Serie',
    parallel: 'Paralelo',
    supply: 'Fuente',
    branch: 'Rama',
    equivalent: 'Resistencia equivalente',
    arrangement: 'Conexión',
    load: 'Carga',
    noLoad: 'Ninguna',
    r2ParallelLoad: 'R2 en paralelo con RL',
    output: 'Salida',
    idealOutput: 'En vacío',
    error: 'Error',
    outputImpedance: 'Impedancia de salida',
    drawnCurrent: 'Corriente de carga',
    wasted: 'Desperdiciado en el divisor',
    exactValue: 'valor exacto',
    kirchhoffSpoken:
      'Las corrientes que entran en un nodo suman cero, y las tensiones alrededor de un lazo suman cero',
    kirchhoffCircuit:
      'V1 a través de R1 y V2 a través de R3 alimentan el nodo A, y R2 va de A a tierra.',
    nodeVoltage: 'Tensión en A',
    from: 'de',
    to: 'hacia',
    ground: 'tierra',
    noCurrent: 'sin corriente',
    delivering: 'entregando',
    absorbing: 'absorbiendo (se está cargando)',
    noPower: 'ni entrega ni absorbe',
    kcl: 'LCK en A',
    kvlLeft: 'LVK lazo izquierdo',
    kvlRight: 'LVK lazo derecho',
    currentIn: 'entra',
    currentOut: 'sale',
    signConvention:
      'Signos: I1 e I3 son positivas cuando entran en A, e I2 cuando va de A a tierra. La potencia de una fuente es positiva cuando la corriente sale por su terminal + (entrega) y negativa cuando la corriente se ve obligada a entrar por él (absorbe). Las flechas muestran el sentido real.',
  },
  theme: { toggle: 'Cambiar tema', light: 'Claro', dark: 'Oscuro' },
  langSwitch: { label: 'Idioma', other: 'English' },
  notFound: {
    heading: 'Circuito abierto',
    body: 'No hay ninguna página en esta dirección. La conexión no lleva a ninguna parte.',
    cta: 'Volver al temario',
  },
  footer: {
    built: 'Hecho en un servidor casero en Alberta.',
    source: 'Código en GitHub',
    license: 'Código MIT · Contenido CC BY-SA 4.0',
    free: 'Libre y abierto: sin cuentas, sin plan de pago, sin rastreo.',
  },
};

export const UI: Record<Lang, UiStrings> = { en, es };
