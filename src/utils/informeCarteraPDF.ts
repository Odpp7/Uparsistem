import pdfMake from "pdfmake/build/pdfmake"
import * as pdfFonts from "pdfmake/build/vfs_fonts"
import { TDocumentDefinitions, Content, StyleDictionary, TableCell } from "pdfmake/interfaces"
import { LineaCarteraGeneral, ResumenCarteraGeneral } from "../services/dashboardService"

const fonts = (pdfFonts as any).default ?? pdfFonts;
(pdfMake as any).vfs = fonts.pdfMake?.vfs ?? fonts.vfs

pdfMake.fonts = {
  Roboto: {
    normal:      "Roboto-Regular.ttf",
    bold:        "Roboto-Medium.ttf",
    italics:     "Roboto-Italic.ttf",
    bolditalics: "Roboto-MediumItalic.ttf",
  },
}

// ─── Paleta institucional (igual que notaPDF) ─────────────────────────────────
const NAVY       = "#1B2B4B"
const NAVY_LIGHT = "#2C3E6B"
const SLATE      = "#4A5568"
const SILVER     = "#E8ECF0"
const WHITE      = "#FFFFFF"
const NEGRO      = "#1A202C"
const VERDE      = "#276749"
const ROJO       = "#9B2335"

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hoy(): string {
  return new Date().toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric",
  })
}

function anio(): number {
  return new Date().getFullYear()
}

function cop(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(valor)
}

// ─── Agrupa lineas por estudiante ─────────────────────────────────────────────
interface GrupoEstudiante {
  nombre:    string
  cedula:    string
  telefono:  string | null
  modulos:   LineaCarteraGeneral[]
  totalDeuda: number
}

function agruparPorEstudiante(lineas: LineaCarteraGeneral[]): GrupoEstudiante[] {
  const mapa = new Map<number, GrupoEstudiante>()
  for (const l of lineas) {
    if (!mapa.has(l.estudianteId)) {
      mapa.set(l.estudianteId, {
        nombre:     l.nombreEstudiante,
        cedula:     l.cedula,
        telefono:   l.telefono,
        modulos:    [],
        totalDeuda: 0,
      })
    }
    const g = mapa.get(l.estudianteId)!
    g.modulos.push(l)
    g.totalDeuda += l.saldoPendiente
  }
  return Array.from(mapa.values())
}

// ─── Caja de métrica (header summary) ────────────────────────────────────────
function cajaMetrica(label: string, value: string, bgColor = WHITE, textColor = NEGRO): Content {
  const esOscuro = bgColor === NAVY || bgColor === NAVY_LIGHT
  const cell: TableCell = {
    stack: [
      {
        text: label,
        fontSize: 6.5,
        bold: true,
        color: esOscuro ? "#A8B8D0" : SLATE,
        alignment: "center",
        margin: [0, 0, 0, 5],
        characterSpacing: 0.8,
      } as Content,
      {
        text: value,
        fontSize: 18,
        bold: true,
        color: esOscuro ? WHITE : textColor,
        alignment: "center",
      } as Content,
    ],
    fillColor: bgColor,
    margin: [0, 12, 0, 12],
  }
  return {
    table: { widths: ["*"], body: [[cell]] },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => esOscuro ? NAVY_LIGHT : SILVER,
      vLineColor: () => esOscuro ? NAVY_LIGHT : SILVER,
      paddingLeft:   () => 12,
      paddingRight:  () => 12,
      paddingTop:    () => 0,
      paddingBottom: () => 0,
    },
    width: "*",
  } as Content
}

// ─── Export principal ─────────────────────────────────────────────────────────
export function generarCarteraPDF(reporte: ResumenCarteraGeneral) {
  const grupos = agruparPorEstudiante(reporte.lineas)

  // ── Construir filas de la tabla maestra ───────────────────────────────────
  const headerFila: TableCell[] = [
    { text: "ESTUDIANTE",     style: "thCell" },
    { text: "CÉDULA",         style: "thCell" },
    { text: "TELÉFONO",       style: "thCell" },
    { text: "MÓDULO",         style: "thCell" },
    { text: "PRECIO",         style: "thCell", alignment: "right" },
    { text: "DESC %",         style: "thCell", alignment: "center" },
    { text: "PAGADO",         style: "thCell", alignment: "right" },
    { text: "SALDO PENDIENTE",style: "thCell", alignment: "right" },
    { text: "ÚLT. PAGO",      style: "thCell", alignment: "center" },
  ]

  const filas: TableCell[][] = []
  let rowIndex = 0

  for (const grupo of grupos) {
    const modulosOrdenados = grupo.modulos

    modulosOrdenados.forEach((mod, idx) => {
      const bg = rowIndex % 2 === 0 ? WHITE : "#F5F7FA"
      const esPrimeroDelGrupo = idx === 0

      // Fila separadora por estudiante (solo antes del primero, si no es el primer grupo)
      // Para que visualmente se lean agrupados usamos la celda de nombre solo en la primera fila

      filas.push([
        {
          // Solo mostrar nombre/cedula en la primera fila del estudiante
          text: esPrimeroDelGrupo ? grupo.nombre.toUpperCase() : "",
          style: esPrimeroDelGrupo ? "tdBold" : "tdNormal",
          color: esPrimeroDelGrupo ? NAVY : NEGRO,
          fillColor: bg,
        },
        {
          text: esPrimeroDelGrupo ? grupo.cedula : "",
          style: "tdMono",
          fillColor: bg,
        },
        {
          text: esPrimeroDelGrupo ? (grupo.telefono ?? "—") : "",
          style: "tdNormal",
          fillColor: bg,
        },
        {
          text: `${mod.moduloCodigo} - ${mod.moduloNombre}`,
          style: "tdNormal",
          fillColor: bg,
        },
        {
          text: cop(mod.precio),
          style: "tdRight",
          fillColor: bg,
        },
        {
          text: mod.descuento > 0 ? `${mod.descuento}%` : "—",
          style: "tdCenter",
          color: mod.descuento > 0 ? VERDE : SLATE,
          fillColor: bg,
        },
        {
          text: cop(mod.totalPagado),
          style: "tdRight",
          color: mod.totalPagado > 0 ? VERDE : SLATE,
          fillColor: bg,
        },
        {
          text: cop(mod.saldoPendiente),
          style: "tdRight",
          bold: true,
          color: ROJO,
          fillColor: bg,
        },
        {
          text: mod.ultimoPago ?? "Sin pagos",
          style: "tdCenter",
          color: mod.ultimoPago ? NEGRO : SLATE,
          fillColor: bg,
        },
      ])
      rowIndex++
    })

    // Fila subtotal por estudiante
    filas.push([
      {
        text: `Subtotal: ${grupo.nombre.split(" ")[0]}`,
        colSpan: 7,
        style: "tdSubtotal",
        fillColor: "#EEF2F7",
      },
      {} as TableCell, {} as TableCell, {} as TableCell,
      {} as TableCell, {} as TableCell, {} as TableCell,
      {
        text: cop(grupo.totalDeuda),
        style: "tdSubtotalMonto",
        fillColor: "#EEF2F7",
        colSpan: 2,
      },
      {} as TableCell,
    ])
    rowIndex++
  }

  // ─── Documento ────────────────────────────────────────────────────────────
  const docDef: TDocumentDefinitions = {
    pageSize:        "A4",
    pageOrientation: "landscape",
    pageMargins:     [40, 44, 40, 60],

    footer: (currentPage, pageCount) => ({
      stack: [
        {
          canvas: [
            { type: "line", x1: 0, y1: 0, x2: 752, y2: 0, lineWidth: 0.5, lineColor: SILVER },
          ],
          margin: [40, 0, 40, 4],
        },
        {
          columns: [
            {
              stack: [
                {
                  text: "Instituto Educativo Ebenezer — Reporte de Cartera Confidencial",
                  fontSize: 6.5, color: SLATE, italics: true,
                },
                {
                  text: "Calle 18 No. 15 - 04 Barrio la Granja  ·  Tel: 5708946  ·  Cel: 316 0929970 / 315 6905567 / 312 6552105",
                  fontSize: 6, color: SLATE, margin: [0, 1, 0, 0],
                },
                {
                  text: "instituciónteologicaebenezer@gmail.com",
                  fontSize: 6, color: SLATE, margin: [0, 1, 0, 0],
                },
              ],
              width: "*",
            },
            {
              text: `Página ${currentPage} de ${pageCount}`,
              fontSize: 7, color: SLATE, alignment: "right", width: "auto",
            },
          ],
          margin: [40, 0, 40, 0],
        },
      ],
      margin: [0, 8, 0, 0],
    }),

    content: [

      // ── ENCABEZADO ─────────────────────────────────────────────────────────
      {
        columns: [
          {
            stack: [
              {
                text: "INSTITUTO EDUCATIVO",
                fontSize: 7, bold: true, color: NAVY, characterSpacing: 1.5, margin: [0, 0, 0, 2],
              } as Content,
              {
                text: "Instituto Ebenezer",
                fontSize: 22, bold: true, color: NAVY, lineHeight: 1,
              } as Content,
              {
                text: "Formando el futuro con excelencia",
                fontSize: 8, color: SLATE, italics: true, margin: [0, 3, 0, 0],
              } as Content,
            ],
            width: "*",
          },
          {
            stack: [
              {
                text: "REPORTE DE CARTERA GENERAL",
                fontSize: 8, bold: true, color: NAVY, alignment: "right", characterSpacing: 0.8,
              } as Content,
              {
                text: `Fecha de emisión: ${hoy()}`,
                fontSize: 8, color: SLATE, alignment: "right", margin: [0, 4, 0, 0],
              } as Content,
            ],
            width: "auto",
          },
        ],
        columnGap: 20,
      } as Content,

      // Doble línea
      {
        canvas: [
          { type: "line", x1: 0, y1: 6,  x2: 752, y2: 6,  lineWidth: 3,   lineColor: NAVY },
          { type: "line", x1: 0, y1: 11, x2: 752, y2: 11, lineWidth: 0.5, lineColor: SILVER },
        ],
        margin: [0, 10, 0, 18],
      } as Content,

      // ── RESUMEN EJECUTIVO ───────────────────────────────────────────────────
      {
        columns: [
          cajaMetrica("TOTAL EN CARTERA", cop(reporte.totalCartera), NAVY),
          { width: 10, text: "" },
          cajaMetrica("ESTUDIANTES CON DEUDA", String(reporte.totalEstudiantesConDeuda)),
          { width: 10, text: "" },
          cajaMetrica("MÓDULOS PENDIENTES", String(reporte.lineas.length)),
        ],
        margin: [0, 0, 0, 20],
      } as Content,

      // ── TÍTULO TABLA ────────────────────────────────────────────────────────
      {
        text: "DETALLE DE CARTERA POR ESTUDIANTE",
        fontSize: 8, bold: true, color: NAVY, characterSpacing: 1,
        margin: [0, 0, 0, 8],
      } as Content,

      // ── TABLA ───────────────────────────────────────────────────────────────
      {
        table: {
          headerRows: 1,
          widths: [110, 62, 64, "*", 56, 38, 56, 72, 56],
          body: [headerFila, ...filas],
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 || i === 1 ? 0 : 0.5),
          vLineWidth: () => 0,
          hLineColor: () => SILVER,
          paddingLeft:   () => 6,
          paddingRight:  () => 6,
          paddingTop:    () => 6,
          paddingBottom: () => 6,
        },
      } as Content,

      // Línea cierre tabla
      {
        canvas: [
          { type: "line", x1: 0, y1: 0, x2: 752, y2: 0, lineWidth: 1.5, lineColor: NAVY },
        ],
        margin: [0, 0, 0, 14],
      } as Content,

      // ── TOTAL FINAL ─────────────────────────────────────────────────────────
      {
        columns: [
          { text: "", width: "*" },
          {
            table: {
              widths: ["auto", "auto"],
              body: [[
                {
                  text: "TOTAL GENERAL EN CARTERA",
                  fontSize: 9, bold: true, color: WHITE,
                  fillColor: NAVY, margin: [12, 8, 24, 8],
                },
                {
                  text: cop(reporte.totalCartera),
                  fontSize: 11, bold: true, color: ROJO,
                  fillColor: NAVY, alignment: "right", margin: [0, 8, 12, 8],
                },
              ]],
            },
            layout: {
              hLineWidth: () => 0,
              vLineWidth: () => 0,
              paddingLeft:   () => 0,
              paddingRight:  () => 0,
              paddingTop:    () => 0,
              paddingBottom: () => 0,
            },
            width: "auto",
          },
        ],
        margin: [0, 0, 0, 0],
      } as Content,
    ],

    styles: {
      thCell: {
        fontSize: 7, bold: true, color: WHITE,
        fillColor: NAVY_LIGHT, characterSpacing: 0.4,
      },
      tdNormal:        { fontSize: 8, color: NEGRO },
      tdBold:          { fontSize: 8, bold: true },
      tdMono:          { fontSize: 7.5, color: SLATE },
      tdRight:         { fontSize: 8, color: NEGRO, alignment: "right" },
      tdCenter:        { fontSize: 8, color: NEGRO, alignment: "center" },
      tdSubtotal:      { fontSize: 7.5, bold: true, color: NAVY, italics: true },
      tdSubtotalMonto: { fontSize: 8, bold: true, color: ROJO, alignment: "right" },
    } as StyleDictionary,

    defaultStyle: { font: "Roboto", fontSize: 8, color: NEGRO },
  }

  pdfMake.createPdf(docDef).download(`Cartera_General_${anio()}.pdf`)
}