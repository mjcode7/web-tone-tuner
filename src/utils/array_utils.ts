export class ArrayUtils {
  public static flattenDeep = (arr) => Array.isArray(arr)
    ? arr.reduce( (a, b) => a.concat(ArrayUtils.flattenDeep(b)) , [])
    : arr;

  public static arrayMove = (arr, old_index, new_index) => {
    if (new_index >= arr.length) {
      let k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
  };

  public static getMedian = (numbers: number[]): number => {
    numbers.sort((a: number, b: number): number => {return a-b});
    const midIndex = Math.floor(numbers.length/2);
    return numbers[midIndex];
  }
}
