"use client";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ExternalHyperlink,
  AlignmentType,
  TabStopType,
  BorderStyle,
  convertInchesToTwip,
} from "docx";
import { ResumeEntry, FinalResumeData } from "@/app/interfaces/Resume";

const FONT_FAMILY = "Times New Roman";
const CONTENT_SIZE = 20; // 10pt, expressed in half-points for DOCX.
const SUMMARY_SIZE = 17; // 8.5pt.
const HEADER_SIZE = 28; // 14pt.
const SECTION_SPACING = { before: 80, after: 20 };
const CONTENT_SPACING = { after: 10, line: 252 };
const VERTICAL_MARGIN_TWIPS = 432; // 0.3in exactly.
const NAVY_BLUE = "1F4E79";

const parseRichText = (text: string, size = CONTENT_SIZE) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return new TextRun({
        text: part.slice(2, -2),
        bold: true,
        font: FONT_FAMILY,
        size,
      });
    }
    return new TextRun({ text: part, font: FONT_FAMILY, size });
  });
};

const createSectionTitle = (title: string) => {
  return new Paragraph({
    children: [
      new TextRun({
        text: title.toUpperCase(),
        font: FONT_FAMILY,
        bold: true,
        size: CONTENT_SIZE,
        color: NAVY_BLUE,
      }),
    ],
    border: {
      bottom: {
        color: "auto",
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
    spacing: SECTION_SPACING,
  });
};

const createSubheading = (leftText: string, rightDate: string) => {
  return new Paragraph({
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: convertInchesToTwip(7.3),
      },
    ],
    children: [
      new TextRun({
        text: leftText,
        bold: true,
        font: FONT_FAMILY,
        size: CONTENT_SIZE,
      }),
      new TextRun({
        text: `\t${rightDate}`,
        font: FONT_FAMILY,
        size: CONTENT_SIZE,
      }),
    ],
    spacing: CONTENT_SPACING,
  });
};

const createContentParagraph = (children: TextRun[]) =>
  new Paragraph({
    children,
    spacing: CONTENT_SPACING,
  });

const createBulletParagraph = (children: TextRun[]) =>
  new Paragraph({
    bullet: { level: 0 },
    children,
    spacing: CONTENT_SPACING,
  });

const createSection = (sectionTitle: string, entries: ResumeEntry[], options: { bulletDetails?: boolean } = {}) => {
  return [
    createSectionTitle(sectionTitle),

    ...entries.flatMap((entry) => {
      const headerText = entry.role ? `${entry.title} | ${entry.role}` : entry.title;

      return [
        createSubheading(headerText, entry.date),

        ...entry.bullets.map((bullet) =>
          options.bulletDetails
            ? createBulletParagraph(parseRichText(bullet))
            : createContentParagraph(parseRichText(bullet)),
        ),

        new Paragraph({ spacing: { after: 60 } }),
      ];
    }),
  ];
};

// --- MAIN GENERATOR FUNCTION ---
export const generateResume = async (resumeData: FinalResumeData) => {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_FAMILY,
            size: CONTENT_SIZE,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: VERTICAL_MARGIN_TWIPS,
              bottom: VERTICAL_MARGIN_TWIPS,
              left: convertInchesToTwip(0.5),
              right: convertInchesToTwip(0.5),
            },
          },
        },
        children: [
          // --- HEADER ---
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: resumeData.header.name,
                bold: true,
                font: FONT_FAMILY,
                size: HEADER_SIZE,
              }),
              new TextRun({
                text: resumeData.header.contact ? ` | ${resumeData.header.contact}` : "",
                font: FONT_FAMILY,
                size: HEADER_SIZE,
              }),
            ],
            spacing: CONTENT_SPACING,
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: resumeData.header.links.flatMap((link, index) => [
              new TextRun({
                text: `${link.label}: `,
                bold: true,
                font: FONT_FAMILY,
                size: CONTENT_SIZE,
              }),
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: link.text,
                    style: "Hyperlink",
                    color: "0000FF",
                    font: FONT_FAMILY,
                    size: CONTENT_SIZE,
                    underline: { type: "single" },
                  }),
                ],
                link: link.url,
              }),
              index < resumeData.header.links.length - 1
                ? new TextRun({
                    text: " | ",
                    font: FONT_FAMILY,
                    size: CONTENT_SIZE,
                  })
                : new TextRun({ text: "", font: FONT_FAMILY, size: CONTENT_SIZE }),
            ]),
            spacing: { ...CONTENT_SPACING, after: 80 },
          }),

          // --- SUMMARY ---
          createSectionTitle("Summary"),
          new Paragraph({
            children: parseRichText(resumeData.summary, SUMMARY_SIZE),
            spacing: CONTENT_SPACING,
          }),

          // --- EDUCATION ---
          createSectionTitle("Education"),
          ...resumeData.education.flatMap((edu) => [
            createSubheading(edu.institution, edu.date),
            createContentParagraph([
              new TextRun({
                text: edu.degree,
                font: FONT_FAMILY,
                size: CONTENT_SIZE,
                italics: true,
              }),
            ]),
            createContentParagraph([
              new TextRun({
                text: edu.gpa,
                font: FONT_FAMILY,
                size: CONTENT_SIZE,
              }),
            ]),
          ]),

          // --- SKILLS ---
          createSectionTitle("Technical Skills"),
          ...Object.entries(resumeData.skills).map(([key, value]) =>
            createContentParagraph([
              new TextRun({
                text: `${key}: `,
                bold: true,
                font: FONT_FAMILY,
                size: CONTENT_SIZE,
              }),
              new TextRun({
                text: value,
                font: FONT_FAMILY,
                size: CONTENT_SIZE,
              }),
            ]),
          ),

          // --- EXPERIENCE ---
          ...createSection("Work Experiences & Internships", resumeData["Work Experiences & Internships"], { bulletDetails: true }),
          ...createSection("Selected Projects", resumeData["Personal Projects"], { bulletDetails: true }),
          ...createSection("Leadership Experiences", resumeData["Leadership Experiences"], { bulletDetails: true }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
};
