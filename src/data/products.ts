import { Product } from '../types';
import yagiMilkSoupImg from '../assets/images/yagi_milk_soup_1782242057576.jpg';
import dogWalkBagImg from '../assets/images/dog_walk_bag_1782242071141.jpg';
import dogOvalBedImg from '../assets/images/dog_oval_bed_1782242084396.jpg';

export const sampleProducts: Product[] = [
  {
    id: 'p1',
    code: '10001',
    name: 'Sippole コトコト煮込んだヤギミルクスープ（12袋セット）',
    category: 'gourmet',
    categoryLabel: 'フード・グルメ',
    description: 'やわらかい国産お肉（ささみ・鹿肉・まぐろ）を使用した愛犬用スープセット。ドライフードにトッピングしたり、お出かけ時の水分補給や栄養補給に最適です。（55g×12袋、日本製）',
    image: yagiMilkSoupImg
  },
  {
    id: 'p2',
    code: '70001',
    name: 'Sippole 3WAY消臭お散歩バッグ',
    category: 'goods',
    categoryLabel: 'おでかけ・雑貨',
    description: 'リュック、ショルダー、手提げの3WAYで使える多機能バッグ。消臭機能付きネームがついており、お散歩中のニオイを軽減。軽量でポケットも多く収納力抜群です。',
    image: dogWalkBagImg
  },
  {
    id: 'p3',
    code: '80001',
    name: 'Sippole 2WAYもちふわオーバルベッド',
    category: 'experience',
    categoryLabel: 'くつろぎ・ベッド',
    description: 'もちもちでフワフワな優しい触り心地の犬用オーバルベッド。丸くなって眠る愛犬の体に優しくフィットし、包み込まれるような安心感を提供します。（リバーシブル仕様）',
    image: dogOvalBedImg
  }
];

export function findProductByCode(code: string): Product | undefined {
  if (!code) return undefined;
  const cleanCode = code.trim().toUpperCase();
  return sampleProducts.find(p => p.code === cleanCode);
}
