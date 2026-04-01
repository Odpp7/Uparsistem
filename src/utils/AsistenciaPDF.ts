import pdfMake from "pdfmake/build/pdfmake"
import * as pdfFonts from "pdfmake/build/vfs_fonts"
import {
  TDocumentDefinitions,
  Content,
  StyleDictionary,
  TableCell,
} from "pdfmake/interfaces"
import { ModuloConProfesor } from "../services/moduloService"

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

// ─── Paleta institucional ─────────────────────────────────────────────────────
const NAVY       = "#1B2B4B"
const NAVY_LIGHT = "#2C3E6B"
const SLATE      = "#4A5568"
const SILVER     = "#E8ECF0"
const WHITE      = "#FFFFFF"
const NEGRO      = "#1A202C"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatearFecha(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  })
}

function fechaEmision(): string {
  return new Date().toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric",
  })
}

// ─── Export principal ─────────────────────────────────────────────────────────
export function generarAsistenciaPDF(
  modulo: ModuloConProfesor,
  fecha: string,
  totalFilas: number
) {
  // ── Encabezado de la tabla ─────────────────────────────────────────────────
  const headerFila: TableCell[] = [
    { text: "N°",             style: "thCell", alignment: "center" },
    { text: "NOMBRE COMPLETO",style: "thCell" },
    { text: "CÉDULA",         style: "thCell", alignment: "center" },
    { text: "FIRMA",          style: "thCell", alignment: "center" },
  ]

  // ── Filas en blanco ────────────────────────────────────────────────────────
  const filas: TableCell[][] = Array.from({ length: totalFilas }, (_, i) => {
    const bg = i % 2 === 0 ? WHITE : "#F5F7FA"
    return [
      {
        text: String(i + 1),
        style: "tdCenter",
        fillColor: bg,
      },
      {
        text: "",
        style: "tdNormal",
        fillColor: bg,
      },
      {
        text: "",
        style: "tdCenter",
        fillColor: bg,
      },
      {
        // Celda de firma más alta para que puedan escribir
        text: "",
        fillColor: bg,
        margin: [0, 0, 0, 0],
      },
    ]
  })

  // ── Info del módulo (caja superior) ───────────────────────────────────────
  const infoModulo: Content = {
    table: {
      widths: ["*"],
      body: [[
        {
          columns: [
            // Columna izquierda: datos del módulo
            {
              stack: [
                {
                  text: "INFORMACIÓN DEL MÓDULO",
                  fontSize: 6.5,
                  bold: true,
                  color: NAVY,
                  characterSpacing: 1,
                  margin: [0, 0, 0, 10],
                } as Content,
                {
                  columns: [
                    {
                      stack: [
                        { text: "Módulo", fontSize: 7, color: SLATE, margin: [0, 0, 0, 1] } as Content,
                        { text: `${modulo.codigo} — ${modulo.nombre}`, fontSize: 11, bold: true, color: NEGRO } as Content,
                      ],
                      width: "*",
                    },
                    {
                      stack: [
                        { text: "Instructor", fontSize: 7, color: SLATE, margin: [0, 0, 0, 1] } as Content,
                        { text: modulo.profesor_nombre ?? "Sin asignar", fontSize: 10, bold: true, color: NEGRO } as Content,
                      ],
                      width: "auto",
                    },
                  ],
                  columnGap: 20,
                  margin: [0, 0, 0, 8],
                } as Content,
                {
                  columns: [
                    {
                      stack: [
                        { text: "Programa", fontSize: 7, color: SLATE, margin: [0, 0, 0, 1] } as Content,
                        { text: modulo.programa_nombre ?? "—", fontSize: 9, color: NEGRO } as Content,
                      ],
                      width: "*",
                    },
                    {
                      stack: [
                        { text: "Ciclo", fontSize: 7, color: SLATE, margin: [0, 0, 0, 1] } as Content,
                        { text: modulo.ciclo_nombre ?? "—", fontSize: 9, color: NEGRO } as Content,
                      ],
                      width: "*",
                    },
                    {
                      stack: [
                        { text: "Créditos", fontSize: 7, color: SLATE, margin: [0, 0, 0, 1] } as Content,
                        { text: String(modulo.creditos ?? "—"), fontSize: 9, color: NEGRO } as Content,
                      ],
                      width: "auto",
                    },
                  ],
                  columnGap: 20,
                } as Content,
              ],
              width: "*",
            },
            // Columna derecha: fecha de clase destacada
            {
              stack: [
                {
                  text: "FECHA DE CLASE",
                  fontSize: 6.5,
                  bold: true,
                  color: "#A8B8D0",
                  characterSpacing: 1,
                  alignment: "center",
                  margin: [0, 0, 0, 6],
                } as Content,
                {
                  text: formatearFecha(fecha).split(",")[0].toUpperCase(), // día de la semana
                  fontSize: 8,
                  bold: true,
                  color: NEGRO,
                  alignment: "center",
                } as Content,
                {
                  text: formatearFecha(fecha).split(",").slice(1).join(",").trim(),
                  fontSize: 9,
                  bold: true,
                  color: NEGRO,
                  alignment: "center",
                  margin: [0, 2, 0, 0],
                } as Content,
              ],
              fillColor: NAVY,
              width: 130,
              margin: [0, 10, 0, 10],
            },
          ],
          columnGap: 0,
          fillColor: "#F8FAFC",
          margin: [16, 14, 12, 14],
        } as TableCell,
      ]],
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => SILVER,
      vLineColor: () => SILVER,
      paddingLeft:   () => 0,
      paddingRight:  () => 0,
      paddingTop:    () => 0,
      paddingBottom: () => 0,
    },
    margin: [0, 0, 0, 22],
  }

  // ─── Documento ────────────────────────────────────────────────────────────
  const docDef: TDocumentDefinitions = {
    pageSize:    "A4",
    pageMargins: [48, 48, 48, 64],

    footer: (currentPage, pageCount) => ({
      stack: [
        {
          canvas: [
            { type: "line", x1: 0, y1: 0, x2: 499, y2: 0, lineWidth: 0.5, lineColor: SILVER },
          ],
          margin: [48, 0, 48, 4],
        },
        {
          columns: [
            {
              stack: [
                {
                  text: "Instituto Educativo Ebenezer — Planilla de Asistencia",
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
          margin: [48, 0, 48, 0],
        },
      ],
      margin: [0, 8, 0, 0],
    }),

    content: [

      // ── ENCABEZADO INSTITUCIONAL ─────────────────────────────────────────
      {
        columns: [
          {
            stack: [
              {
                text: "INSTITUTO EDUCATIVO",
                fontSize: 7, bold: true, color: NAVY,
                characterSpacing: 1.5, margin: [0, 0, 0, 2],
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
                text: "PLANILLA DE ASISTENCIA",
                fontSize: 8, bold: true, color: NAVY,
                alignment: "right", characterSpacing: 0.8,
              } as Content,
              {
                text: `Fecha de emisión: ${fechaEmision()}`,
                fontSize: 8, color: SLATE, alignment: "right", margin: [0, 4, 0, 0],
              } as Content,
            ],
            width: "auto",
          },
        ],
        columnGap: 20,
      } as Content,

      // Doble línea divisoria
      {
        canvas: [
          { type: "line", x1: 0, y1: 6,  x2: 499, y2: 6,  lineWidth: 3,   lineColor: NAVY },
          { type: "line", x1: 0, y1: 11, x2: 499, y2: 11, lineWidth: 0.5, lineColor: SILVER },
        ],
        margin: [0, 10, 0, 20],
      } as Content,

      // ── INFO MÓDULO ───────────────────────────────────────────────────────
      infoModulo,

      // ── TÍTULO TABLA ─────────────────────────────────────────────────────
      {
        text: "REGISTRO DE ASISTENCIA",
        fontSize: 8, bold: true, color: NAVY,
        characterSpacing: 1, margin: [0, 0, 0, 8],
      } as Content,

      // ── TABLA ─────────────────────────────────────────────────────────────
      {
        table: {
          headerRows: 1,
          widths: [24, "*", 90, 110],
          body: [headerFila, ...filas],
        },
        layout: {
          hLineWidth: () => 0.8,
          vLineWidth: () => 0.8,
          hLineColor: () => SILVER,
          vLineColor: () => SILVER,
          paddingLeft:   () => 8,
          paddingRight:  () => 8,
          paddingTop:    () => 10,  // filas más altas para firmar
          paddingBottom: () => 10,
        },
      } as Content,

      // Línea cierre
      {
        canvas: [
          { type: "line", x1: 0, y1: 0, x2: 499, y2: 0, lineWidth: 1.5, lineColor: NAVY },
        ],
        margin: [0, 0, 0, 24],
      } as Content,

      // ── FIRMAS AL FINAL ───────────────────────────────────────────────────
      {
        columns: [
          {
            stack: [
              {
                canvas: [
                  { type: "line", x1: 0, y1: 0, x2: 160, y2: 0, lineWidth: 0.8, lineColor: NEGRO },
                ],
                margin: [0, 0, 0, 5],
              } as Content,
              { text: "Firma del Instructor", fontSize: 8.5, bold: true, color: NEGRO } as Content,
              { text: modulo.profesor_nombre ?? "Instituto Educativo Ebenezer", fontSize: 7.5, color: SLATE, margin: [0, 2, 0, 0] } as Content,
            ],
            width: "auto",
          },
          { width: "*", text: "" },
          {
            stack: [
              {
                canvas: [
                  { type: "line", x1: 0, y1: 0, x2: 160, y2: 0, lineWidth: 0.8, lineColor: NEGRO },
                ],
                margin: [0, 0, 0, 5],
              } as Content,
              { text: "Coordinador Académico", fontSize: 8.5, bold: true, color: NEGRO } as Content,
              { text: "Instituto Educativo Ebenezer", fontSize: 7.5, color: SLATE, margin: [0, 2, 0, 0] } as Content,
            ],
            width: "auto",
          },
        ],
      } as Content,
    ],

    styles: {
      thCell: {
        fontSize: 7.5,
        bold: true,
        color: WHITE,
        fillColor: NAVY_LIGHT,
        characterSpacing: 0.5,
      },
      tdNormal: { fontSize: 9, color: NEGRO },
      tdCenter:  { fontSize: 9, color: NEGRO, alignment: "center" },
    } as StyleDictionary,

    defaultStyle: { font: "Roboto", fontSize: 9, color: NEGRO },
  }

  const codigoLimpio = modulo.codigo.replace(/\//g, "-")
  const fechaLimpia  = fecha.replace(/-/g, "")
  pdfMake.createPdf(docDef).download(`Asistencia_${codigoLimpio}_${fechaLimpia}.pdf`)
}