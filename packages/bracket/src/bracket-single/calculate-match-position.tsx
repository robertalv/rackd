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

export const calculatePositionOfMatch = (
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
    columnIndex,
  });

  return {
    x: columnIndex * columnWidth + canvasPadding + offsetX,
    y: result + canvasPadding + offsetY,
  };
};
