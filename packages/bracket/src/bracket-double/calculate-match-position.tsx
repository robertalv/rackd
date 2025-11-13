export const calculateVerticalStartingPoint = (columnIndex: number, height: number): number =>
  2 ** columnIndex * (height / 2) - height / 2;

export const columnIncrement = (columnIndex: number, height: number): number =>
  2 ** columnIndex * height;

export const calculateHeightIncrease = (columnIndex: number, rowIndex: number, height: number): number =>
  columnIncrement(columnIndex, height) * rowIndex;

export const calculateVerticalPositioning = ({
  rowIndex,
  columnIndex,
  rowHeight: height,
}: {
  rowIndex: number;
  columnIndex: number;
  rowHeight: number;
}): number => {
  return (
    calculateHeightIncrease(columnIndex, rowIndex, height) +
    calculateVerticalStartingPoint(columnIndex, height)
  );
};

export const calculatePositionOfFinalGame = (
  rowIndex: number,
  columnIndex: number,
  {
    canvasPadding,
    rowHeight,
    columnWidth,
    gameHeight,
    upperBracketHeight,
    lowerBracketHeight,
    offsetX = 0,
    offsetY = 0,
  }: {
    canvasPadding: number;
    rowHeight: number;
    columnWidth: number;
    gameHeight: number;
    upperBracketHeight: number;
    lowerBracketHeight: number;
    offsetX?: number;
    offsetY?: number;
  }
): { x: number; y: number } => {
  const yResult =
    gameHeight * (lowerBracketHeight / upperBracketHeight) - rowHeight;

  return {
    x: columnIndex * columnWidth + canvasPadding + offsetX,
    y: yResult + canvasPadding + offsetY,
  };
};

export const calculatePositionOfMatchUpperBracket = (
  rowIndex: number,
  columnIndex: number,
  { canvasPadding, rowHeight, columnWidth, offsetX = 0, offsetY = 0 }: {
    canvasPadding: number;
    rowHeight: number;
    columnWidth: number;
    offsetX?: number;
    offsetY?: number;
  }
): { x: number; y: number } => {
  const yResult = calculateVerticalPositioning({
    rowHeight,
    rowIndex,
    columnIndex,
  });

  const skipStep = (index: number): number => Math.floor((index + 1) * 2) - 3;

  const xResult =
    columnIndex === 0 || columnIndex === 1
      ? columnIndex * columnWidth
      : skipStep(columnIndex) * columnWidth;

  return {
    x: xResult + canvasPadding + offsetX,
    y: yResult + canvasPadding + offsetY,
  };
};

export const returnLowerBracketColumnIndex = (columnIndex: number): number =>
  Math.ceil((columnIndex + 1) / 2) - 1;

export const calculatePositionOfMatchLowerBracket = (
  rowIndex: number,
  columnIndex: number,
  { canvasPadding, rowHeight, columnWidth, offsetX = 0, offsetY = 0 }: {
    canvasPadding: number;
    rowHeight: number;
    columnWidth: number;
    offsetX?: number;
    offsetY?: number;
  }
): { x: number; y: number } => {
  const result = calculateVerticalPositioning({
    rowHeight,
    rowIndex,
    columnIndex: returnLowerBracketColumnIndex(columnIndex),
  });

  return {
    x: columnIndex * columnWidth + canvasPadding + offsetX,
    y: result + canvasPadding + offsetY,
  };
};
