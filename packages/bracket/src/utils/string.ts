export const sortAlphanumerically = (a: string | undefined, b: string | undefined): number => {
  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base',
  });

  return collator.compare(a ?? '', b ?? '');
};

