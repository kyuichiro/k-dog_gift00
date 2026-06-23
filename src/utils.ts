import { CatalogSubmission } from './types';

// ローカルストレージキー
const SUBMISSIONS_KEY = 'catalog_gift_submissions';

// 郵便番号から住所を自動取得するAPI
export async function fetchAddressByPostalCode(postalCode: string): Promise<string> {
  // ハイフンを取り除く
  const cleanCode = postalCode.replace(/[^\d]/g, '');
  if (cleanCode.length !== 7) {
    throw new Error('郵便番号は7桁の数字で入力してください。');
  }

  try {
    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanCode}`);
    if (!res.ok) {
      throw new Error('住所の取得に失敗しました。');
    }
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return `${result.address1}${result.address2}${result.address3}`;
    } else {
      throw new Error(data.message || '該当する住所が見つかりませんでした。');
    }
  } catch (error) {
    console.error('Postal code search error:', error);
    throw new Error('通信エラーが発生したか、該当する住所がありません。');
  }
}

// 申し込みデータの保存
export function saveSubmission(submission: Omit<CatalogSubmission, 'id' | 'status' | 'createdAt'>): CatalogSubmission {
  const existing = getSubmissions();
  
  const newSubmission: CatalogSubmission = {
    ...submission,
    id: `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  existing.unshift(newSubmission); // 最新を先頭に
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(existing));
  return newSubmission;
}

// 申し込みデータの取得
export function getSubmissions(): CatalogSubmission[] {
  const data = localStorage.getItem(SUBMISSIONS_KEY);
  if (!data) {
    return [];
  }
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      // 既存の古いデータにカタログ番号がなければ安全に補完する
      return parsed.map((item: any) => ({
        ...item,
        catalogNumber: item.catalogNumber || 'CAT-2026-GOLD'
      }));
    }
    return [];
  } catch (e) {
    return [];
  }
}

// ステータス変更
export function updateSubmissionStatus(id: string, status: 'pending' | 'processing' | 'shipped'): CatalogSubmission[] {
  const submissions = getSubmissions();
  const updated = submissions.map(sub => {
    if (sub.id === id) {
      return { ...sub, status };
    }
    return sub;
  });
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
  return updated;
}

// 申し込みデータの削除
export function deleteSubmission(id: string): CatalogSubmission[] {
  const submissions = getSubmissions();
  const filtered = submissions.filter(sub => sub.id !== id);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(filtered));
  return filtered;
}

// 初期ダミーデータの投入 (履歴がない場合のみ)
export function initializeDummyData() {
  const existing = getSubmissions();
  if (existing.length === 0) {
    const dummy: CatalogSubmission[] = [
      {
        id: 'REQ-1703328000000-456',
        formType: 'simple',
        formTypeLabel: 'ハガキ風ワンページ',
        catalogNumber: 'CAT-2026-GOLD',
        productCode: '10001',
        productName: 'Sippole コトコト煮込んだヤギミルクスープ（12袋セット）',
        recipientName: '佐藤 健太',
        recipientKana: 'サトウ ケンタ',
        postalCode: '100-0001',
        address: '東京都千代田区千代田1-1',
        phone: '090-1234-5678',
        email: 'sato@example.com',
        notes: '午前中指定でお願いします。',
        status: 'shipped',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 3).toISOString() // 3日前
      },
      {
        id: 'REQ-1703329000000-789',
        formType: 'step',
        formTypeLabel: 'ステップ・バイ・ステップ',
        catalogNumber: 'CAT-2026-SILVER',
        productCode: '70001',
        productName: 'Sippole 3WAY消臭お散歩バッグ',
        recipientName: '鈴木 美咲',
        recipientKana: 'スズキ ミサキ',
        postalCode: '530-0001',
        address: '大阪府大阪市北区梅田1丁目1',
        phone: '080-9876-5432',
        email: 'misaki.s@example.com',
        status: 'processing',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1日前
      },
      {
        id: 'REQ-1703330000000-111',
        formType: 'interactive',
        formTypeLabel: 'WEBカタログ一体型',
        catalogNumber: 'CAT-2026-PLATINUM',
        productCode: '80001',
        productName: 'Sippole 2WAYもちふわオーバルベッド',
        recipientName: '高橋 茂',
        recipientKana: 'タカハシ シゲル',
        postalCode: '460-0001',
        address: '愛知県名古屋市中区三の丸1丁目1-1',
        phone: '052-111-2222',
        email: 'shigeru.t@example.com',
        notes: '愛犬のために申し込みます。楽しみです！',
        status: 'pending',
        createdAt: new Date().toISOString() // 今日
      }
    ];
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(dummy));
  }
}
