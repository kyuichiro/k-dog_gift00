import React, { useState } from 'react';
import { Search, Grid, Eye, CheckCircle, Home, Mail, ChevronDown, Check, Loader2, Award, Info } from 'lucide-react';
import { sampleProducts } from '../data/products';
import { fetchAddressByPostalCode, saveSubmission } from '../utils';
import { Product, CatalogSubmission } from '../types';

interface FormCInteractiveProps {
  onSuccess: (submission: CatalogSubmission) => void;
}

export default function FormCInteractive({ onSuccess }: FormCInteractiveProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'gourmet' | 'goods' | 'experience'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // お届け先情報
  const [name, setName] = useState('');
  const [kana, setKana] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // エラー、検索ローディング
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [postalError, setPostalError] = useState('');
  const [isSearchingPostal, setIsSearchingPostal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // カテゴリでフィルタリングされた商品
  const filteredProducts = selectedCategory === 'all'
    ? sampleProducts
    : sampleProducts.filter(p => p.category === selectedCategory);

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    setDetailProduct(null); // モーダルが開いていたら閉じる
    
    // スムーズに入力フォームまでスクロール
    setTimeout(() => {
      document.getElementById('recipient-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handlePostalSearch = async () => {
    setPostalError('');
    if (!postalCode) {
      setPostalError('郵便番号を入力してください。');
      return;
    }
    
    setIsSearchingPostal(true);
    try {
      const addr = await fetchAddressByPostalCode(postalCode);
      setAddress(addr);
    } catch (err: any) {
      setPostalError(err.message || '住所が取得できませんでした。');
    } finally {
      setIsSearchingPostal(false);
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!selectedProduct) {
      errors.product = 'お届け先を入力する前に、まずは上記カタログより商品を選択してください。';
    }
    if (!name.trim()) errors.name = 'お名前は必須です。';
    if (!kana.trim()) {
      errors.kana = 'フリガナは必須です。';
    } else if (!/^[ァ-ヶー\s]+$/.test(kana.trim())) {
      errors.kana = '全角カタカナで入力してください。';
    }

    if (!postalCode.trim()) {
      errors.postalCode = '郵便番号は必須です。';
    } else if (!/^\d{3}-?\d{4}$/.test(postalCode.trim())) {
      errors.postalCode = '正しい郵便番号（例：123-4567）で入力してください。';
    }

    if (!address.trim()) errors.address = 'ご住所は必須です。';
    
    if (!phone.trim()) {
      errors.phone = '電話番号は必須です。';
    } else if (!/^\d{10,11}$/.test(phone.replace(/[^\d]/g, ''))) {
      errors.phone = '電話番号は10桁または11桁の数字で入力してください。';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'メールアドレスの形式が正しくありません。';
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    if (!selectedProduct) return;

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const submission = saveSubmission({
          formType: 'interactive',
          formTypeLabel: 'WEBカタログ一体型',
          productCode: selectedProduct.code,
          productName: selectedProduct.name,
          recipientName: name.trim(),
          recipientKana: kana.trim(),
          postalCode: postalCode.trim(),
          address: address.trim(),
          phone: phone.trim().replace(/[^\d]/g, ''),
          email: email.trim(),
          notes: notes.trim() || undefined
        });
        onSuccess(submission);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }, 1000);
  };

  return (
    <div id="form-c-container" className="space-y-8 max-w-4xl mx-auto">
      
      {/* ================= 商品カタログセクション ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="p-1 bg-blue-100 text-blue-700 rounded-lg"><Grid className="w-5 h-5" /></span>
              WEBカタログギフト
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              お好きな商品を選び、「この商品にする」ボタンを押してください。その場で送付先情報の入力画面が開きます。
            </p>
          </div>

          {/* カテゴリフィルター */}
          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 font-bold">
            {(['all', 'gourmet', 'goods', 'experience'] as const).map((cat) => {
              const labels = { all: 'すべて', gourmet: 'グルメ', goods: '雑貨', experience: '体験' };
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {labels[cat]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 商品グリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => {
            const isSelected = selectedProduct?.id === p.id;
            return (
              <div
                key={p.id}
                className={`group bg-white border rounded-xl overflow-hidden shadow-2xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between ${
                  isSelected ? 'ring-2 ring-blue-600 border-transparent bg-blue-50/5' : 'border-slate-200'
                }`}
              >
                {/* 画像エリア */}
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={p.image}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 text-[10px] font-bold bg-slate-900/85 backdrop-blur-xs text-white px-2 py-0.5 rounded">
                    {p.categoryLabel}
                  </span>
                  
                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center backdrop-blur-xs">
                      <div className="bg-white text-blue-700 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md animate-scaleUp">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        選択中
                      </div>
                    </div>
                  )}

                  {/* 詳細ズームボタン */}
                  <button
                    type="button"
                    onClick={() => setDetailProduct(p)}
                    className="absolute bottom-2 right-2 p-1.5 bg-white/90 hover:bg-white text-slate-700 rounded-lg shadow-xs hover:shadow-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                    title="詳細を見る"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* 情報エリア */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-slate-400 font-bold tracking-wider">{p.code}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailProduct(p)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-0.5 transition-colors cursor-pointer"
                    >
                      詳細を見る
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectProduct(p)}
                      className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                      }`}
                    >
                      {isSelected ? '選択済み' : 'この商品にする'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= お届け先入力セクション（商品選択後に連動表示） ================= */}
      <div
        id="recipient-form-section"
        className={`transition-all duration-500 ${
          selectedProduct ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-70 transform translate-y-2'
        }`}
      >
        <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
          
          {/* ヘッダー */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">お届け先のお手続き</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ご希望商品のご送付先情報を入力してください。
                </p>
              </div>
            </div>

            {selectedProduct ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 flex items-center gap-3 max-w-sm">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 object-cover rounded-md border border-blue-100"
                />
                <div className="min-w-0">
                  <span className="text-[9px] font-mono font-bold bg-blue-100 text-blue-800 px-1 py-0.25 rounded">
                    {selectedProduct.code}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 truncate mt-0.5">{selectedProduct.name}</h4>
                </div>
              </div>
            ) : (
              <div className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                まずは上のWEBカタログから商品を選択してください
              </div>
            )}
          </div>

          {/* フォーム入力部 */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {addressErrors.product && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">⚠️ {addressErrors.product}</p>
            )}

            <div className={`space-y-4 ${!selectedProduct ? 'pointer-events-none opacity-50' : ''}`}>
              
              {/* 名前 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inter-name" className="block text-xs font-bold text-slate-600 mb-1">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="inter-name"
                    type="text"
                    disabled={!selectedProduct}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例：高橋 茂"
                    className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                  {addressErrors.name && (
                    <p className="text-xs text-red-600 mt-1">⚠️ {addressErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="inter-kana" className="block text-xs font-bold text-slate-600 mb-1">
                    フリガナ（カタカナ） <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="inter-kana"
                    type="text"
                    disabled={!selectedProduct}
                    value={kana}
                    onChange={(e) => setKana(e.target.value)}
                    placeholder="例：タカハシ シゲル"
                    className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                  {addressErrors.kana && (
                    <p className="text-xs text-red-600 mt-1">⚠️ {addressErrors.kana}</p>
                  )}
                </div>
              </div>

              {/* 郵便番号 */}
              <div>
                <label htmlFor="inter-postalCode" className="block text-xs font-bold text-slate-600 mb-1">
                  郵便番号 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="inter-postalCode"
                    type="text"
                    maxLength={8}
                    disabled={!selectedProduct}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="例：460-0001"
                    className="flex-1 text-sm bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    disabled={!selectedProduct || isSearchingPostal}
                    onClick={handlePostalSearch}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg px-4 py-2.5 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {isSearchingPostal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    住所を検索して補完
                  </button>
                </div>
                {postalError && (
                  <p className="text-xs text-red-600 mt-1">⚠️ {postalError}</p>
                )}
                {addressErrors.postalCode && (
                  <p className="text-xs text-red-600 mt-1">⚠️ {addressErrors.postalCode}</p>
                )}
              </div>

              {/* 住所 */}
              <div>
                <label htmlFor="inter-address" className="block text-xs font-bold text-slate-600 mb-1">
                  ご住所 <span className="text-red-500">*</span>
                </label>
                <input
                  id="inter-address"
                  type="text"
                  disabled={!selectedProduct}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="例：愛知県名古屋市中区三の丸1丁目1-1 名古屋レジデンス 1002"
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
                {addressErrors.address && (
                  <p className="text-xs text-red-600 mt-1">⚠️ {addressErrors.address}</p>
                )}
              </div>

              {/* 電話 & メール */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inter-phone" className="block text-xs font-bold text-slate-600 mb-1">
                    電話番号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="inter-phone"
                    type="tel"
                    disabled={!selectedProduct}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="例：0521112222"
                    className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                  {addressErrors.phone && (
                    <p className="text-xs text-red-600 mt-1">⚠️ {addressErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="inter-email" className="block text-xs font-bold text-slate-400 flex items-center justify-between mb-1">
                    <span className="text-slate-600">メールアドレス</span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-normal">任意</span>
                  </label>
                  <input
                    id="inter-email"
                    type="email"
                    disabled={!selectedProduct}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="例：shigeru@example.com"
                    className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                  {addressErrors.email && (
                    <p className="text-xs text-red-600 mt-1">⚠️ {addressErrors.email}</p>
                  )}
                </div>
              </div>

              {/* 備考欄 */}
              <div>
                <label htmlFor="inter-notes" className="block text-xs font-bold text-slate-400 flex items-center justify-between mb-1">
                  <span className="text-slate-600">備考・配送時のご要望事項</span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-normal">任意</span>
                </label>
                <textarea
                  id="inter-notes"
                  rows={2}
                  disabled={!selectedProduct}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="例：不在時は宅配ボックスへお願いします。結婚祝いの内祝いとして申し込みます。"
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
              </div>

            </div>

            {/* 送信ボタン */}
            <div className="pt-4 border-t border-slate-100 flex justify-center">
              <button
                type="submit"
                disabled={!selectedProduct || isSubmitting}
                className="w-full sm:w-80 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 text-white font-bold text-base rounded-xl py-4 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    お申込みを完了中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    お申込み内容を確定する
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ================= 商品詳細ポップアップ（モーダル） ================= */}
      {detailProduct && (
        <div className="fixed inset-0 bg-slate-900/65 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-scaleUp">
            <img
              src={detailProduct.image}
              alt={detailProduct.name}
              referrerPolicy="no-referrer"
              className="w-full h-56 sm:h-64 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                  {detailProduct.categoryLabel}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">商品コード：{detailProduct.code}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3">{detailProduct.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {detailProduct.description}
              </p>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setDetailProduct(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:bg-slate-200 px-4 py-2 rounded-lg transition-all cursor-pointer"
                >
                  閉じる
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectProduct(detailProduct)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  この商品を選択する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
