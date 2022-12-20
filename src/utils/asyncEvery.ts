const asyncEvery = async (
  arr: Array<any>,
  predicate: (e: any) => Promise<boolean>
) => {
  for (let e of arr) {
    if (!(await predicate(e))) return false;
  }
  return true;
};

export default asyncEvery;
