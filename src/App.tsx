import React, { useState, useEffect } from 'react';
import { Gift, ShieldAlert, CheckCircle2, ClipboardList, Layers, ExternalLink, HelpCircle } from 'lucide-react';
import { CatalogSubmission } from './types';
import { getSubmissions, initializeDummyData } from './utils';
import FormASimple from './components/FormA_Simple';
import FormBStep from './components/FormB_Step';
import FormCInteractive from './components/FormC_Interactive';
import ExplanationCard from './components/ExplanationCard';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  // 初期データの初期化
  useEffect(() => {
    initializeDummyData();
    setSubmissions(getSubmissions());
  }, []);

  const [activeTab, setActiveTab] = useState<'forms' | 'admin'>('forms');
  const [activeForm, setActiveForm] = useState<'simple' | 'step' | 'interactive'>('simple');
  const [submissions, setSubmissions] = useState<CatalogSubmission[]>([]);
  
  // 送信完了画面用
  const [lastSubmission, setLastSubmission] = useState<CatalogSubmission | null>(null);

  const refreshSubmissions = () => {
    setSubmissions(getSubmissions());
  };

  const handleFormSuccess = (submission: CatalogSubmission) => {
    setLastSubmission(submission);
    refreshSubmissions();
  };

  const handleResetForm = () => {
    setLastSubmission(null);
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      
      {/* ================= ヘッダー ================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-600 rounded-lg text-white shadow-xs">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  カタログギフト受付システム
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-normal px-2 py-0.5 rounded-full border">
                    デモ版
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  用途やターゲット層に合わせて選べる3種類のサンプルフォーム
                </p>
              </div>
            </div>

            {/* ナビゲーション（体験フォーム vs 管理システム） */}
            <div className="flex gap-1.5 font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('forms');
                  setLastSubmission(null);
                }}
                className={`text-xs sm:text-sm px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'forms'
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                体験用フォーム
              </button>
              
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`text-xs sm:text-sm px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 relative ${
                  activeTab === 'admin'
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>管理システム</span>
                {submissions.filter(s => s.status === 'pending').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= メインコンテンツ ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'forms' ? (
          /* ==================================== フォーム体験ビュー ==================================== */
          <div className="space-y-8 animate-fadeIn">
            
            {lastSubmission ? (
              /* ================= 申込完了画面 (サンクスページ) ================= */
              <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-lg p-6 sm:p-10 text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>
                
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">お申込みありがとうございました</h2>
                  <p className="text-xs text-slate-400 mt-1">お申込み手続きは正常に完了いたしました。</p>
                </div>

                {/* 控え情報 */}
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-5 text-left text-xs space-y-3">
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500">お申込受付番号</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{lastSubmission.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500">お申込み方法</span>
                    <span className="font-semibold text-slate-800">{lastSubmission.formTypeLabel}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500">ご希望商品</span>
                    <span className="font-bold text-slate-800 line-clamp-1">{lastSubmission.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">お届け先お名前</span>
                    <span className="font-semibold text-slate-800">{lastSubmission.recipientName} 様</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-left text-xs text-blue-800 leading-relaxed space-y-1.5">
                  <p className="font-bold">📋 デモ完了後のシステムフロー：</p>
                  <p>
                    このテストデータは、画面右上の「<strong>管理システム</strong>」タブに即時反映されています。
                    管理システムより、発送ステータスの変更やCSV出力をお試しいただけます。
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl px-6 py-3 shadow-xs hover:shadow-sm transition-all cursor-pointer"
                  >
                    同じフォームでもう一度入力する
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('admin');
                      setLastSubmission(null);
                    }}
                    className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl px-6 py-3 transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    管理システムでデータを確認する
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* ================= フォーム選択 ＆ フォーム本体 ================= */
              <div className="space-y-8">
                
                {/* フォーム切替タブ */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
                  <div className="text-center sm:text-left mb-4">
                    <h2 className="text-sm font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      サンプルフォームを切り替える
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      カタログギフトの運用方法やターゲットユーザーに合わせて、最適なUI/UXを選択できます。
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* タブ1: ハガキ風 */}
                    <button
                      type="button"
                      onClick={() => setActiveForm('simple')}
                      className={`text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 relative ${
                        activeForm === 'simple'
                          ? 'border-amber-700 bg-amber-50/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        activeForm === 'simple' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className="text-xs font-bold font-mono">A</span>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800">ハガキ風ワンページ</h3>
                        <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                          紙ハガキの項目を再現。シンプルで中高年層に一番優しい構成。
                        </p>
                      </div>
                    </button>

                    {/* タブ2: ステップ式 */}
                    <button
                      type="button"
                      onClick={() => setActiveForm('step')}
                      className={`text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 relative ${
                        activeForm === 'step'
                          ? 'border-emerald-700 bg-emerald-50/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        activeForm === 'step' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className="text-xs font-bold font-mono">B</span>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800">ステップ・バイ・ステップ</h3>
                        <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                          スマホに完全最適化。1ステップずつの入力で離脱を防止。
                        </p>
                      </div>
                    </button>

                    {/* タブ3: デジタルカタログ一体型 */}
                    <button
                      type="button"
                      onClick={() => setActiveForm('interactive')}
                      className={`text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 relative ${
                        activeForm === 'interactive'
                          ? 'border-blue-700 bg-blue-50/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        activeForm === 'interactive' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className="text-xs font-bold font-mono">C</span>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800">WEBカタログ一体型</h3>
                        <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                          画面上で商品写真を確認し、そのまま送付先を入力できるeギフト型。
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* フォーム本体と解説カードの並び */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* フォーム本体（左側または中央） */}
                  <div className="lg:col-span-8 order-2 lg:order-1">
                    {activeForm === 'simple' && <FormASimple onSuccess={handleFormSuccess} />}
                    {activeForm === 'step' && <FormBStep onSuccess={handleFormSuccess} />}
                    {activeForm === 'interactive' && <FormCInteractive onSuccess={handleFormSuccess} />}
                  </div>

                  {/* 解説カード（右側サイドバー） */}
                  <div className="lg:col-span-4 order-1 lg:order-2 lg:sticky lg:top-24">
                    <ExplanationCard type={activeForm} />
                  </div>

                </div>

              </div>
            )}

          </div>
        ) : (
          /* ==================================== 管理画面ビュー ==================================== */
          <div className="animate-fadeIn">
            <AdminDashboard
              submissions={submissions}
              onDataChange={refreshSubmissions}
            />
          </div>
        )}

      </main>

      {/* ================= フッター ================= */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-900 mt-16 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="font-bold">カタログギフト受付システム サンプル集</p>
          <p className="text-[10px] text-slate-500">
            本システムは、実運用におけるフォーム設計を評価いただくためのインタラクティブデモです。
            入力されたデータはすべてお使いのブラウザの `localStorage` にのみ安全に保存されます。
          </p>
          <p className="text-[10px] text-slate-600 pt-2">
            © {new Date().getFullYear()} Catalog Gift Reception System UX Concept Study.
          </p>
        </div>
      </footer>

    </div>
  );
}
