import React from 'react';
import { FileText, Smartphone, LayoutGrid, CheckCircle2, AlertCircle } from 'lucide-react';

interface ExplanationCardProps {
  type: 'simple' | 'step' | 'interactive';
}

export default function ExplanationCard({ type }: ExplanationCardProps) {
  const data = {
    simple: {
      title: '① ハガキ風ワンページフォーム',
      icon: <FileText className="w-5 h-5 text-amber-600" />,
      tagline: '紙ハガキをデジタルに忠実再現。中高年層に最も親しまれる超王道フォーム。',
      target: 'お中元・お歳暮の返礼、比較的高齢のユーザー層、手元にカタログ本誌がある場合',
      merits: [
        '紙の返信用ハガキと全く同じ項目配置のため、説明書を読まなくても直感的に記入できる。',
        'すべての入力項目が1枚の画面（はがきサイズ）に収まっているため、全体の入力ボリュームがひと目でわかり、心理的な負担感が少ない。',
        '商品コードを入力すると自動的に商品プレビューが表示されるため、コードの誤入力によるお届けミスをその場で未然に防ぎます。'
      ],
      demerits: [
        'スマホの小さな画面では縦スクロールが必要になり、キーボード入力の頻度が高いため、少し窮屈に感じることがあります。',
        'ビジュアル的な楽しさや、その場で商品を選び直すなどの体験価値は低めです。'
      ],
      uxPoints: '「郵便番号から自動住所検索」ボタンを設置し、住所入力の手間を大幅削減。また、手元ハガキの「申込番号」と「お届け先」という明確な境界線を、枠線のグラフィックで直感的に再現しています。'
    },
    step: {
      title: '② ステップ・バイ・ステップ フォーム',
      icon: <Smartphone className="w-5 h-5 text-emerald-600" />,
      tagline: '1画面に1アクション。スマートフォンの画面に100%最適化したモダン設計。',
      target: '結婚・出産祝いの返礼（若い世帯）、スマートフォン比率が8割を超える案件',
      merits: [
        '一度にたくさんの入力を求められないため、ユーザーが圧倒されず、途中で離脱しにくい。',
        '「お申込番号入力」→「商品選択」→「住所入力」と進むため、次に何をすべきかが非常に明確。',
        'フリック入力メインのスマートフォンで、タップしやすい大きなボタンや、最適化されたキーボード表示（電話番号には数値キー等）を提供しやすい。'
      ],
      demerits: [
        '画面遷移（ステップ移動）が発生するため、PCブラウザでサクサクキーボード入力したい人にとっては、画面切り替えがまどろっこしく感じることがあります。',
        '全体像が見えにくいため、完了まであとどれくらいかかるかのプログレスバー表示が必須となります。'
      ],
      uxPoints: '上部に「進捗インジケーター（プログレスバー）」を設け、現在位置と全体ステップ（全4段階）を可視化。前の画面に戻る場合も、入力内容はしっかりと一時保持され、ストレスのない遷移を実現しています。'
    },
    interactive: {
      title: '③ WEBカタログ一体型フォーム',
      icon: <LayoutGrid className="w-5 h-5 text-blue-600" />,
      tagline: '商品選びから住所入力までがワンストップ。顧客体験（CX）を最大化するeギフト型。',
      target: 'カタログ本誌（冊子）を郵送しない「カードタイプ」「ソーシャルギフト（SNS送信）」のカタログギフト',
      merits: [
        '手元に冊子がなくても、画面上で美味しそうな写真や詳細スペックを見ながら楽しく選べます。',
        'カテゴリ絞り込みやキーワード検索、商品詳細ポップアップなど、ECサイトのような快適な操作性。',
        '気に入った商品をタップするとその場でお届け先入力フォームに誘導されるため、モチベーションが最も高い状態で入力に進めます。'
      ],
      demerits: [
        '画像データが多いため、通信環境の悪い場所では読み込みに時間がかかる場合があります。',
        'お年寄りやデジタル機器に不慣れな層には機能が多く見え、迷ってしまう可能性があります。'
      ],
      uxPoints: '高解像度の商品画像を採用し、商品の魅力を最大限に引き出します。選択中の商品は常に画面にフローティング表示またはハイライトされ、自分が何を申し込もうとしているかを常に意識できるように設計されています。'
    }
  };

  const current = data[type];

  return (
    <div id={`exp-card-${type}`} className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden transition-all duration-300">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
          {current.icon}
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-base">{current.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{current.tagline}</p>
        </div>
      </div>
      
      <div className="p-5 space-y-4">
        {/* ターゲット */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">推奨ターゲット・利用シーン</h4>
          <p className="text-sm text-slate-700 bg-amber-50/30 border border-amber-100/50 rounded-lg p-3 leading-relaxed">
            ✨ <strong className="text-slate-800">{current.target}</strong>
          </p>
        </div>

        {/* メリット＆デメリット */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-emerald-50/20 border border-emerald-100/50">
            <h5 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              設計上のメリット (UX/CVR向上)
            </h5>
            <ul className="space-y-2">
              {current.merits.map((m, i) => (
                <li key={i} className="text-xs text-slate-600 leading-relaxed pl-1 list-disc list-inside">
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-rose-50/20 border border-rose-100/50">
            <h5 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              想定される課題・デメリット
            </h5>
            <ul className="space-y-2">
              {current.demerits.map((d, i) => (
                <li key={i} className="text-xs text-slate-600 leading-relaxed pl-1 list-disc list-inside">
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* UXのこだわりポイント */}
        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-lg">
          <h4 className="text-xs font-bold text-slate-700 mb-1">💡 実装デモのUXこだわりポイント</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {current.uxPoints}
          </p>
        </div>
      </div>
    </div>
  );
}
