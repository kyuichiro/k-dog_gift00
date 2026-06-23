import React, { useState } from 'react';
import { CatalogSubmission } from '../types';
import { updateSubmissionStatus, deleteSubmission, getSubmissions } from '../utils';
import { Table, Trash2, CheckCircle2, RotateCw, Mail, Phone, Calendar, ClipboardList, RefreshCw, FileSpreadsheet, Layers, Info } from 'lucide-react';

interface AdminDashboardProps {
  submissions: CatalogSubmission[];
  onDataChange: () => void;
}

export default function AdminDashboard({ submissions, onDataChange }: AdminDashboardProps) {
  const [selectedSub, setSelectedSub] = useState<CatalogSubmission | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processing' | 'shipped'>('all');

  // ステータスの日本語・カラーマッピング
  const statusConfig = {
    pending: { label: '受付完了', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
    processing: { label: '発送準備中', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
    shipped: { label: '発送完了', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
  };

  const handleStatusChange = (id: string, nextStatus: 'pending' | 'processing' | 'shipped') => {
    updateSubmissionStatus(id, nextStatus);
    onDataChange();
    if (selectedSub && selectedSub.id === id) {
      setSelectedSub(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('このお申込みデータを削除してもよろしいですか？（デモ環境のみの削除です）')) {
      deleteSubmission(id);
      onDataChange();
      if (selectedSub && selectedSub.id === id) {
        setSelectedSub(null);
      }
    }
  };

  // CSVダウンロードシミュレーション
  const handleExportCSV = () => {
    if (submissions.length === 0) {
      alert('書き出すデータがありません。');
      return;
    }

    const headers = ['受付番号', '利用フォーム', '商品コード', '商品名', 'お名前', 'フリガナ', '郵便番号', '住所', '電話番号', 'メール', '備考', '状況', '受付日時'];
    const rows = submissions.map(sub => [
      sub.id,
      sub.formTypeLabel,
      sub.productCode,
      sub.productName,
      sub.recipientName,
      sub.recipientKana,
      sub.postalCode,
      sub.address,
      sub.phone,
      sub.email || '',
      sub.notes || '',
      statusConfig[sub.status].label,
      new Date(sub.createdAt).toLocaleString('ja-JP')
    ]);

    const csvContent = [
      '\uFEFF' + headers.join(','), // BOM付きUTF-8
      ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `catalog_submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = filterStatus === 'all'
    ? submissions
    : submissions.filter(s => s.status === filterStatus);

  return (
    <div id="admin-dashboard-root" className="space-y-6">
      
      {/* 導入説明と簡易指標 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="max-w-xl">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-slate-700" />
            申込管理システム（バックオフィスシミュレーター）
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            3つのフォームから送信されたお申込みデータが、リアルタイムにここに登録されます。
            受注データのステータス管理、詳細確認、およびCSV形式での一括エクスポートをお試しいただけます。
          </p>
        </div>
        
        {/* 指標 */}
        <div className="flex gap-4 self-start md:self-center font-bold">
          <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-3 text-center min-w-20 sm:min-w-24">
            <span className="block text-[10px] text-slate-400">総申込数</span>
            <span className="text-xl font-bold text-slate-800 font-mono">{submissions.length}</span>
          </div>
          <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3 text-center min-w-20 sm:min-w-24">
            <span className="block text-[10px] text-amber-600">未処理</span>
            <span className="text-xl font-bold text-amber-700 font-mono">
              {submissions.filter(s => s.status === 'pending').length}
            </span>
          </div>
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 text-center min-w-20 sm:min-w-24">
            <span className="block text-[10px] text-emerald-600">発送完了</span>
            <span className="text-xl font-bold text-emerald-700 font-mono">
              {submissions.filter(s => s.status === 'shipped').length}
            </span>
          </div>
        </div>
      </div>

      {/* 一覧コントロール */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-bold">
            {(['all', 'pending', 'processing', 'shipped'] as const).map((st) => {
              const labels = { all: 'すべて', pending: '未処理', processing: '発送準備中', shipped: '発送完了' };
              const count = st === 'all' ? submissions.length : submissions.filter(s => s.status === st).length;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`text-xs px-3 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    filterStatus === st
                      ? 'bg-slate-800 border-slate-800 text-white font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {labels[st]} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              CSVエクスポート
            </button>
          </div>
        </div>

        {/* テーブル表示 */}
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Info className="w-10 h-10 mx-auto stroke-[1.5]" />
              <p className="text-sm">該当するお申込みデータがありません。</p>
              <p className="text-xs text-slate-400">フォームからテスト送信を行ってみてください。</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
                  <th className="p-4">お申込情報 / 受付日時</th>
                  <th className="p-4">お客様名</th>
                  <th className="p-4">申込商品</th>
                  <th className="p-4">流入経路</th>
                  <th className="p-4 text-center">配送状況</th>
                  <th className="p-4 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => setSelectedSub(sub)}
                        className="font-mono font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        {sub.id}
                      </button>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-sans">
                        <Calendar className="w-3 h-3 shrink-0" />
                        {new Date(sub.createdAt).toLocaleString('ja-JP', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{sub.recipientName}</p>
                      <p className="text-[10px] text-slate-400 font-sans tracking-wide mt-0.5">{sub.recipientKana}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-bold bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.25 rounded text-[10px]">
                        {sub.productCode}
                      </span>
                      <p className="font-medium text-slate-700 mt-1 line-clamp-1">{sub.productName}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100/80 rounded-md px-2 py-0.5 border border-slate-200/40">
                        <Layers className="w-3 h-3 text-slate-400" />
                        {sub.formTypeLabel}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <select
                        value={sub.status}
                        onChange={(e) => handleStatusChange(sub.id, e.target.value as any)}
                        className={`text-[11px] font-bold border rounded-lg px-2.5 py-1 focus:outline-hidden focus:ring-2 focus:ring-slate-200 transition-all cursor-pointer ${
                          statusConfig[sub.status].bg
                        }`}
                      >
                        <option value="pending">受付完了</option>
                        <option value="processing">発送準備中</option>
                        <option value="shipped">発送完了</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedSub(sub)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="詳細を確認"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(sub.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 詳細モーダル */}
      {selectedSub && (
        <div className="fixed inset-0 bg-slate-900/65 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-mono font-bold text-slate-800 text-sm">{selectedSub.id} 詳細</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">受付タイプ: {selectedSub.formTypeLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 hover:bg-slate-200/50 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              {/* 商品情報 */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">ご希望商品</h4>
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.25 rounded text-[10px]">
                      {selectedSub.productCode}
                    </span>
                    <p className="font-bold text-slate-800 mt-1">{selectedSub.productName}</p>
                  </div>
                </div>
              </div>

              {/* 配送先・お届け先 */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">お届け先情報</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <th className="w-24 bg-slate-50 p-2.5 font-bold text-slate-600 text-left align-top">お名前</th>
                        <td className="p-2.5 text-slate-800 font-medium">
                          {selectedSub.recipientName} <span className="text-[10px] text-slate-400">（{selectedSub.recipientKana}）</span>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <th className="bg-slate-50 p-2.5 font-bold text-slate-600 text-left align-top">お届け先住所</th>
                        <td className="p-2.5 text-slate-800 leading-relaxed">
                          〒{selectedSub.postalCode}<br />
                          {selectedSub.address}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <th className="bg-slate-50 p-2.5 font-bold text-slate-600 text-left align-top">お電話番号</th>
                        <td className="p-2.5 text-slate-800 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {selectedSub.phone}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <th className="bg-slate-50 p-2.5 font-bold text-slate-600 text-left align-top">メール</th>
                        <td className="p-2.5 text-slate-800 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {selectedSub.email || <span className="text-slate-400 italic">未入力</span>}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-slate-50 p-2.5 font-bold text-slate-600 text-left align-top">ご要望欄</th>
                        <td className="p-2.5 text-slate-800 leading-relaxed">
                          {selectedSub.notes || <span className="text-slate-400 italic">特になし</span>}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 状況制御 */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">進捗ステータス変更</h4>
                <div className="flex gap-2 font-bold">
                  {(['pending', 'processing', 'shipped'] as const).map((st) => {
                    const isCurrent = selectedSub.status === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(selectedSub.id, st)}
                        className={`flex-1 py-2 text-center rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-slate-800 border-slate-800 text-white shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {statusConfig[st].label}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                type="button"
                onClick={() => handleDelete(selectedSub.id)}
                className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-all text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                削除する
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 text-[11px] font-bold px-4 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
