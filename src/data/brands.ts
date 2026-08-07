export const brandLogos = {
  Apple: require('../../assets/logos/apple.png'),
  Google: require('../../assets/logos/google.png'),
  Samsung: require('../../assets/logos/samsung.png'),
  OnePlus: require('../../assets/logos/oneplus.png'),
  Xiaomi: require('../../assets/logos/xiaomi.png'),
  Oppo: require('../../assets/logos/oppo.png'),
  Vivo: require('../../assets/logos/vivo.png'),
  IQOO: require('../../assets/logos/iqoo.png'),
  Motorola: require('../../assets/logos/motorola.png'),
  Realme: require('../../assets/logos/realme.png'),
} as const;

export const brandPalette = {
  Apple: '#FFFFFF',
  Google: '#FFFFFF',
  Samsung: '#FFFFFF',
  OnePlus: '#FFFFFF',
  Xiaomi: '#FFFFFF',
  Oppo: '#FFFFFF',
  Vivo: '#FFFFFF',
  IQOO: '#FFFFFF',
  Motorola: '#FFFFFF',
  Realme: '#FFFFFF',
  All: '#F3F4F6',
} as const;

export const brandCategories = [
  { id: 'apple', label: 'Apple', logo: brandLogos.Apple, color: brandPalette.Apple },
  { id: 'samsung', label: 'Samsung', logo: brandLogos.Samsung, color: brandPalette.Samsung },
  { id: 'google', label: 'Google', logo: brandLogos.Google, color: brandPalette.Google },
  { id: 'xiaomi', label: 'Xiaomi', logo: brandLogos.Xiaomi, color: brandPalette.Xiaomi },
  { id: 'oneplus', label: 'OnePlus', logo: brandLogos.OnePlus, color: brandPalette.OnePlus },
  { id: 'vivo', label: 'Vivo', logo: brandLogos.Vivo, color: brandPalette.Vivo },
  { id: 'oppo', label: 'Oppo', logo: brandLogos.Oppo, color: brandPalette.Oppo },
  { id: 'motorola', label: 'Motorola', logo: brandLogos.Motorola, color: brandPalette.Motorola },
  { id: 'iqoo', label: 'iQOO', logo: brandLogos.IQOO, color: brandPalette.IQOO },
  { id: 'realme', label: 'Realme', logo: brandLogos.Realme, color: brandPalette.Realme },
] as const;

export function getBrandLogo(brandName: string) {
  const name = brandName.toLowerCase();
  if (name.includes('apple') || name.includes('iphone')) return brandLogos.Apple;
  if (name.includes('google') || name.includes('pixel')) return brandLogos.Google;
  if (name.includes('samsung')) return brandLogos.Samsung;
  if (name.includes('oneplus')) return brandLogos.OnePlus;
  if (name.includes('xiaomi') || name.includes('mi') || name.includes('poco')) return brandLogos.Xiaomi;
  if (name.includes('oppo')) return brandLogos.Oppo;
  if (name.includes('vivo')) return brandLogos.Vivo;
  if (name.includes('iqoo')) return brandLogos.IQOO;
  if (name.includes('motorola') || name.includes('moto')) return brandLogos.Motorola;
  if (name.includes('realme')) return brandLogos.Realme;
  return null;
}
