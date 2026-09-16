// Curated high-quality, male-centric and alpha aesthetics: Supercars, Knights, Marvel, GoT/HoTD, Famous Footballers & Legends
export const PREMIUM_AVATARS = [
  // === SUPER CARS & LUXURY VEHICLES ===
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=240&auto=format&fit=crop&q=80", // Porsche 911 Sportscar
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=240&auto=format&fit=crop&q=80", // Red Ferrari Supercar
  "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=240&auto=format&fit=crop&q=80", // Lamborghini Aventador
  "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=240&auto=format&fit=crop&q=80", // Porsche GT3 Custom
  "https://images.unsplash.com/photo-1612461947833-2bfb822d10f9?w=240&auto=format&fit=crop&q=80", // Nissan GT-R
  "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=240&auto=format&fit=crop&q=80", // Ford Mustang Shelby GT500
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=240&auto=format&fit=crop&q=80", // Matte Black BMW M8
  "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=240&auto=format&fit=crop&q=80", // Audi R8 V10
  "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=240&auto=format&fit=crop&q=80", // Aston Martin Vantage

  // === KNIGHTS & GOT / HOUSE OF THE DRAGON WARRIORS ===
  "https://images.unsplash.com/photo-1599824425712-efc8d9be2533?w=240&auto=format&fit=crop&q=80", // Epic Iron Knight with Sword (GoT style)
  "https://images.unsplash.com/photo-1559650656-5d1d361ad10e?w=240&auto=format&fit=crop&q=80", // Steel Armor Royal Knight
  "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?w=240&auto=format&fit=crop&q=80", // Dark Knight holding a broadsword
  "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=240&auto=format&fit=crop&q=80", // Golden Crest Knight helmet
  "https://images.unsplash.com/photo-1519074069444-1ba4e6664104?w=240&auto=format&fit=crop&q=80", // Warrior king standing in fantasy light
  "https://images.unsplash.com/photo-1614850523011-8f49fc9ece67?w=240&auto=format&fit=crop&q=80", // Golden Dragon emblem (House of the Dragon)
  "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=240&auto=format&fit=crop&q=80", // Iron Throne / Castle background vibe

  // === MARVEL HEROES ===
  "https://images.unsplash.com/photo-1608889175250-c3b0c1667d3a?w=240&auto=format&fit=crop&q=80", // Iron Man Mark-85 Helmet
  "https://images.unsplash.com/photo-1626278664285-f7c67820a4b7?w=240&auto=format&fit=crop&q=80", // Avengers Captain America Shield
  "https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?w=240&auto=format&fit=crop&q=80", // Spider-Man Marvel Hero
  "https://images.unsplash.com/photo-1585145062827-37c23122c424?w=240&auto=format&fit=crop&q=80", // Black Panther Vibranium suit

  // === FAMOUS FOOTBALLERS & LEGENDS ===
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=240&auto=format&fit=crop&q=80", // Footballer athlete Celebrating Goal
  "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=240&auto=format&fit=crop&q=80", // Football player with No. 10 jersey
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=240&auto=format&fit=crop&q=80", // Live football champion kick
  "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=240&auto=format&fit=crop&q=80", // Gold football boot & ball
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=240&auto=format&fit=crop&q=80", // Suited handsome leading champion (Famous Men)
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80", // Athletic legendary striker portrait
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80", // Elegant glasses leader
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=240&auto=format&fit=crop&q=80"  // Confident smiling champion
];

// Helper to get a stable index hash from any string
function getStringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * Returns a high-quality sports car or celebrity avatar URL from Unsplash.
 * If the original avatar is non-dicebear (e.g. user selected something else specifically or is a premium custom link), we can respect it,
 * otherwise we replace the boring dicebear illustration with a world-class supercar/iconic photo!
 */
export function getPremiumAvatar(userId: string, username?: string, customAvatar?: string): string {
  // If the user has custom-defined avatar matching dicebear, let's swap it for an elite supercar/persona image.
  // Otherwise, if they set a true custom premium photo, we can respect that too.
  const source = username || userId || "default_user";
  const isDicebear = customAvatar && (customAvatar.includes("dicebear.com") || customAvatar.includes("avataaars"));
  const noAvatar = !customAvatar;

  if (noAvatar || isDicebear) {
    const idx = getStringHash(source) % PREMIUM_AVATARS.length;
    return PREMIUM_AVATARS[idx];
  }

  return customAvatar || PREMIUM_AVATARS[0];
}

/**
 * Generates styled initials if we want a letter-badge as requested,
 * but returns gradient color settings for styling.
 */
export function getInitials(displayName: string): string {
  if (!displayName) return "LE";
  const parts = displayName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return displayName.substring(0, 2).toUpperCase();
}

/**
 * Returns a stable gradient for the user profile initials card
 */
export function getInitialsGradient(userId: string): string {
  const gradients = [
    "from-blue-600 to-indigo-700",
    "from-purple-600 to-pink-700",
    "from-emerald-500 to-teal-700",
    "from-orange-500 to-rose-600",
    "from-cyan-500 to-blue-700",
    "from-violet-600 to-fuchsia-700"
  ];
  const idx = getStringHash(userId) % gradients.length;
  return gradients[idx];
}
