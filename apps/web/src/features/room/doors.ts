export interface DoorColors {
  /** Active: arch border */          arch:        string;
  /** Inactive: arch border */        archDim:     string;
  /** Active: tile/pattern lines */   tile:        string;
  /** Inactive: tile/pattern lines */ tileDim:     string;
  /** Active: crown accent */         crown:       string;
  /** Inactive: crown accent */       crownDim:    string;
  /** Interior fill tint (both) */    fill:        string;
  /** Active CSS drop-shadow color */ glow:        string;
  /** Falling-streak color override (defaults to arch) */ streakColor?: string;
  /** Radial bloom color override — set to #020203 to suppress bloom */ bloomColor?: string;
}

export interface Door {
  id:      string;
  label:   string;
  labelAr: string;
  colors:  DoorColors;
  implemented?: boolean;
}

const ALL_DOORS: Door[] = [
  {
    id: "knowledge", label: "Knowledge", labelAr: "المعرفة", implemented: true,
    colors: {
      // Indigo/cobalt — ink, scholarship, the written word
      arch: "#6080c0", archDim: "#1e2a52",
      tile: "#304080", tileDim: "#101828",
      crown: "#4a6098", crownDim: "#152040",
      fill: "#08080f", glow: "rgba(96,128,192,0.32)",
    },
  },
  {
    id: "understanding", label: "Understanding", labelAr: "الفهم",
    colors: {
      // Steel blue — archival, documentary, cold clarity
      arch: "#4888a8", archDim: "#1a3448",
      tile: "#285068", tileDim: "#0e1c28",
      crown: "#306080", crownDim: "#122838",
      fill: "#080f10", glow: "rgba(72,136,168,0.32)",
    },
  },
  {
    id: "grief", label: "Grief", labelAr: "الحزن",
    colors: {
      // Black — grief has no color
      arch: "#5a5a5a", archDim: "#222222",
      tile: "#383838", tileDim: "#141414",
      crown: "#444444", crownDim: "#1a1a1a",
      fill: "#060606", glow: "rgba(120,120,120,0.28)",
      streakColor: "#ff2020", bloomColor: "#020203",
    },
  },
  {
    id: "joy", label: "Joy", labelAr: "الفرح",
    colors: {
      // Warm rose — cinema warmth, fiction read by lamplight
      arch: "#c06888", archDim: "#5a2038",
      tile: "#803050", tileDim: "#2a1020",
      crown: "#984860", crownDim: "#401828",
      fill: "#0f080a", glow: "rgba(192,104,136,0.32)",
    },
  },
  {
    id: "safety", label: "Safety", labelAr: "أمان", implemented: true,
    colors: {
      // White/pearl — the false peace, the empty room
      arch: "#d0d0d0", archDim: "#707070",
      tile: "#b0b0b0", tileDim: "#3a3a3a",
      crown: "#c0c0c0", crownDim: "#505050",
      fill: "#ececec", glow: "rgba(220,220,220,0.55)",
      bloomColor: "#a0a0a0",
    },
  },
  {
    id: "chaos", label: "Chaos", labelAr: "الفوضى",
    colors: {
      // Crimson — the deluge, flood, overwhelm
      arch: "#b83030", archDim: "#4a1010",
      tile: "#781818", tileDim: "#220808",
      crown: "#901020", crownDim: "#360e0e",
      fill: "#100606", glow: "rgba(184,48,48,0.32)",
    },
  },
  {
    id: "strength", label: "Strength", labelAr: "القوة",
    colors: {
      // Forest green — endurance, life that persists
      arch: "#50a870", archDim: "#1a4028",
      tile: "#286040", tileDim: "#0e2018",
      crown: "#388050", crownDim: "#122e1e",
      fill: "#080f09", glow: "rgba(80,168,112,0.32)",
    },
  },
  {
    id: "hope", label: "Hope", labelAr: "الأمل",
    colors: {
      // Dawn gold — sunrise, first light, the color of what was won
      arch: "#d08848", archDim: "#5a3018",
      tile: "#904830", tileDim: "#2c1808",
      crown: "#a86030", crownDim: "#402210",
      fill: "#100a04", glow: "rgba(208,136,72,0.32)",
    },
  },
];

export const DOORS: Door[] = ALL_DOORS.filter(d => d.implemented);
