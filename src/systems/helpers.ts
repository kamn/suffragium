export const dedup = (xs: Array<any>): Array<any> => {
  return [...new Set(xs)];
};
