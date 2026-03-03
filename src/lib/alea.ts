export default function alea(seed: string): () => number {
  let s0 = mash(seed);
  let s1 = mash(seed);
  let s2 = mash(seed);
  let c = 1;

  function mash(data: string): number {
    let n = 0xefc8249d;
    for (let i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      let h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000;
    }
    return (n >>> 0) * 2.3283064365386963e-10;
  }

  return function () {
    const t = 2091639 * s0 + c * 2.3283064365386963e-10;
    s0 = s1;
    s1 = s2;
    c = t | 0;
    s2 = t - c;
    return s2;
  };
}
