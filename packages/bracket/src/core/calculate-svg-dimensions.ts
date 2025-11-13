import { Options } from '../types';

export function calculateSVGDimensions(
  numOfRows: number,
  numOfColumns: number,
  rowHeight: number,
  columnWidth: number,
  canvasPadding: number,
  roundHeader: NonNullable<Options['roundHeader']>,
  currentRound: string = ''
): { gameWidth: number; gameHeight: number; startPosition: number[] } {
  const bracketHeight = numOfRows * rowHeight;
  const bracketWidth = numOfColumns * columnWidth;

  const gameHeight =
    bracketHeight +
    canvasPadding * 2 +
    (roundHeader?.isShown ? (roundHeader.height ?? 0) + (roundHeader.marginBottom ?? 0) : 0);
  const gameWidth = bracketWidth + canvasPadding * 2;
  const startPosition = [
    currentRound
      ? -(parseInt(currentRound, 10) * columnWidth - canvasPadding * 2)
      : 0,
    0,
  ];
  return { gameWidth, gameHeight, startPosition };
}
