/**
 * AVORRIA VECTOR BRANDING FOR PDF-LIB
 *
 * Renders the canonical crystalline faceted Avorria brand mark into PDF pages
 * using the exact geometry, facets, and calibrated color palette from
 * src/lib/brand/mark-geometry.ts.
 */

import { PDFPage, PDFFont, rgb } from 'pdf-lib';
import { buildMarkPlates, MARK_BOUNDS } from './mark-geometry';

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return rgb(r, g, b);
}

const PLATES = buildMarkPlates();
const SPAN_X = MARK_BOUNDS.maxX - MARK_BOUNDS.minX; // 3.4992
const SPAN_Y = MARK_BOUNDS.maxY - MARK_BOUNDS.minY; // 2.0
export const MARK_ASPECT_RATIO = SPAN_X / SPAN_Y; // 1.7496

export interface DrawBrandMarkOptions {
  x: number;
  y: number;
  height: number;
}

/**
 * Draws the canonical crystalline faceted Avorria brand mark on a pdf-lib PDFPage.
 */
export function drawAvorriaBrandMark(
  page: PDFPage,
  options: DrawBrandMarkOptions
): { width: number; height: number } {
  const { x, y, height } = options;
  const width = height * MARK_ASPECT_RATIO;

  for (const plate of PLATES) {
    const pts = plate.points.map(([px, py]) => {
      const nx = (px - MARK_BOUNDS.minX) / SPAN_X;
      const ny = (py - MARK_BOUNDS.minY) / SPAN_Y;
      return [x + nx * width, y + ny * height];
    });

    const path = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)} L ${pts[1][0].toFixed(2)} ${pts[1][1].toFixed(2)} L ${pts[2][0].toFixed(2)} ${pts[2][1].toFixed(2)} Z`;

    page.drawSvgPath(path, {
      color: hexToRgb(plate.fill),
      borderColor: rgb(1, 1, 1),
      borderWidth: 0.15,
    });
  }

  return { width, height };
}

export interface DrawHeaderOptions {
  margin: number;
  cursorY: number;
  pageWidth: number;
  fontBold: PDFFont;
  fontRegular: PDFFont;
  isPublic?: boolean;
  orgName?: string;
  orgSubtitle?: string;
  docTypeTitle: string;
  version?: number;
}

/**
 * Renders the top header banner with proper primary/dual Avorria branding.
 */
export function drawDocumentHeaderBanner(
  page: PDFPage,
  options: DrawHeaderOptions
): number {
  const {
    margin,
    cursorY,
    pageWidth,
    fontBold,
    fontRegular,
    isPublic = false,
    orgName = 'AVORRIA CONTRACTOR USA',
    orgSubtitle = 'OSHA-ALIGNED UTILITY SYSTEM',
    docTypeTitle,
    version = 1,
  } = options;

  const headerHeight = 50;
  const bannerY = cursorY - headerHeight;
  const bannerWidth = pageWidth - margin * 2;

  // Primary dark background #111827
  page.drawRectangle({
    x: margin,
    y: bannerY,
    width: bannerWidth,
    height: headerHeight,
    color: rgb(0.067, 0.094, 0.153),
  });

  // 2px Orange accent stripe #F97316
  page.drawRectangle({
    x: margin,
    y: bannerY - 2,
    width: bannerWidth,
    height: 2,
    color: rgb(0.976, 0.451, 0.086),
  });

  if (isPublic) {
    // Public Header: Full Avorria Brand Mark + AVORRIA title
    const markHeight = 22;
    const markY = bannerY + (headerHeight - markHeight) / 2;
    const { width: markWidth } = drawAvorriaBrandMark(page, {
      x: margin + 14,
      y: markY,
      height: markHeight,
    });

    const textX = margin + 14 + markWidth + 10;
    page.drawText('AVORRIA', {
      x: textX,
      y: bannerY + 28,
      size: 14,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText('CONTRACTOR OPERATING SYSTEM  •  OFFICIAL DOCUMENT', {
      x: textX,
      y: bannerY + 14,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.7, 0.8, 0.9),
    });

    // Right side: Document Type badge
    page.drawText('FREE GENERATION', {
      x: pageWidth - margin - 120,
      y: bannerY + 28,
      size: 8,
      font: fontBold,
      color: rgb(0.976, 0.451, 0.086),
    });

    page.drawText(docTypeTitle.toUpperCase(), {
      x: pageWidth - margin - 120,
      y: bannerY + 14,
      size: 8,
      font: fontRegular,
      color: rgb(0.85, 0.88, 0.92),
    });
  } else {
    // Authenticated Header: Contractor is primary, top-right carries small Avorria mark
    page.drawText(orgName.toUpperCase(), {
      x: margin + 14,
      y: bannerY + 28,
      size: 13,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText(orgSubtitle, {
      x: margin + 14,
      y: bannerY + 14,
      size: 8,
      font: fontRegular,
      color: rgb(0.7, 0.8, 0.9),
    });

    // Top-right version & Avorria dual mark
    const miniMarkHeight = 14;
    const miniMarkX = pageWidth - margin - 35;
    drawAvorriaBrandMark(page, {
      x: miniMarkX,
      y: bannerY + 26,
      height: miniMarkHeight,
    });

    page.drawText(`VER. ${version}`, {
      x: pageWidth - margin - 85,
      y: bannerY + 28,
      size: 9,
      font: fontBold,
      color: rgb(0.976, 0.451, 0.086),
    });

    page.drawText(docTypeTitle.toUpperCase(), {
      x: pageWidth - margin - 120,
      y: bannerY + 14,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.8, 0.8, 0.8),
    });
  }

  return bannerY - 2;
}

export interface DrawFooterOptions {
  margin: number;
  y: number;
  pageWidth: number;
  font: PDFFont;
  fontBold?: PDFFont;
  docId: string;
  version?: number;
  isPublic?: boolean;
}

/**
 * Renders the audit footer with Avorria logo and platform attribution watermark.
 */
export function drawAttributionFooter(
  page: PDFPage,
  options: DrawFooterOptions
): void {
  const {
    margin,
    y,
    font,
    docId,
    version = 1,
    isPublic = false,
  } = options;

  // Mini mark in footer
  const markHeight = 10;
  drawAvorriaBrandMark(page, {
    x: margin,
    y: y - 1,
    height: markHeight,
  });

  const textX = margin + markHeight * MARK_ASPECT_RATIO + 6;

  if (isPublic) {
    page.drawText(
      `Generated with Avorria  —  create your free account at avorria.com  |  DOC: ${docId}`,
      {
        x: textX,
        y: y,
        size: 7,
        font,
        color: rgb(0.392, 0.455, 0.545),
      }
    );
  } else {
    page.drawText(
      `Generated with Avorria  |  DOC: ${docId}  |  V${version}  |  avorria.com`,
      {
        x: textX,
        y: y,
        size: 7,
        font,
        color: rgb(0.392, 0.455, 0.545),
      }
    );
  }
}
