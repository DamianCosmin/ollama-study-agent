export interface AvatarOption {
  id: string;
  name: string;
  url: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { 
    id: "rex-cortex", 
    name: "Rex Cortex", 
    url: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=rex-cortex&backgroundColor=22d3ee&eyesColor=ffffff&mouthColor=ffffff&radius=50"
  },
  { 
    id: "neo-matrix", 
    name: "Neo Matrix", 
    url: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=neo-matrix&backgroundColor=34d399&eyesColor=ffffff&mouthColor=ffffff&radius=50"
  },
  { 
    id: "zoe-flash", 
    name: "Zoe Flash", 
    url: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=zoe-flash&backgroundColor=e879f9&eyesColor=ffffff&mouthColor=ffffff&radius=50"
  },
  { 
    id: "leon-spark", 
    name: "Leon Spark", 
    url: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=leon-spark&backgroundColor=fb923c&eyesColor=ffffff&mouthColor=ffffff&radius=50"
  },
  { 
    id: "finn-flow", 
    name: "Finn Flow", 
    url: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=finn-flowflow&backgroundColor=facc15&eyesColor=ffffff&mouthColor=ffffff&radius=50"
  },
  { 
    id: "zara-node", 
    name: "Zara Node", 
    url: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=zara-node&backgroundColor=c084fc&eyesColor=ffffff&mouthColor=ffffff&radius=50"
  },
];

export const AVATAR_URLS: Record<string, string> = Object.fromEntries(
  AVATAR_OPTIONS.map(avatar => [avatar.id, avatar.url])
);