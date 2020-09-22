export function pull<T>(arr: T[], value: T) {
  const idx = arr.indexOf(value);
  if (idx !== -1) {
    arr.splice(idx, 1);
  }
}

export function replaceFirst<T>(arr: T[], value: T, nextValue: T) {
  const idx = arr.indexOf(value);
  if (idx !== -1) {
    arr[idx] = nextValue;
  }
}
