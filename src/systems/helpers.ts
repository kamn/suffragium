export const dedup = <T>(xs: Array<T>): Array<T> => {
  return [...new Set(xs)];
};
