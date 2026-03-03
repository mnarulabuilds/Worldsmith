import type {
  BiomeType,
  SemanticWorld,
  TimeOfDay,
  Weather,
  FeatureConfig,
  ParticleType,
} from "./types";
import { BIOME_DEFINITIONS } from "./biomes";

const BIOME_KEYWORDS: Record<BiomeType, string[]> = {
  forest: [
    "forest", "woods", "woodland", "timber", "grove", "thicket",
    "sylvan", "arboreal", "trees", "canopy", "glade", "copse",
  ],
  desert: [
    "desert", "sand", "dune", "arid", "sahara", "oasis", "barren",
    "scorched", "dry", "wasteland", "badlands", "dusty",
  ],
  arctic: [
    "arctic", "ice", "frozen", "tundra", "glacier", "polar", "frost",
    "snow", "blizzard", "winter", "cold", "frigid", "icy", "permafrost",
  ],
  ocean: [
    "ocean", "sea", "underwater", "marine", "aquatic", "deep sea",
    "coral reef", "reef", "abyss", "nautical", "tidal", "submerged",
  ],
  volcanic: [
    "volcanic", "volcano", "lava", "magma", "fire", "infernal",
    "molten", "eruption", "caldera", "basalt", "obsidian", "hellfire",
    "hell", "inferno", "fiery", "burning",
  ],
  alien: [
    "alien", "extraterrestrial", "xenomorph", "otherworldly", "strange",
    "bizarre", "exotic", "bioluminescent", "spore", "fungal",
    "mycelium", "tentacle", "organic", "mutation",
  ],
  crystal: [
    "crystal", "gem", "gemstone", "prismatic", "quartz", "amethyst",
    "diamond", "jewel", "luminous", "faceted", "geode", "mineral",
    "crystalline", "prism",
  ],
  cyberpunk: [
    "cyberpunk", "neon", "cyber", "digital", "futuristic", "dystopian",
    "tech", "hologram", "synthetic", "chrome", "circuit", "grid",
    "metropolis", "skyscraper", "city", "urban", "downtown",
  ],
  meadow: [
    "meadow", "field", "grassland", "prairie", "pasture", "pastoral",
    "wildflower", "rolling hills", "countryside", "serene", "peaceful",
    "gentle", "idyllic",
  ],
  swamp: [
    "swamp", "marsh", "bog", "wetland", "fen", "mire", "bayou",
    "murky", "dank", "mossy", "rotting", "stagnant", "humid",
  ],
  canyon: [
    "canyon", "gorge", "ravine", "cliff", "mesa", "butte", "plateau",
    "chasm", "crevice", "sandstone", "eroded", "layered",
  ],
  space: [
    "space", "cosmic", "galaxy", "nebula", "asteroid", "moon", "lunar",
    "planet", "star", "celestial", "void", "interstellar", "astral",
    "orbit", "zero gravity",
  ],
  tropical: [
    "tropical", "jungle", "rainforest", "paradise", "island", "palm",
    "lagoon", "exotic", "lush", "humid", "equatorial", "mangrove",
    "beach", "shore", "coast",
  ],
  mountains: [
    "mountain", "peak", "summit", "alpine", "highland", "ridge",
    "cliff", "crag", "rocky", "towering", "elevation", "altitude",
    "range", "sierra", "himalaya", "everest",
  ],
};

const TIME_KEYWORDS: Record<TimeOfDay, string[]> = {
  dawn: ["dawn", "sunrise", "morning", "daybreak", "first light", "early"],
  day: ["day", "noon", "midday", "afternoon", "bright", "sunny", "sunlit"],
  dusk: ["dusk", "sunset", "evening", "twilight", "golden hour", "late"],
  night: ["night", "midnight", "dark", "nocturnal", "moonlit", "starlit"],
};

const WEATHER_KEYWORDS: Record<Weather, string[]> = {
  clear: ["clear", "sunny", "bright", "calm", "serene", "pleasant"],
  foggy: ["fog", "foggy", "mist", "misty", "haze", "hazy", "murky", "shrouded"],
  stormy: ["storm", "stormy", "thunder", "lightning", "tempest", "turbulent", "violent"],
  snowy: ["snow", "snowy", "blizzard", "flurry", "whiteout", "frost"],
  rainy: ["rain", "rainy", "drizzle", "downpour", "wet", "shower"],
};

const FEATURE_KEYWORDS: Record<string, string[]> = {
  tree_pine: ["pine", "conifer", "evergreen", "spruce", "fir"],
  tree_oak: ["oak", "deciduous", "broadleaf", "ancient tree"],
  tree_palm: ["palm", "coconut", "tropical tree"],
  tree_dead: ["dead tree", "withered", "skeletal tree", "bare tree"],
  rock: ["rock", "stone", "pebble"],
  boulder: ["boulder", "monolith", "megalith"],
  crystal: ["crystal", "gem", "shard", "prism"],
  crystal_cluster: ["crystal cluster", "geode", "crystal formation"],
  building: ["building", "house", "structure", "cabin", "hut"],
  ruin: ["ruin", "ruins", "ancient", "temple", "remnant", "crumbling"],
  mushroom: ["mushroom", "fungus", "toadstool"],
  mushroom_giant: ["giant mushroom", "huge mushroom", "towering mushroom"],
  coral: ["coral", "reef", "anemone"],
  cactus: ["cactus", "succulent", "prickly"],
  flower: ["flower", "bloom", "blossom", "petal", "wildflower", "rose", "lily"],
  floating_island: ["floating island", "floating", "levitating", "hovering"],
  tower: ["tower", "spire", "obelisk", "beacon"],
  pillar: ["pillar", "column", "stalagmite", "stalactite"],
  ice_spike: ["ice spike", "icicle", "ice formation", "frozen spike"],
  lava_rock: ["lava rock", "volcanic rock", "obsidian", "basalt"],
};

const TERRAIN_MODIFIERS: { pattern: RegExp; apply: (t: Record<string, number>) => void }[] = [
  {
    pattern: /\b(towering|massive|enormous|huge|giant|tall|high|steep)\b/i,
    apply: (t) => { t.amplitude = (t.amplitude || 10) * 1.6; t.ridgeFactor = Math.min(1, (t.ridgeFactor || 0) + 0.2); },
  },
  {
    pattern: /\b(flat|gentle|rolling|low|smooth|soft|calm)\b/i,
    apply: (t) => { t.amplitude = (t.amplitude || 10) * 0.5; t.plateauFactor = Math.min(1, (t.plateauFactor || 0) + 0.3); },
  },
  {
    pattern: /\b(jagged|sharp|rugged|rough|craggy|broken)\b/i,
    apply: (t) => { t.ridgeFactor = Math.min(1, (t.ridgeFactor || 0) + 0.4); t.erosion = Math.max(0, (t.erosion || 0.3) - 0.2); },
  },
  {
    pattern: /\b(eroded|weathered|worn|ancient|old)\b/i,
    apply: (t) => { t.erosion = Math.min(1, (t.erosion || 0.3) + 0.3); },
  },
  {
    pattern: /\b(vast|expansive|endless|infinite|wide|open)\b/i,
    apply: (t) => { t.frequency = (t.frequency || 0.01) * 0.6; },
  },
  {
    pattern: /\b(dense|thick|crowded|packed|cluttered)\b/i,
    apply: (t) => { t.frequency = (t.frequency || 0.01) * 1.5; },
  },
];

function scoreBiome(input: string, keywords: string[]): number {
  const lower = input.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (kw.includes(" ")) {
      if (lower.includes(kw)) score += 3;
    } else {
      const regex = new RegExp(`\\b${kw}\\b`, "i");
      if (regex.test(lower)) score += 2;
    }
  }
  return score;
}

function detectBiome(input: string): BiomeType {
  let bestBiome: BiomeType = "meadow";
  let bestScore = 0;

  for (const [biome, keywords] of Object.entries(BIOME_KEYWORDS)) {
    const score = scoreBiome(input, keywords);
    if (score > bestScore) {
      bestScore = score;
      bestBiome = biome as BiomeType;
    }
  }

  return bestBiome;
}

function detectTimeOfDay(input: string): TimeOfDay | null {
  const lower = input.toLowerCase();
  for (const [time, keywords] of Object.entries(TIME_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return time as TimeOfDay;
    }
  }
  return null;
}

function detectWeather(input: string): Weather | null {
  const lower = input.toLowerCase();
  for (const [weather, keywords] of Object.entries(WEATHER_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return weather as Weather;
    }
  }
  return null;
}

function detectExtraFeatures(input: string): FeatureConfig[] {
  const lower = input.toLowerCase();
  const extras: FeatureConfig[] = [];
  const seen = new Set<string>();

  for (const [featureType, keywords] of Object.entries(FEATURE_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw) && !seen.has(featureType)) {
        seen.add(featureType);
        extras.push({
          type: featureType as FeatureConfig["type"],
          density: 0.1,
          minScale: 0.5,
          maxScale: 1.5,
          emissive: featureType.includes("crystal") || featureType === "mushroom_giant",
        });
        break;
      }
    }
  }

  return extras;
}

function detectParticleOverride(input: string): ParticleType | null {
  const lower = input.toLowerCase();
  if (/\b(snow|blizzard|flurry)\b/.test(lower)) return "snow";
  if (/\b(rain|drizzle|downpour)\b/.test(lower)) return "rain";
  if (/\b(fire|ember|ash|burning)\b/.test(lower)) return "embers";
  if (/\b(firefl|glow|luminous)\b/.test(lower)) return "fireflies";
  if (/\b(spore|pollen|mycelium)\b/.test(lower)) return "spores";
  if (/\b(dust|sand|wind)\b/.test(lower)) return "dust";
  return null;
}

function adjustSunPosition(time: TimeOfDay): [number, number, number] {
  switch (time) {
    case "dawn": return [80, 15, 30];
    case "day": return [50, 80, 30];
    case "dusk": return [-60, 15, 40];
    case "night": return [10, -10, 50];
  }
}

export function parsePrompt(prompt: string): SemanticWorld {
  const biome = detectBiome(prompt);
  const def = BIOME_DEFINITIONS[biome];

  const terrain = { ...def.terrain, seed: Math.floor(Math.random() * 100000) };
  const terrainMods: Record<string, number> = { ...terrain };
  for (const mod of TERRAIN_MODIFIERS) {
    if (mod.pattern.test(prompt)) {
      mod.apply(terrainMods);
    }
  }
  terrain.amplitude = terrainMods.amplitude ?? terrain.amplitude;
  terrain.ridgeFactor = terrainMods.ridgeFactor ?? terrain.ridgeFactor;
  terrain.plateauFactor = terrainMods.plateauFactor ?? terrain.plateauFactor;
  terrain.erosion = terrainMods.erosion ?? terrain.erosion;
  terrain.frequency = terrainMods.frequency ?? terrain.frequency;

  const atmosphere = { ...def.atmosphere };
  const timeOverride = detectTimeOfDay(prompt);
  if (timeOverride) {
    atmosphere.timeOfDay = timeOverride;
    atmosphere.sunPosition = adjustSunPosition(timeOverride);
    if (timeOverride === "night") {
      atmosphere.starDensity = Math.max(atmosphere.starDensity, 3000);
      atmosphere.skyTurbidity = Math.min(atmosphere.skyTurbidity, 3);
    }
    if (timeOverride === "dawn" || timeOverride === "dusk") {
      atmosphere.skyTurbidity = Math.max(atmosphere.skyTurbidity, 10);
    }
  }

  const weatherOverride = detectWeather(prompt);
  if (weatherOverride) {
    atmosphere.weather = weatherOverride;
    if (weatherOverride === "foggy") atmosphere.fogDensity = Math.max(atmosphere.fogDensity, 0.04);
    if (weatherOverride === "stormy") atmosphere.cloudCoverage = Math.max(atmosphere.cloudCoverage, 0.8);
    if (weatherOverride === "snowy") atmosphere.cloudCoverage = Math.max(atmosphere.cloudCoverage, 0.6);
  }

  const baseFeatures = def.features.map((f) => ({ ...f }));
  const extraFeatures = detectExtraFeatures(prompt);
  const featureTypes = new Set(baseFeatures.map((f) => f.type));
  for (const extra of extraFeatures) {
    if (!featureTypes.has(extra.type)) {
      baseFeatures.push(extra);
      featureTypes.add(extra.type);
    }
  }

  const particleOverride = detectParticleOverride(prompt);
  const particles = particleOverride ?? def.particles;

  const palette = { ...def.palette, terrain: [...def.palette.terrain] as [string, string, string, string, string] };
  if (timeOverride === "night") {
    palette.ambientIntensity *= 0.4;
    palette.sunIntensity *= 0.3;
  } else if (timeOverride === "dawn" || timeOverride === "dusk") {
    palette.sunColor = "#ff8c42";
    palette.sunIntensity *= 0.8;
  }

  const water = def.water ? { ...def.water } : null;

  const names = def.names;
  const name = names[Math.floor(Math.random() * names.length)];

  return {
    name,
    description: prompt,
    biome,
    terrain,
    water,
    features: baseFeatures,
    atmosphere,
    particles,
    palette,
    camera: { ...def.camera },
  };
}
