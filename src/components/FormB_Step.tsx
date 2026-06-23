import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, Loader2, Smartphone, Home, ShieldCheck, ShoppingBag } from 'lucide-react';
import { sampleProducts } from '../data/products';
import { fetchAddressByPostalCode, saveSubmission } from '../utils';
import { Product, CatalogSubmission } from '../types';

interface FormBStepProps {
  onSuccess: (submission: CatalogSubmission) => void;
}

export default function FormBStep({ onSuccess }: FormBStepProps) {
  const [step, setStep] = useState(1);
  const [authCode, setAuthCode] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 配送先情報
  const [name, setName] = useState('');
  const [kana, setKana] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // エラー状態
  const [authError, setAuthError] = useState('');
  const [productError, setProductError] = useState('');
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [postalError, setPostalError] = useState('');
  
  const [isSearchingPostal, setIsSearchingPostal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // お申込番号の初期補完
  const setDemoAuth = (code: string) => {
    setAuthCode(code);
    setPinCode('1234');
    setAuthError('');
  };

  // ステップ1: 認証チェック
  const handleNextStep2 = () => {
    setAuthError('');
    if (!authCode.trim()) {
      setAuthError('お申込番号を入力してください。');
      return;
    }
    if (!pinCode.trim()) {
      setAuthError('確認コード（PIN）を入力してください。');
      return;
    }
    if (pinCode.trim().length < 4) {
      setAuthError('確認コードは4桁以上で入力してください。');
      return;
    }

    // デモ用なので、お申込番号をもとに初期商品を自動選択しておく
    const cleanCode = authCode.trim().toUpperCase();
    const found = sampleProducts.find(p => p.code === cleanCode);
    if (found) {
      setSelectedProduct(found);
    } else {
      // 該当がなければ、適当に最初の商品か、空にして選んでもらう
      setSelectedProduct(null);
    }
    setStep(2);
  };

  // ステップ2: 商品選択チェック
  const handleNextStep3 = () => {
    setProductError('');
    if (!selectedProduct) {
      setProductError('お申込みになる商品を選択してください。');
      return;
    }
    setStep(3);
  };

  // ステップ3: 住所入力チェック
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

  const handleNextStep4 = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'お名前は必須項目です。';
    if (!kana.trim()) {
      errors.kana = 'フリガナは必須項目です。';
    } else if (!/^[ァ-ヶー\s]+$/.test(kana.trim())) {
      errors.kana = '全角カタカナで入力してください。';
    }

    if (!postalCode.trim()) {
      errors.postalCode = '郵便番号は必須項目です。';
    } else if (!/^\d{3}-?\d{4}$/.test(postalCode.trim())) {
      errors.postalCode = '正しい形式（例：123-4567）で入力してください。';
    }

    if (!address.trim()) errors.address = 'ご住所は必須項目です。';
    
    if (!phone.trim()) {
      errors.phone = '電話番号は必須項目です。';
    } else if (!/^\d{10,11}$/.test(phone.replace(/[^\d]/g, ''))) {
      errors.phone = '電話番号は10桁または11桁の数字で入力してください。';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'メールアドレスの形式が正しくありません。';
    }

    setAddressErrors(errors);
    if (Object.keys(errors).length === 0) {
      setStep(4);
    }
  };

  // 最終送信
  const handleSubmit = () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const submission = saveSubmission({
          formType: 'step',
          formTypeLabel: 'ステップ・バイ・ステップ',
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

  const stepsInfo = [
    { num: 1, label: '番号認証', icon: <ShieldCheck className="w-4 h-4" /> },
    { num: 2, label: '商品選択', icon: <ShoppingBag className="w-4 h-4" /> },
    { num: 3, label: 'お届け先', icon: <Home className="w-4 h-4" /> },
    { num: 4, label: '内容確認', icon: <Check className="w-4 h-4" /> }
  ];

  return (
    <div id="form-b-container" className="max-w-2xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden transition-all duration-300">
        
        {/* ================= プログレスバー（進行状況） ================= */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 sm:px-8">
          <div className="flex items-center justify-between">
            {stepsInfo.map((s) => (
              <div key={s.num} className="flex flex-col items-center flex-1 relative">
                {/* 接続ライン */}
                {s.num < 4 && (
                  <div className={`absolute top-4 left-[50%] right-[-50%] h-0.5 z-0 ${
                    step > s.num ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
                )}
                
                {/* 丸数字アイコン */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-10 transition-all duration-300 ${
                  step === s.num
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110 shadow-sm'
                    : step > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                
                {/* ラベル */}
                <span className={`text-[11px] mt-1.5 font-bold transition-colors ${
                  step === s.num ? 'text-emerald-700 font-bold' : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ================= フォーム本体 ================= */}
        <div className="p-6 sm:p-8 min-h-[380px] flex flex-col justify-between">
          
          <div>
            {/* ----------------- STEP 1: 認証 ----------------- */}
            {step === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="text-center sm:text-left mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 justify-center sm:justify-start">
                    <span className="p-1 bg-emerald-100 text-emerald-700 rounded-lg"><ShieldCheck className="w-5 h-5" /></span>
                    お申込番号のご確認
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    カタログに同封されている「お申込番号」と「確認コード」を入力してください。
                  </p>
                </div>

                <div className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label htmlFor="step-authCode" className="block text-xs font-semibold text-slate-600 mb-1">
                      お申込番号（半角英数字）
                    </label>
                    <input
                      id="step-authCode"
                      type="text"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      placeholder="例：G-101"
                      className="w-full text-sm font-mono uppercase tracking-widest bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 transition-all text-center"
                    />
                  </div>

                  <div>
                    <label htmlFor="step-pinCode" className="block text-xs font-semibold text-slate-600 mb-1">
                      確認コード / PINコード（4桁の数字）
                    </label>
                    <input
                      id="step-pinCode"
                      type="password"
                      maxLength={4}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="例：1234"
                      className="w-full text-sm font-mono tracking-widest bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 transition-all text-center"
                    />
                  </div>

                  {authError && (
                    <p className="text-xs text-red-600 text-center bg-red-50 p-2 rounded-lg border border-red-100">⚠️ {authError}</p>
                  )}

                  {/* お試し用のデモセットボタン */}
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                    <p className="text-[11px] text-emerald-800 font-bold mb-1.5 text-center sm:text-left">
                      💡 デモ入力として、以下の商品番号をセットして進めます：
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => setDemoAuth('G-101')}
                        className="bg-white border border-emerald-200 hover:border-emerald-600 text-emerald-800 font-mono text-[11px] px-2.5 py-1 rounded shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                      >
                        G-101（松阪牛）をセット
                      </button>
                      <button
                        type="button"
                        onClick={() => setDemoAuth('Z-201')}
                        className="bg-white border border-emerald-200 hover:border-emerald-600 text-emerald-800 font-mono text-[11px] px-2.5 py-1 rounded shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                      >
                        Z-201（今治タオル）をセット
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- STEP 2: 商品選択 ----------------- */}
            {step === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="p-1 bg-emerald-100 text-emerald-700 rounded-lg"><ShoppingBag className="w-5 h-5" /></span>
                    ご希望商品の選択
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    お申込番号「{authCode.toUpperCase()}」に紐づく商品、またはお好きな商品を選択してください。
                  </p>
                </div>

                {productError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">⚠️ {productError}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                  {sampleProducts.map((p) => {
                    const isSelected = selectedProduct?.id === p.id;
                    const isDirectMatch = p.code === authCode.trim().toUpperCase();

                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedProduct(p);
                          setProductError('');
                        }}
                        className={`group border-2 rounded-xl p-3 flex gap-3 cursor-pointer transition-all duration-200 relative ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/20 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                        }`}
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-md border border-slate-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider">{p.code}</span>
                            {isDirectMatch && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 py-0.25 rounded">
                                ハガキ一致
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors truncate">
                            {p.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                            {p.description}
                          </p>
                        </div>

                        {/* チェックマーク */}
                        <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white scale-100'
                            : 'bg-white border-slate-200 text-transparent scale-0 group-hover:scale-50'
                        }`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ----------------- STEP 3: お届け先情報 ----------------- */}
            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="p-1 bg-emerald-100 text-emerald-700 rounded-lg"><Home className="w-5 h-5" /></span>
                    お届け先のご入力
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    プレゼントの配送先情報を入力してください。
                  </p>
                </div>

                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 pb-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="step-name" className="block text-[11px] font-bold text-slate-500 mb-0.5">お名前 <span className="text-red-500">*</span></label>
                      <input
                        id="step-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="例：鈴木 美咲"
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-3 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                      />
                      {addressErrors.name && <p className="text-[10px] text-red-600 mt-0.5">⚠️ {addressErrors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="step-kana" className="block text-[11px] font-bold text-slate-500 mb-0.5">フリガナ（カタカナ） <span className="text-red-500">*</span></label>
                      <input
                        id="step-kana"
                        type="text"
                        value={kana}
                        onChange={(e) => setKana(e.target.value)}
                        placeholder="例：スズキ ミサキ"
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-3 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                      />
                      {addressErrors.kana && <p className="text-[10px] text-red-600 mt-0.5">⚠️ {addressErrors.kana}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="step-postalCode" className="block text-[11px] font-bold text-slate-500 mb-0.5">郵便番号 <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <input
                        id="step-postalCode"
                        type="text"
                        maxLength={8}
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="例：530-0001"
                        className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-3 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={handlePostalSearch}
                        disabled={isSearchingPostal}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg px-3 py-2 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        {isSearchingPostal ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        住所自動入力
                      </button>
                    </div>
                    {postalError && <p className="text-[10px] text-red-600 mt-0.5">⚠️ {postalError}</p>}
                    {addressErrors.postalCode && <p className="text-[10px] text-red-600 mt-0.5">⚠️ {addressErrors.postalCode}</p>}
                  </div>

                  <div>
                    <label htmlFor="step-address" className="block text-[11px] font-bold text-slate-500 mb-0.5">ご住所 <span className="text-red-500">*</span></label>
                    <input
                      id="step-address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="例：大阪府大阪市北区梅田1-1 阪急レジデンス 1205"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-3 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                    />
                    {addressErrors.address && <p className="text-[10px] text-red-600 mt-0.5">⚠️ {addressErrors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="step-phone" className="block text-[11px] font-bold text-slate-500 mb-0.5">電話番号（ハイフンなし） <span className="text-red-500">*</span></label>
                      <input
                        id="step-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="例：08098765432"
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-3 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                      />
                      {addressErrors.phone && <p className="text-[10px] text-red-600 mt-0.5">⚠️ {addressErrors.phone}</p>}
                    </div>

                    <div>
                      <label htmlFor="step-email" className="block text-[11px] font-bold text-slate-500 flex items-center justify-between mb-0.5">
                        <span>メールアドレス</span>
                        <span className="text-[9px] text-slate-400 bg-slate-100 px-1 py-0.25 rounded font-normal">任意</span>
                      </label>
                      <input
                        id="step-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="例：misaki@example.com"
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-3 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                      />
                      {addressErrors.email && <p className="text-[10px] text-red-600 mt-0.5">⚠️ {addressErrors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="step-notes" className="block text-[11px] font-bold text-slate-500 flex items-center justify-between mb-0.5">
                      <span>ご要望事項</span>
                      <span className="text-[9px] text-slate-400 bg-slate-100 px-1 py-0.25 rounded font-normal">任意</span>
                    </label>
                    <textarea
                      id="step-notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="時間指定など"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-3 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- STEP 4: 内容確認 ----------------- */}
            {step === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="p-1 bg-emerald-100 text-emerald-700 rounded-lg"><Check className="w-5 h-5" /></span>
                    ご入力内容のご確認
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    お申込み内容に誤りがないか最終確認を行ってください。
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  {/* 商品情報 */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-4">
                    <img
                      src={selectedProduct?.image}
                      alt={selectedProduct?.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-md border"
                    />
                    <div>
                      <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.25 rounded">
                        {selectedProduct?.code}
                      </span>
                      <h4 className="font-bold text-slate-800 mt-1">{selectedProduct?.name}</h4>
                    </div>
                  </div>

                  {/* お届け先情報 */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <th className="w-24 bg-slate-50 p-2.5 font-bold text-slate-600 align-top">お名前</th>
                          <td className="p-2.5 text-slate-800 font-medium">
                            {name} <span className="text-[10px] text-slate-400">（{kana}）</span>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <th className="bg-slate-50 p-2.5 font-bold text-slate-600 align-top">お届け先</th>
                          <td className="p-2.5 text-slate-800 leading-relaxed">
                            〒{postalCode}<br />
                            {address}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <th className="bg-slate-50 p-2.5 font-bold text-slate-600 align-top">電話番号</th>
                          <td className="p-2.5 text-slate-800">{phone}</td>
                        </tr>
                        {email && (
                          <tr className="border-b border-slate-100">
                            <th className="bg-slate-50 p-2.5 font-bold text-slate-600 align-top">メール</th>
                            <td className="p-2.5 text-slate-800">{email}</td>
                          </tr>
                        )}
                        {notes && (
                          <tr>
                            <th className="bg-slate-50 p-2.5 font-bold text-slate-600 align-top">ご要望事項</th>
                            <td className="p-2.5 text-slate-800 leading-relaxed italic">{notes}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ================= ナビゲーションボタン ================= */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                戻る
              </button>
            ) : (
              <div></div> // スペーサー
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={
                  step === 1 ? handleNextStep2 :
                  step === 2 ? handleNextStep3 :
                  handleNextStep4
                }
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1 ml-auto"
              >
                次へ進む
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl px-8 py-3.5 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 ml-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    送信中...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    この内容で申し込む
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
