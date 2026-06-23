import React, { useState, useEffect } from 'react';
import { Mail, Phone, User, Landmark, HelpCircle, Check, Loader2 } from 'lucide-react';
import { findProductByCode, sampleProducts } from '../data/products';
import { fetchAddressByPostalCode, saveSubmission } from '../utils';
import { Product, CatalogSubmission } from '../types';

interface FormASimpleProps {
  onSuccess: (submission: CatalogSubmission) => void;
}

export default function FormASimple({ onSuccess }: FormASimpleProps) {
  const [catalogNumber, setCatalogNumber] = useState('');
  const [productCode, setProductCode] = useState('');
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  
  const [name, setName] = useState('');
  const [kana, setKana] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [postalError, setPostalError] = useState('');
  const [isSearchingPostal, setIsSearchingPostal] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 商品コード入力時の自動マッチ
  useEffect(() => {
    if (productCode) {
      const product = findProductByCode(productCode);
      setMatchedProduct(product || null);
    } else {
      setMatchedProduct(null);
    }
  }, [productCode]);

  // 郵便番号から住所を自動補完
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

  // バリデーション
  const validate = () => {
    const errors: Record<string, string> = {};
    
    if (!catalogNumber.trim()) {
      errors.catalogNumber = 'カタログ番号は必須です。';
    }

    if (!productCode) {
      errors.productCode = '商品番号は必須です。';
    } else if (!matchedProduct) {
      errors.productCode = '正しい商品番号を入力してください（例：10001）。';
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
      errors.postalCode = '正しい郵便番号（123-4567 または 1234567）を入力してください。';
    }

    if (!address.trim()) errors.address = 'ご住所は必須です。';
    
    if (!phone.trim()) {
      errors.phone = '電話番号は必須です。';
    } else if (!/^\d{10,11}$/.test(phone.replace(/[^\d]/g, ''))) {
      errors.phone = '正しい電話番号（10桁または11桁の数字）を入力してください。';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '正しいメールアドレスの形式で入力してください。';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // フォーム送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      // 最初のスクロール先エラー要素に移動
      const firstError = Object.keys(formErrors)[0];
      if (firstError) {
        document.getElementById(`simple-${firstError}`)?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    // 送信シミュレーション（1秒後に処理）
    setTimeout(() => {
      try {
        const submission = saveSubmission({
          formType: 'simple',
          formTypeLabel: 'ハガキ風ワンページ',
          catalogNumber: catalogNumber.trim().toUpperCase(),
          productCode: productCode.trim().toUpperCase(),
          productName: matchedProduct ? matchedProduct.name : '不明な商品',
          recipientName: name.trim(),
          recipientKana: kana.trim(),
          postalCode: postalCode.trim(),
          address: address.trim(),
          phone: phone.trim().replace(/[^\d]/g, ''),
          email: email.trim(),
          notes: notes.trim() || undefined
        });
        onSuccess(submission);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    }, 1000);
  };

  return (
    <div id="form-a-container" className="max-w-2xl mx-auto">
      {/* 郵便・ハガキ風の装飾を施したコンテナ */}
      <div className="bg-[#FAF9F5] border-2 border-dashed border-amber-800/20 rounded-2xl shadow-md p-6 sm:p-10 relative overflow-hidden">
        
        {/* ハガキの上部バー装飾 */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-amber-600 to-red-500"></div>
        
        {/* 料金別納などの切手位置ダミー */}
        <div className="hidden sm:flex absolute top-6 right-8 w-16 h-20 border-2 border-slate-300 rounded flex-col items-center justify-center p-1 text-[10px] text-slate-400 font-bold select-none">
          <div className="border-b border-slate-300 w-full text-center pb-0.5">料金後納</div>
          <div className="pt-1 text-center leading-tight">郵便<br/>はがき</div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="inline-block w-2 h-6 bg-red-600 rounded"></span>
            カタログギフト お申込みハガキ
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            お手元のハガキまたはカタログに記載されている情報を、以下のフォームにご入力のうえ「申し込む」ボタンを押してください。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* ================= 商品指定エリア ================= */}
          <div className="p-4 sm:p-6 bg-white border border-amber-900/10 rounded-xl shadow-2xs">
            <h3 className="text-sm font-bold text-slate-700 border-b border-amber-900/10 pb-2 mb-4 flex items-center justify-between">
              <span>🗂️ 1. ご希望の商品を入力してください</span>
              <span className="text-[10px] bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">必須</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="simple-catalogNumber" className="block text-xs font-semibold text-slate-600 mb-1">
                  カタログ番号（半角英数字）
                </label>
                <input
                  id="simple-catalogNumber"
                  type="text"
                  value={catalogNumber}
                  onChange={(e) => setCatalogNumber(e.target.value)}
                  placeholder="例：CAT-2026-GOLD"
                  className={`w-full text-sm font-mono tracking-widest uppercase bg-slate-50 border ${
                    formErrors.catalogNumber ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-amber-200'
                  } rounded-lg px-4 py-3 focus:outline-hidden focus:ring-4 transition-all`}
                />
                {formErrors.catalogNumber && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">⚠️ {formErrors.catalogNumber}</p>
                )}
              </div>

              <div>
                <label htmlFor="simple-productCode" className="block text-xs font-semibold text-slate-600 mb-1">
                  お申込商品番号（半角英数字）
                </label>
                <div className="relative">
                  <input
                    id="simple-productCode"
                    type="text"
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                    placeholder="例：10001"
                    className={`w-full text-sm font-mono tracking-widest uppercase bg-slate-50 border ${
                      formErrors.productCode ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-amber-200'
                    } rounded-lg px-4 py-3 focus:outline-hidden focus:ring-4 transition-all`}
                  />
                  {matchedProduct && (
                    <span className="absolute right-3 top-3 text-emerald-600">
                      <Check className="w-5 h-5" />
                    </span>
                  )}
                </div>
                {formErrors.productCode && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">⚠️ {formErrors.productCode}</p>
                )}
                
                {/* デモ用お試しコード */}
                <div className="mt-2.5 p-2.5 bg-amber-50/50 border border-amber-200/40 rounded-lg text-xs text-slate-600 leading-relaxed">
                  💡 <span className="font-semibold text-amber-900">デモ用お試し入力：</span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 font-mono text-[11px] items-center">
                    <span className="text-slate-500">カタログ番号：</span>
                    <button
                      type="button"
                      onClick={() => setCatalogNumber('CAT-2026-GOLD')}
                      className="bg-white border border-slate-300 hover:border-amber-600 text-slate-700 px-2 py-0.5 rounded shadow-2xs cursor-pointer"
                    >
                      CAT-2026-GOLD
                    </button>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-500">商品コード：</span>
                    {sampleProducts.slice(0, 3).map(p => (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => {
                          setProductCode(p.code);
                          if (!catalogNumber) {
                            setCatalogNumber('CAT-2026-GOLD');
                          }
                        }}
                        className="bg-white border border-slate-300 hover:border-amber-600 text-slate-700 px-2 py-0.5 rounded shadow-2xs cursor-pointer"
                      >
                        {p.code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* リアルタイム商品マッチプレビュー */}
              {productCode && (
                <div className="mt-4 transition-all duration-300">
                  {matchedProduct ? (
                    <div className="flex flex-col sm:flex-row gap-4 p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg animate-fadeIn">
                      <img
                        src={matchedProduct.image}
                        alt={matchedProduct.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border border-emerald-100 shadow-2xs flex-shrink-0"
                      />
                      <div>
                        <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded mb-1">
                          {matchedProduct.categoryLabel} 一致
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                          {matchedProduct.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {matchedProduct.description}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-50/30 border border-rose-100 rounded-lg text-xs text-rose-700 animate-fadeIn">
                      ❓ 入力された商品番号「{productCode.toUpperCase()}」はカタログにありません。上記のお試しコードを入力してみてください。
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ================= お届け先入力エリア ================= */}
          <div className="p-4 sm:p-6 bg-white border border-amber-900/10 rounded-xl shadow-2xs">
            <h3 className="text-sm font-bold text-slate-700 border-b border-amber-900/10 pb-2 mb-4 flex items-center justify-between">
              <span>🏠 2. お届け先をご入力ください</span>
              <span className="text-[10px] bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">必須</span>
            </h3>

            <div className="space-y-4">
              
              {/* 名前 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="simple-name" className="block text-xs font-semibold text-slate-600 mb-1">
                    お名前
                  </label>
                  <input
                    id="simple-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例：山田 太郎"
                    className={`w-full text-sm bg-slate-50 border ${
                      formErrors.name ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-amber-200'
                    } rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:ring-4 transition-all`}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-600 mt-1">⚠️ {formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="simple-kana" className="block text-xs font-semibold text-slate-600 mb-1">
                    フリガナ（全角カタカナ）
                  </label>
                  <input
                    id="simple-kana"
                    type="text"
                    value={kana}
                    onChange={(e) => setKana(e.target.value)}
                    placeholder="例：ヤマダ タロウ"
                    className={`w-full text-sm bg-slate-50 border ${
                      formErrors.kana ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-amber-200'
                    } rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:ring-4 transition-all`}
                  />
                  {formErrors.kana && (
                    <p className="text-xs text-red-600 mt-1">⚠️ {formErrors.kana}</p>
                  )}
                </div>
              </div>

              {/* 郵便番号 */}
              <div>
                <label htmlFor="simple-postalCode" className="block text-xs font-semibold text-slate-600 mb-1">
                  郵便番号（ハイフンなし7桁、またはハイフンあり）
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      id="simple-postalCode"
                      type="text"
                      maxLength={8}
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="例：100-0001"
                      className={`w-full text-sm bg-slate-50 border ${
                        formErrors.postalCode ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-amber-200'
                      } rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:ring-4 transition-all`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handlePostalSearch}
                    disabled={isSearchingPostal}
                    className="bg-amber-700 hover:bg-amber-800 active:bg-amber-900 disabled:bg-slate-300 text-white font-medium text-xs rounded-lg px-4 py-2.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {isSearchingPostal ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        検索中
                      </>
                    ) : (
                      '住所を自動入力'
                    )}
                  </button>
                </div>
                {postalError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">⚠️ {postalError}</p>
                )}
                {formErrors.postalCode && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">⚠️ {formErrors.postalCode}</p>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  ※実動機能：郵便番号を入れて検索すると、実在の日本の住所が自動で補完されます。
                </p>
              </div>

              {/* 住所 */}
              <div>
                <label htmlFor="simple-address" className="block text-xs font-semibold text-slate-600 mb-1">
                  ご住所（番地・マンション名までご記入ください）
                </label>
                <input
                  id="simple-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="例：東京都千代田区麹町1-2-3 麹町レジデンス405"
                  className={`w-full text-sm bg-slate-50 border ${
                    formErrors.address ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-amber-200'
                  } rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:ring-4 transition-all`}
                />
                {formErrors.address && (
                  <p className="text-xs text-red-600 mt-1">⚠️ {formErrors.address}</p>
                )}
              </div>

              {/* 電話番号・メール */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="simple-phone" className="block text-xs font-semibold text-slate-600 mb-1">
                    お電話番号（ハイフンなし）
                  </label>
                  <input
                    id="simple-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="例：09012345678"
                    className={`w-full text-sm bg-slate-50 border ${
                      formErrors.phone ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-amber-200'
                    } rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:ring-4 transition-all`}
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-red-600 mt-1">⚠️ {formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="simple-email" className="block text-xs font-semibold text-slate-400 flex items-center justify-between mb-1">
                    <span className="text-slate-600 font-semibold">メールアドレス</span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-normal">任意</span>
                  </label>
                  <input
                    id="simple-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="例：taro@example.com"
                    className={`w-full text-sm bg-slate-50 border ${
                      formErrors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-amber-200'
                    } rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:ring-4 transition-all`}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-600 mt-1">⚠️ {formErrors.email}</p>
                  )}
                </div>
              </div>

              {/* 備考・要望 */}
              <div>
                <label htmlFor="simple-notes" className="block text-xs font-semibold text-slate-400 flex items-center justify-between mb-1">
                  <span className="text-slate-600 font-semibold">ご要望事項（お届け時間の指定など）</span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-normal">任意</span>
                </label>
                <textarea
                  id="simple-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="例：不在時は宅配ボックスへお願いします。配送時間指定：午前中"
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:ring-4 focus:ring-amber-200 focus:border-amber-600 transition-all"
                />
              </div>

            </div>
          </div>

          {/* ================= 送信エリア ================= */}
          <div className="pt-4 flex flex-col items-center">
            <p className="text-xs text-slate-500 text-center max-w-md mb-4 leading-relaxed">
              ご入力内容にお間違いがないか今一度ご確認いただき、下のボタンを押してお申込みを完了してください。
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-80 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-slate-300 text-white font-bold text-base rounded-xl py-4 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  お申込み処理中...
                </>
              ) : (
                'この内容で申し込む'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
