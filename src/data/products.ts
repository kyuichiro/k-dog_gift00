import { Product } from '../types';

export const sampleProducts: Product[] = [
  {
    id: 'p1',
    code: 'G-101',
    name: '極上 松阪牛 すき焼き用（400g）',
    category: 'gourmet',
    categoryLabel: 'グルメ',
    description: '選び抜かれた三重県産松阪牛。豊かな香りと、口の中でとろけるようなキメ細やかな霜降りの旨みをご堪能いただけます。冷凍便でお届けします。',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80' // 肉料理イメージ
  },
  {
    id: 'p2',
    code: 'G-102',
    name: '山形県産 さくらんぼ 佐藤錦（500g）',
    category: 'gourmet',
    categoryLabel: 'グルメ',
    description: '「果樹園のルビー」とも呼ばれるさくらんぼの王様、佐藤錦。甘みと酸味のバランスが抜群で、みずみずしい旬の味わいをお届けします。',
    image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80' // さくらんぼイメージ
  },
  {
    id: 'p3',
    code: 'G-103',
    name: '老舗窯元 宇治抹茶＆和菓子アソート',
    category: 'gourmet',
    categoryLabel: 'グルメ',
    description: '京都・宇治の香り高い抹茶と、伝統ある和菓子職人が作り上げた上品な甘さの最中、羊羹の詰め合わせセットです。お茶会にも最適です。',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80' // 和菓子・抹茶イメージ
  },
  {
    id: 'p4',
    code: 'Z-201',
    name: '今治プレミアム極細極やわらかオーガニックタオルセット',
    category: 'goods',
    categoryLabel: '雑貨・暮らし',
    description: '日本が誇るタオルの産地「今治」で作られた極上のオーガニックコットンタオル。高い吸水性と、肌を優しく包み込むふわふわの感触が特徴です。',
    image: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&w=600&q=80' // タオル・クリーンなイメージ
  },
  {
    id: 'p5',
    code: 'Z-202',
    name: '江戸切子 伝統工芸士謹製 ペア冷酒グラス',
    category: 'goods',
    categoryLabel: '雑貨・暮らし',
    description: '熟練のカット技術により、光を受けてキラキラと輝く美しい模様が刻まれた伝統工芸「江戸切子」のペア冷酒グラス。特別な晩酌の時間を演出します。',
    image: 'https://images.unsplash.com/photo-1574926053821-79c5e338a933?auto=format&fit=crop&w=600&q=80' // グラスイメージ
  },
  {
    id: 'p6',
    code: 'Z-203',
    name: '栃木レザー 職人の手縫いマルチブックカバー',
    category: 'goods',
    categoryLabel: '雑貨・暮らし',
    description: '日本最高峰のヌメ革「栃木レザー」を使用し、職人が一点ずつ丁寧に仕立てた経年変化を楽しめるブックカバー。使うほどに手になじみます。',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80' // 本・レザーイメージ
  },
  {
    id: 'p7',
    code: 'E-301',
    name: '名湯の旅 箱根 富士を望む日帰り貸切露天風呂ペア御招待券',
    category: 'experience',
    categoryLabel: '体験ギフト',
    description: '富士山を一望できる箱根の一流宿で、極上の温泉と和食会席膳ランチを心ゆくまでお楽しみいただける特別なペア日帰り温泉日帰りチケットです。',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80' // 温泉・スパイメージ
  },
  {
    id: 'p8',
    code: 'E-302',
    name: '東京ベイ クルージングディナー ペア乗船券',
    category: 'experience',
    categoryLabel: '体験ギフト',
    description: '東京湾の夜景を眺めながら、一流シェフによるフレンチのフルコースを贅沢に味わう約2時間のナイトクルーズ。大切な人とのアニバーサリーに。',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80' // クルーズ・ディナーイメージ（夜景）
  },
  {
    id: 'p9',
    code: 'E-303',
    name: 'プライベート陶芸体験 ２名様 創作レッスン付き',
    category: 'experience',
    categoryLabel: '体験ギフト',
    description: 'プロの陶芸家によるプライベートレッスン。お好きな器（湯呑や小鉢など）をろくろで成形・絵付けする、心静かに土と向き合う創作のひととき。',
    image: 'https://images.unsplash.com/photo-1565192647048-f997ded87958?auto=format&fit=crop&w=600&q=80' // 陶芸・手仕事イメージ
  }
];

export function findProductByCode(code: string): Product | undefined {
  const cleanCode = code.trim().toUpperCase();
  return sampleProducts.find(p => p.code === cleanCode);
}
