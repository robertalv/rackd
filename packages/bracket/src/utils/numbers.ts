export const precisionRound = (number: number, precision: number): number => {
  if (Number.isNaN(Number(number))) return number;
  const factor = 10 ** precision;
  return Math.round(number * factor) / factor;
};

export const returnEven = (num: number): number => (num !== 0 ? num - 1 * (num % 2) : 0);
export const returnOdd = (num: number): number => (num !== 0 ? num - 1 + 1 * (num % 2) : 0);
