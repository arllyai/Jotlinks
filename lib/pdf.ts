import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

import type { ResumeData, ResumeTemplate, SectionKey } from "@/lib/resume-types";

const SECTION_TITLES: Record<SectionKey, string> = {
  education: "Education",
  experience: "Work Experience",
  projects: "Projects",
  skills: "Skills",
  activities: "Activities",
};

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const width = font.widthOfTextAtSize(candidate, fontSize);

    if (width <= maxWidth || !current) {
      current = candidate;
      continue;
    }

    lines.push(current);
    current = word;
  }

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [""];
}

function splitParagraphs(input: string) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function buildResumePdf({
  title,
  template,
  data,
}: {
  title: string;
  template: ResumeTemplate;
  data: ResumeData;
}) {
  const document = await PDFDocument.create();
  const fontRegular = await document.embedFont(StandardFonts.Helvetica);
  const fontBold = await document.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginX = 50;
  const marginTop = 56;
  const marginBottom = 50;
  const contentWidth = pageWidth - marginX * 2;
  const baseColor =
    template === "modern" ? rgb(0.19, 0.29, 0.51) : rgb(0.08, 0.08, 0.08);

  let page = document.addPage([pageWidth, pageHeight]);
  let y = pageHeight - marginTop;

  const ensureSpace = (requiredHeight: number) => {
    if (y - requiredHeight >= marginBottom) {
      return;
    }

    page = document.addPage([pageWidth, pageHeight]);
    y = pageHeight - marginTop;
  };

  const drawWrappedLines = ({
    lines,
    x,
    font,
    size,
    lineHeight,
    color,
  }: {
    lines: string[];
    x: number;
    font: PDFFont;
    size: number;
    lineHeight: number;
    color: ReturnType<typeof rgb>;
  }) => {
    ensureSpace(lines.length * lineHeight + 2);
    for (const line of lines) {
      page.drawText(line, {
        x,
        y,
        size,
        font,
        color,
      });
      y -= lineHeight;
    }
  };

  const drawParagraph = ({
    text,
    font,
    size,
    lineHeight,
    color,
    indent = 0,
  }: {
    text: string;
    font: PDFFont;
    size: number;
    lineHeight: number;
    color: ReturnType<typeof rgb>;
    indent?: number;
  }) => {
    const paragraphs = splitParagraphs(text);
    for (const paragraph of paragraphs) {
      const lines = wrapText(paragraph, font, size, contentWidth - indent);
      drawWrappedLines({
        lines,
        x: marginX + indent,
        font,
        size,
        lineHeight,
        color,
      });
    }
  };

  const headingName = data.personalInfo.name || title || "Resume";
  const contactParts = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
    data.personalInfo.website,
    data.personalInfo.linkedIn,
  ].filter(Boolean);

  drawWrappedLines({
    lines: wrapText(headingName, fontBold, 22, contentWidth),
    x: marginX,
    font: fontBold,
    size: 22,
    lineHeight: 26,
    color: baseColor,
  });

  if (contactParts.length) {
    drawWrappedLines({
      lines: wrapText(contactParts.join(" | "), fontRegular, 10, contentWidth),
      x: marginX,
      font: fontRegular,
      size: 10,
      lineHeight: 14,
      color: rgb(0.32, 0.32, 0.32),
    });
  }

  y -= 8;

  if (data.summary) {
    drawWrappedLines({
      lines: ["Summary"],
      x: marginX,
      font: fontBold,
      size: 12,
      lineHeight: 15,
      color: baseColor,
    });

    drawParagraph({
      text: data.summary,
      font: fontRegular,
      size: 10,
      lineHeight: 14,
      color: rgb(0.12, 0.12, 0.12),
    });
    y -= 8;
  }

  const drawSectionHeading = (name: string) => {
    ensureSpace(22);
    page.drawText(name, {
      x: marginX,
      y,
      size: 12,
      font: fontBold,
      color: baseColor,
    });
    y -= 6;
    page.drawLine({
      start: { x: marginX, y },
      end: { x: pageWidth - marginX, y },
      thickness: 0.8,
      color: rgb(0.84, 0.84, 0.84),
    });
    y -= 12;
  };

  for (const sectionKey of data.sectionOrder) {
    if (
      (sectionKey === "experience" && !data.experience.length) ||
      (sectionKey === "education" && !data.education.length) ||
      (sectionKey === "projects" && !data.projects.length) ||
      (sectionKey === "activities" && !data.activities.length) ||
      (sectionKey === "skills" && !data.skills.length)
    ) {
      continue;
    }

    drawSectionHeading(SECTION_TITLES[sectionKey]);

    if (sectionKey === "skills") {
      drawParagraph({
        text: data.skills.join(" • "),
        font: fontRegular,
        size: 10,
        lineHeight: 14,
        color: rgb(0.12, 0.12, 0.12),
      });
      y -= 6;
      continue;
    }

    if (sectionKey === "experience") {
      for (const item of data.experience) {
        const heading = [item.role, item.company].filter(Boolean).join(" — ");
        const dateRange = [item.startDate, item.endDate].filter(Boolean).join(" - ");

        if (heading) {
          drawWrappedLines({
            lines: wrapText(heading, fontBold, 11, contentWidth),
            x: marginX,
            font: fontBold,
            size: 11,
            lineHeight: 14,
            color: rgb(0.08, 0.08, 0.08),
          });
        }

        if (dateRange) {
          drawWrappedLines({
            lines: wrapText(dateRange, fontRegular, 9.5, contentWidth),
            x: marginX,
            font: fontRegular,
            size: 9.5,
            lineHeight: 13,
            color: rgb(0.35, 0.35, 0.35),
          });
        }

        for (const bullet of item.bullets) {
          drawParagraph({
            text: `• ${bullet}`,
            font: fontRegular,
            size: 10,
            lineHeight: 13,
            color: rgb(0.12, 0.12, 0.12),
            indent: 8,
          });
        }

        if (!item.bullets.length && item.description) {
          drawParagraph({
            text: item.description,
            font: fontRegular,
            size: 10,
            lineHeight: 13,
            color: rgb(0.12, 0.12, 0.12),
          });
        }

        y -= 8;
      }
      continue;
    }

    if (sectionKey === "education") {
      for (const item of data.education) {
        const heading = [item.school, item.degree].filter(Boolean).join(" — ");
        const details = [
          item.fieldOfStudy && `Field: ${item.fieldOfStudy}`,
          item.gpa && `GPA: ${item.gpa}`,
          [item.startDate, item.endDate].filter(Boolean).join(" - "),
        ]
          .filter(Boolean)
          .join(" | ");

        if (heading) {
          drawWrappedLines({
            lines: wrapText(heading, fontBold, 11, contentWidth),
            x: marginX,
            font: fontBold,
            size: 11,
            lineHeight: 14,
            color: rgb(0.08, 0.08, 0.08),
          });
        }

        if (details) {
          drawWrappedLines({
            lines: wrapText(details, fontRegular, 10, contentWidth),
            x: marginX,
            font: fontRegular,
            size: 10,
            lineHeight: 13,
            color: rgb(0.12, 0.12, 0.12),
          });
        }

        y -= 8;
      }
      continue;
    }

    if (sectionKey === "projects") {
      for (const item of data.projects) {
        const heading = [item.name, item.organization].filter(Boolean).join(" — ");
        const meta = [
          [item.startDate, item.endDate].filter(Boolean).join(" - "),
          item.link,
        ]
          .filter(Boolean)
          .join(" | ");

        if (heading) {
          drawWrappedLines({
            lines: wrapText(heading, fontBold, 11, contentWidth),
            x: marginX,
            font: fontBold,
            size: 11,
            lineHeight: 14,
            color: rgb(0.08, 0.08, 0.08),
          });
        }

        if (meta) {
          drawWrappedLines({
            lines: wrapText(meta, fontRegular, 9.5, contentWidth),
            x: marginX,
            font: fontRegular,
            size: 9.5,
            lineHeight: 13,
            color: rgb(0.35, 0.35, 0.35),
          });
        }

        for (const bullet of item.bullets) {
          drawParagraph({
            text: `• ${bullet}`,
            font: fontRegular,
            size: 10,
            lineHeight: 13,
            color: rgb(0.12, 0.12, 0.12),
            indent: 8,
          });
        }

        if (!item.bullets.length && item.description) {
          drawParagraph({
            text: item.description,
            font: fontRegular,
            size: 10,
            lineHeight: 13,
            color: rgb(0.12, 0.12, 0.12),
          });
        }

        y -= 8;
      }
      continue;
    }

    if (sectionKey === "activities") {
      for (const item of data.activities) {
        const heading = [item.name, item.role].filter(Boolean).join(" — ");
        const meta = [
          item.organization,
          [item.startDate, item.endDate].filter(Boolean).join(" - "),
        ]
          .filter(Boolean)
          .join(" | ");

        if (heading) {
          drawWrappedLines({
            lines: wrapText(heading, fontBold, 11, contentWidth),
            x: marginX,
            font: fontBold,
            size: 11,
            lineHeight: 14,
            color: rgb(0.08, 0.08, 0.08),
          });
        }

        if (meta) {
          drawWrappedLines({
            lines: wrapText(meta, fontRegular, 9.5, contentWidth),
            x: marginX,
            font: fontRegular,
            size: 9.5,
            lineHeight: 13,
            color: rgb(0.35, 0.35, 0.35),
          });
        }

        if (item.description) {
          drawParagraph({
            text: item.description,
            font: fontRegular,
            size: 10,
            lineHeight: 13,
            color: rgb(0.12, 0.12, 0.12),
          });
        }

        y -= 8;
      }
    }
  }

  return document.save();
}
