const NEUTRAL_BADGE =
  "bg-muted text-muted-foreground border-border";

export const ALLERGEN_MAP: Record<
  string,
  { label: string; icon: string; badgeClass: string }
> = {
  gluten: { label: "Gluten", icon: "lucide:wheat", badgeClass: NEUTRAL_BADGE },
  crustaces: { label: "Crustacés", icon: "lucide:waves", badgeClass: NEUTRAL_BADGE },
  oeufs: { label: "Œufs", icon: "lucide:egg", badgeClass: NEUTRAL_BADGE },
  poisson: { label: "Poisson", icon: "lucide:fish", badgeClass: NEUTRAL_BADGE },
  arachides: { label: "Arachides", icon: "lucide:alert-circle", badgeClass: NEUTRAL_BADGE },
  soja: { label: "Soja", icon: "lucide:sprout", badgeClass: NEUTRAL_BADGE },
  lait: { label: "Lait", icon: "lucide:droplets", badgeClass: NEUTRAL_BADGE },
  fruits_coque: { label: "Fruits à coque", icon: "lucide:alert-circle", badgeClass: NEUTRAL_BADGE },
  celeri: { label: "Céleri", icon: "lucide:leaf", badgeClass: NEUTRAL_BADGE },
  moutarde: { label: "Moutarde", icon: "lucide:droplet", badgeClass: NEUTRAL_BADGE },
  sesame: { label: "Sésame", icon: "lucide:circle-dot", badgeClass: NEUTRAL_BADGE },
  sulfites: { label: "Sulfites", icon: "lucide:wine", badgeClass: NEUTRAL_BADGE },
  lupin: { label: "Lupin", icon: "lucide:flower-2", badgeClass: NEUTRAL_BADGE },
  mollusques: { label: "Mollusques", icon: "lucide:waves", badgeClass: NEUTRAL_BADGE },
  porc: { label: "Contient du porc", icon: "lucide:beef", badgeClass: NEUTRAL_BADGE },
  vegan: { label: "Vegan", icon: "lucide:leaf", badgeClass: NEUTRAL_BADGE },
  vegetarien: { label: "Végétarien", icon: "lucide:leaf", badgeClass: NEUTRAL_BADGE },
};

export function getAllergenInfo(value: string) {
  return (
    ALLERGEN_MAP[value] ?? {
      label: value,
      icon: "lucide:alert-circle",
      badgeClass: NEUTRAL_BADGE,
    }
  );
}
