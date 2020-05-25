interface IDeferResult {
  (): void;
  flush(): void;
}

export function defer(fn: () => void) {
  let handle = 0;
  const onTimeout = () => {
    handle = 0;
    fn();
  };

  const retval: IDeferResult = (() => {
    if (handle === 0) {
      handle = setTimeout(onTimeout);
    }
  }) as any;

  retval.flush = () => {
    if (handle !== 0) {
      clearTimeout(handle);
      handle = 0;
      fn();
    }
  };

  return retval;
}
