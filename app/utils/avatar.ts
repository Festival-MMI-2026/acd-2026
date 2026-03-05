const HAIR_VARIANTS = Array.from({ length: 48 }, (_, i) =>
  `variant${String(i + 1).padStart(2, "0")}`,
);

const MOUTH_VARIANTS = ["happy01", "happy02", "happy03"];

function seedPick(arr: string[], seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return arr[Math.abs(h) % arr.length]!;
}

export function avatarUrl(name: string): string {
  const trimmed = name.trim() || "user";
  const seed = encodeURIComponent(trimmed);
  const hair = seedPick(HAIR_VARIANTS, trimmed);
  const mouth = seedPick(MOUTH_VARIANTS, trimmed + "m");

  return (
    `https://api.dicebear.com/9.x/lorelei/svg` +
    `?seed=${seed}` +
    `&beardProbability=0` +
    `&earringsProbability=0` +
    `&glassesProbability=0` +
    `&hairAccessoriesProbability=0` +
    `&hair=${hair}` +
    `&mouth=${mouth}` +
    `&nose=variant01,variant02,variant03`
  );
}
