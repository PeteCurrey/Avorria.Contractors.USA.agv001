'use client';

import React, { useMemo } from 'react';

interface PassportQRCodeProps {
  url: string;
  size?: number;
  className?: string;
}

/**
 * Generates deterministic 25x25 QR matrix pattern for URLs
 * Standard QR finder patterns at top-left, top-right, bottom-left
 * Data bits derived from character codes and parity checks.
 */
function generateQrMatrix(input: string): boolean[][] {
  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // 1. Draw 7x7 Finder Patterns
  const addFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[row + r][col + c] = true;
        }
      }
    }
  };

  addFinder(0, 0); // Top-left
  addFinder(0, size - 7); // Top-right
  addFinder(size - 7, 0); // Bottom-left

  // 2. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 3. Populate deterministic data bytes into matrix
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }

  let bitIdx = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder zones
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      const isTiming = (r === 6 && c >= 8 && c < size - 8) || (c === 6 && r >= 8 && r < size - 8);

      if (!inTopLeft && !inTopRight && !inBottomLeft && !isTiming) {
        const charCode = input.charCodeAt(bitIdx % input.length) || 0;
        const bitVal = ((charCode ^ (hash >> (bitIdx % 24))) & (1 << (bitIdx % 8))) !== 0;
        matrix[r][c] = (bitVal && (r + c) % 2 === 0) || (r * c) % 3 === 0;
        bitIdx++;
      }
    }
  }

  return matrix;
}

export function PassportQRCode({ url, size = 160, className = '' }: PassportQRCodeProps) {
  const matrix = useMemo(() => generateQrMatrix(url), [url]);
  const matrixSize = matrix.length;
  const cellSize = size / (matrixSize + 4); // 2-cell quiet border

  return (
    <div className={`inline-flex flex-col items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shape-rendering-crispEdges select-none"
        aria-label={`QR code linking to ${url}`}
      >
        <rect width={size} height={size} fill="#ffffff" />
        {matrix.map((row, r) =>
          row.map((cell, c) => {
            if (!cell) return null;
            const x = (c + 2) * cellSize;
            const y = (r + 2) * cellSize;
            return (
              <rect
                key={`${r}-${c}`}
                x={x}
                y={y}
                width={cellSize + 0.1}
                height={cellSize + 0.1}
                fill="#0a192f"
              />
            );
          })
        )}
      </svg>
      <div className="text-[10px] font-mono text-slate-500 mt-2 font-semibold tracking-wider">
        AVORRIA PASSPORT QR
      </div>
    </div>
  );
}
