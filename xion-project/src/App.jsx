import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Upload,
  BadgeCheck,
  RotateCcw,
  Eye,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";

const CANVAS = { width: 1080, height: 1350 };

const proOptions = [
  "CORE RANK",
  "PRO 1",
  "PRO 1 PLUS",
  "PRO 1 FLASH",
  "PRO 2",
  "PRO 3",
];

const rankOptions = [
  "Entrepreneur",
  "Executive Entrepreneur",
  "Senior Entrepreneur",
  "Team Builder",
  "Senior Team Builder",
  "Leader X",
  "Premier Leader",
  "Elite Leader",
  "Diamond",
  "Blue Diamond",
  "Double Blue Diamond",
  "Black Diamond",
  "Double Black Diamond",
  "Ambassador",
  "Global Ambassador",
  "Ambassador X",
];

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const createProTemplate = (recognition) => {
  const isCoreRank = recognition === "CORE RANK";
  const isFlash = recognition === "PRO 1 FLASH";
  const needsRankField = ["PRO 1", "PRO 1 PLUS", "PRO 2", "PRO 3"].includes(recognition);

  return {
    id: `pro-${slugify(recognition)}`,
    name: recognition,
    group: "pros",
    category: "PROs",
    description: `Plantilla oficial para reconocer ${recognition}.`,
    accent: "from-emerald-400 via-teal-400 to-cyan-500",
    badge: "LOGRO XION",
    fixedValues: { reconocimiento: recognition },
    photo: {
      type: "circle",
      x: 540,
      y: 380,
      r: 150,
      imageX: 390,
      imageY: 230,
      imageW: 300,
      imageH: 300,
    },
    fields: [
      { key: "nombre", label: "Nombre completo", placeholder: "Ej: Laura Méndez" },
      ...(isCoreRank
        ? [
            { key: "periodo", label: "Período y año", placeholder: "Ej: Marzo 2026" },
            { key: "pais", label: "País", placeholder: "Ej: Puerto Rico" },
          ]
        : []),
      ...(needsRankField
        ? [
            { key: "rangoVariable", label: "Rango", placeholder: "Selecciona un rango", options: rankOptions },
            { key: "periodo", label: "Período y año", placeholder: "Ej: Marzo 2026" },
          ]
        : []),
      ...(isFlash ? [] : []),
    ],
    textLayout: {
      nombre: { x: 540, y: 635, size: 60, weight: 800 },
      reconocimiento: { x: 540, y: 790, size: 84, weight: 900 },
      rangoVariable: { x: 540, y: 915, size: 34, weight: 700 },
      periodo: { x: isCoreRank ? 280 : 540, y: 1170, size: 30, weight: 600 },
      pais: { x: 800, y: 1170, size: 30, weight: 700 },
    },
  };
};

const createRankTemplate = (rank) => ({
  id: `rank-${slugify(rank)}`,
  name: rank,
  group: "ranks",
  category: "Rangos",
  description: `Plantilla oficial de reconocimiento para ${rank}.`,
  accent: "from-cyan-400 via-sky-400 to-indigo-500",
  badge: "RANK UP",
  fixedValues: { rango: rank },
  photo: {
    type: "rounded",
    x: 120,
    y: 250,
    w: 360,
    h: 480,
    rx: 34,
    imageX: 120,
    imageY: 250,
    imageW: 360,
    imageH: 480,
  },
  fields: [
    { key: "nombre", label: "Nombre completo", placeholder: "Ej: José Rivera" },
    { key: "periodo", label: "Semana y año", placeholder: "Ej: Semana 10 - 2026" },
    { key: "pais", label: "País", placeholder: "Ej: Puerto Rico" },
  ],
  textLayout: {
    nombre: { x: 765, y: 410, size: 66, weight: 800, anchor: "middle" },
    rango: { x: 765, y: 555, size: 108, weight: 900, anchor: "middle" },
    periodo: { x: 625, y: 1085, size: 30, weight: 600 },
    pais: { x: 910, y: 1085, size: 30, weight: 700 },
  },
});

const templates = [
  {
    id: "first-sale",
    name: "Primera Venta",
    group: "general",
    category: "Logros",
    description: "Reconocimiento vertical para celebrar la primera venta de un socio.",
    accent: "from-amber-400 via-yellow-300 to-orange-400",
    badge: "NUEVO LOGRO",
    photo: {
      type: "circle",
      x: 540,
      y: 420,
      r: 170,
      imageX: 370,
      imageY: 250,
      imageW: 340,
      imageH: 340,
    },
    fields: [
      { key: "nombre", label: "Nombre", placeholder: "Ej: María Pérez" },
      { key: "logro", label: "Título del logro", placeholder: "Ej: Primera venta FuXion" },
      { key: "detalle", label: "Detalle corto", placeholder: "Ej: Con acción, enfoque y actitud" },
      { key: "fecha", label: "Fecha", placeholder: "Ej: Marzo 2026" },
      { key: "equipo", label: "Equipo", placeholder: "Equipo XION" },
    ],
    textLayout: {
      nombre: { x: 540, y: 710, size: 64, weight: 800 },
      logro: { x: 540, y: 810, size: 86, weight: 900 },
      detalle: { x: 540, y: 915, size: 34, weight: 500 },
      fecha: { x: 280, y: 1170, size: 30, weight: 600 },
      equipo: { x: 800, y: 1170, size: 30, weight: 700 },
    },
  },
  ...proOptions.map(createProTemplate),
  ...rankOptions.map(createRankTemplate),
];

const templateGroups = [
  { key: "general", title: "Logros generales" },
  { key: "pros", title: "PROs" },
  { key: "ranks", title: "Rangos" },
];

const defaultValues = (template) => ({
  ...Object.fromEntries(template.fields.map((field) => [field.key, ""])),
  ...(template.fixedValues || {}),
});

function wrapText(text, limit = 24) {
  if (!text) return [""];
  const words = String(text).split(" ");
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= limit) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function downloadSVGAsPNG(svgNode, fileName = "reconocimiento-xion.png") {
  if (!svgNode) return;

  const svg = svgNode.querySelector("svg");
  if (!svg) return;

  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", CANVAS.width);
  clone.setAttribute("height", CANVAS.height);

  const svgString = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new window.Image();

  img.onload = () => {
    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = CANVAS.width * scale;
    canvas.height = CANVAS.height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, CANVAS.width, CANVAS.height);
    URL.revokeObjectURL(url);

    const link = document.createElement("a");
    link.download = fileName;
    link.href = canvas.toDataURL("image/png", 1);
    link.click();
  };

  img.src = url;
}

function TemplateArtwork({ template, values, photoUrl }) {
  const fontFamily = "Inter, ui-sans-serif, system-ui, sans-serif";
  const layout = template.textLayout;

  const renderField = (key, fallback) => {
    const config = layout[key];
    if (!config) return null;

    const raw = values[key] || template.fixedValues?.[key] || fallback || "";
    const isLarge = ["logro", "rango", "reconocimiento"].includes(key);
    const lines = wrapText(raw, isLarge ? 16 : 28);
    const startY = config.y - ((lines.length - 1) * config.size * 0.58) / 2;

    return lines.map((line, index) => (
      <text
        key={`${key}-${index}`}
        x={config.x}
        y={startY + index * config.size * 1.18}
        fontSize={config.size}
        fontWeight={config.weight}
        textAnchor={config.anchor || "middle"}
        fill="white"
        style={{ fontFamily, letterSpacing: isLarge ? "-0.04em" : "0" }}
      >
        {line}
      </text>
    ));
  };

  const isRank = template.group === "ranks";
  const isPro = template.group === "pros";
  const isFirstSale = template.id === "first-sale";

  return (
    <svg viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`} className="h-full w-full" role="img" aria-label="Vista previa del reconocimiento">
      <defs>
        <linearGradient id={`bg-${template.id}`} x1="0" y1="0" x2="1" y2="1">
          {isFirstSale && (
            <>
              <stop offset="0%" stopColor="#0A0A0F" />
              <stop offset="55%" stopColor="#23120A" />
              <stop offset="100%" stopColor="#4A250D" />
            </>
          )}
          {isPro && (
            <>
              <stop offset="0%" stopColor="#051413" />
              <stop offset="50%" stopColor="#0C3A36" />
              <stop offset="100%" stopColor="#0E6B69" />
            </>
          )}
          {isRank && (
            <>
              <stop offset="0%" stopColor="#07111F" />
              <stop offset="50%" stopColor="#0B2748" />
              <stop offset="100%" stopColor="#102B72" />
            </>
          )}
        </linearGradient>
        <linearGradient id={`gold-${template.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF0B8" />
          <stop offset="45%" stopColor="#FFD86F" />
          <stop offset="100%" stopColor="#E39A25" />
        </linearGradient>
        <filter id={`shadow-${template.id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="22" stdDeviation="22" floodColor="#000000" floodOpacity="0.35" />
        </filter>
        <clipPath id={`clip-${template.id}`}>
          {template.photo.type === "circle" ? (
            <circle cx={template.photo.x} cy={template.photo.y} r={template.photo.r} />
          ) : (
            <rect x={template.photo.x} y={template.photo.y} width={template.photo.w} height={template.photo.h} rx={template.photo.rx} />
          )}
        </clipPath>
      </defs>

      <rect x="0" y="0" width={CANVAS.width} height={CANVAS.height} fill={`url(#bg-${template.id})`} />
      <circle cx="150" cy="120" r="220" fill="#ffffff10" />
      <circle cx="930" cy="1090" r="240" fill="#ffffff08" />
      <circle cx="980" cy="200" r="180" fill="#ffffff06" />
      <rect x="60" y="60" width="960" height="1230" rx="44" fill="#ffffff08" stroke="#ffffff18" />

      {isRank && (
        <>
          <rect x="90" y="220" width="420" height="540" rx="44" fill="#ffffff0d" stroke="#ffffff20" />
          <rect x="560" y="255" width="410" height="340" rx="36" fill="#ffffff0a" />
          <rect x="565" y="930" width="360" height="190" rx="32" fill="#ffffff0a" />
        </>
      )}

      <g filter={`url(#shadow-${template.id})`}>
        {photoUrl ? (
          <image
            href={photoUrl}
            x={template.photo.imageX}
            y={template.photo.imageY}
            width={template.photo.imageW}
            height={template.photo.imageH}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#clip-${template.id})`}
          />
        ) : (
          <g clipPath={`url(#clip-${template.id})`}>
            <rect
              x={template.photo.imageX}
              y={template.photo.imageY}
              width={template.photo.imageW}
              height={template.photo.imageH}
              fill="#ffffff12"
            />
            <text
              x={template.photo.type === "circle" ? template.photo.x : template.photo.x + template.photo.w / 2}
              y={template.photo.type === "circle" ? template.photo.y + 14 : template.photo.y + template.photo.h / 2 + 14}
              fontSize="32"
              textAnchor="middle"
              fill="#ffffffaa"
              style={{ fontFamily }}
            >
              Subir foto
            </text>
          </g>
        )}
      </g>

      {template.photo.type === "circle" ? (
        <circle cx={template.photo.x} cy={template.photo.y} r={template.photo.r + 14} fill="none" stroke={`url(#gold-${template.id})`} strokeWidth="8" />
      ) : (
        <rect
          x={template.photo.x - 10}
          y={template.photo.y - 10}
          width={template.photo.w + 20}
          height={template.photo.h + 20}
          rx={template.photo.rx + 8}
          fill="none"
          stroke={`url(#gold-${template.id})`}
          strokeWidth="8"
        />
      )}

      <rect x="120" y="95" width="245" height="58" rx="29" fill={`url(#gold-${template.id})`} />
      <text x="242" y="132" fontSize="28" fontWeight="800" textAnchor="middle" fill="#23120A" style={{ fontFamily }}>
        {template.badge}
      </text>

      <text x="540" y="180" fontSize="36" fontWeight="700" textAnchor="middle" fill="#FFFFFFCC" style={{ fontFamily, letterSpacing: "0.18em" }}>
        EQUIPO XION
      </text>

      {isFirstSale && (
        <text x="540" y="255" fontSize="74" fontWeight="900" textAnchor="middle" fill={`url(#gold-${template.id})`} style={{ fontFamily, letterSpacing: "-0.04em" }}>
          RECONOCIMIENTO
        </text>
      )}

      {isPro && (
        <text x="540" y="220" fontSize="42" fontWeight="700" textAnchor="middle" fill="#FFFFFFCC" style={{ fontFamily, letterSpacing: "0.16em" }}>
          RECONOCIMIENTO OPERATIVO
        </text>
      )}

      {isRank && (
        <text x="765" y="315" fontSize="44" fontWeight="700" textAnchor="middle" fill="#FFFFFFCC" style={{ fontFamily, letterSpacing: "0.16em" }}>
          NUEVO ASCENSO
        </text>
      )}

      {renderField("nombre", "Tu Nombre")}
      {renderField("logro", "Tu logro")}
      {renderField("detalle", "Aquí va una línea breve")}
      {renderField("periodo")}
      {renderField("pais")}
      {renderField("rango", "Leader X")}
      {renderField("reconocimiento", "PRO 1")}
      {renderField("rangoVariable")}

      <text x="540" y="1265" fontSize="24" fontWeight="600" textAnchor="middle" fill="#FFFFFF99" style={{ fontFamily, letterSpacing: "0.15em" }}>
        XION INTERNATIONAL
      </text>
    </svg>
  );
}

function TemplatePickerGroup({ group, items, selectedTemplateId, onSelect, isOpen, onToggle }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/45">{group.title}</div>
          <div className="mt-1 text-sm text-white/55">{items.length} opciones</div>
        </div>
        <ChevronDown className={`h-5 w-5 text-white/65 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="border-t border-white/10 px-3 pb-3 pt-3">
          <div className="grid gap-2 sm:gap-3">
            {items.map((template) => {
              const active = template.id === selectedTemplateId;
              return (
                <button
                  key={template.id}
                  onClick={() => onSelect(template.id)}
                  className={`rounded-2xl border p-3 text-left transition sm:p-4 ${
                    active
                      ? "border-white/30 bg-white/10"
                      : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <div className={`mb-2 h-2 rounded-full bg-gradient-to-r ${template.accent}`} />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">{template.category}</div>
                      <div className="mt-1 text-base font-bold leading-tight sm:text-lg">{template.name}</div>
                      <p className="mt-1 hidden text-sm text-white/60 sm:block">{template.description}</p>
                    </div>
                    {active && <Eye className="mt-1 h-5 w-5 shrink-0 text-white/80" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function XionRecognitionBuilder() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0].id);
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) || templates[0],
    [selectedTemplateId]
  );

  const [values, setValues] = useState(defaultValues(selectedTemplate));
  const [photoUrl, setPhotoUrl] = useState("");
  const [fileName, setFileName] = useState("reconocimiento-xion.png");
  const [openGroups, setOpenGroups] = useState({ general: true, pros: false, ranks: false });
  const fileRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    setValues(defaultValues(selectedTemplate));
    setFileName(`xion-${selectedTemplate.id}.png`);
  }, [selectedTemplate]);

  useEffect(() => {
    if (!selectedTemplate?.group) return;
    setOpenGroups((prev) => ({ ...prev, [selectedTemplate.group]: true }));
  }, [selectedTemplate]);

  const onPhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const updateField = (key, nextValue) => {
    setValues((prev) => ({ ...prev, [key]: nextValue }));
  };

  const resetCurrent = () => {
    setValues(defaultValues(selectedTemplate));
    setPhotoUrl("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const downloadPreview = () => {
    downloadSVGAsPNG(svgRef.current, fileName);
  };

  const toggleGroup = (key) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-3 pb-28 pt-4 sm:px-4 sm:py-6 md:px-6 lg:px-8 lg:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-5 sm:mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 sm:px-4 sm:text-sm">
            <BadgeCheck className="h-4 w-4" />
            Constructor de reconocimientos XION
          </div>
          <h1 className="mt-3 text-2xl font-black tracking-tight sm:mt-4 sm:text-3xl md:text-5xl">
            Crea reconocimientos visuales sin tocar diseño.
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-white/70 sm:mt-3 sm:text-base md:text-lg">
            Escoge un reconocimiento, sube una foto, llena los datos y descarga la pieza final con la información colocada exactamente donde corresponde.
          </p>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)] xl:gap-6">
          <section className="order-2 rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/20 backdrop-blur sm:p-5 lg:order-1">
            <div className="mb-4 sm:mb-5">
              <h2 className="text-lg font-bold sm:text-xl">1. Escoge un reconocimiento</h2>
              <p className="mt-1 text-xs text-white/60 sm:text-sm">
                Los PROs están agrupados, los rangos están agrupados y cada opción jala su propia plantilla base.
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {templateGroups.map((group) => {
                const groupTemplates = templates.filter((template) => template.group === group.key);
                if (!groupTemplates.length) return null;

                return (
                  <TemplatePickerGroup
                    key={group.key}
                    group={group}
                    items={groupTemplates}
                    selectedTemplateId={selectedTemplateId}
                    onSelect={setSelectedTemplateId}
                    isOpen={!!openGroups[group.key]}
                    onToggle={() => toggleGroup(group.key)}
                  />
                );
              })}
            </div>

            <div className="mt-6 border-t border-white/10 pt-5 sm:mt-8 sm:pt-6">
              <h2 className="text-lg font-bold sm:text-xl">2. Sube la foto</h2>
              <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/20 px-4 py-6 text-center transition hover:border-white/35 hover:bg-white/5 sm:py-8">
                <Upload className="mb-3 h-7 w-7 text-white/70 sm:h-8 sm:w-8" />
                <div className="text-sm font-semibold sm:text-base">Selecciona una imagen</div>
                <div className="mt-1 text-xs text-white/55 sm:text-sm">JPG, PNG o WEBP. Mejor si viene bien iluminada y centrada.</div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
              </label>
            </div>

            <div className="mt-6 border-t border-white/10 pt-5 sm:mt-8 sm:pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold sm:text-xl">3. Completa los datos</h2>
                  <p className="mt-1 text-xs text-white/60 sm:text-sm">Los campos cambian según el reconocimiento elegido.</p>
                </div>
                <button
                  onClick={resetCurrent}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white/80 transition hover:bg-white/5"
                >
                  <RotateCcw className="h-4 w-4" />
                  Limpiar
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {selectedTemplate.fields.map((field) => (
                  <div key={field.key}>
                    <label className="mb-2 block text-sm font-medium text-white/85">{field.label}</label>
                    {field.options ? (
                      <select
                        value={values[field.key] || ""}
                        onChange={(event) => updateField(field.key, event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-base text-white outline-none transition focus:border-white/30 focus:bg-black/10"
                      >
                        <option value="" className="bg-neutral-900 text-white/50">
                          {field.placeholder}
                        </option>
                        {field.options.map((option) => (
                          <option key={option} value={option} className="bg-neutral-900 text-white">
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={values[field.key] || ""}
                        onChange={(event) => updateField(field.key, event.target.value)}
                        placeholder={field.placeholder}
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-base text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-black/10"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-white/85">Nombre del archivo</label>
                <input
                  value={fileName}
                  onChange={(event) => setFileName(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-base text-white outline-none transition focus:border-white/30 focus:bg-black/10"
                />
              </div>
            </div>
          </section>

          <section className="order-1 rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/20 backdrop-blur sm:p-5 lg:order-2 lg:sticky lg:top-4 lg:self-start">
            <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold sm:text-xl">4. Vista previa</h2>
                <p className="mt-1 text-xs text-white/60 sm:text-sm">Lo que ves aquí es lo que se descarga.</p>
              </div>
              <button
                onClick={downloadPreview}
                className="hidden items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-black transition hover:scale-[1.01] hover:bg-white/90 sm:inline-flex"
              >
                <Download className="h-5 w-5" />
                Descargar PNG
              </button>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/30 p-2 sm:rounded-[28px] sm:p-3 md:p-5">
              <div className="mx-auto aspect-[4/5] w-full max-w-[760px] overflow-hidden rounded-[22px] bg-black shadow-2xl shadow-black/30 sm:rounded-[28px]">
                <div className="h-full w-full" ref={svgRef}>
                  <TemplateArtwork template={selectedTemplate} values={values} photoUrl={photoUrl} />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:hidden">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Seleccionado</div>
              <div className="mt-1 text-base font-bold">{selectedTemplate.name}</div>
              <p className="mt-1 text-sm text-white/60">{selectedTemplate.category}</p>
            </div>

            <div className="mt-5 hidden gap-3 md:grid md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                  <ImageIcon className="h-4 w-4" />
                  Foto
                </div>
                <p className="mt-2 text-sm text-white/55">La imagen se recorta automáticamente según el marco de cada plantilla.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-semibold text-white/80">Campos variables</div>
                <p className="mt-2 text-sm text-white/55">Cada plantilla controla qué datos se piden y dónde se colocan.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-semibold text-white/80">Descarga final</div>
                <p className="mt-2 text-sm text-white/55">Se exporta como PNG listo para WhatsApp, Instagram o archivo interno.</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-neutral-950/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
            <div className="truncate text-[11px] uppercase tracking-[0.18em] text-white/45">Plantilla activa</div>
            <div className="truncate text-sm font-semibold text-white">{selectedTemplate.name}</div>
          </div>
          <button
            onClick={downloadPreview}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            <Download className="h-4 w-4" />
            Descargar
          </button>
        </div>
      </div>
    </div>
  );
}
