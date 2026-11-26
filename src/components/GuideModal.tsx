import React, { useState } from 'react';
import {
  X, Map as MapIcon, BookOpen, Coins, Plus, Gavel, Calendar, BarChart3, Layers,
  FileDown, ArrowRight, ArrowDown, CheckCircle2, Smartphone, Zap,
  Calculator, Sparkles, CornerDownLeft, MousePointerClick, ExternalLink,
  ShieldCheck, AlertTriangle, ShoppingBag, UserCheck, FileText, FileSpreadsheet,
  RefreshCw, Filter, ChevronRight
} from 'lucide-react';

export type GuideActionType =
  | 'gold'
  | 'add'
  | 'ledger'
  | 'market'
  | 'analytics'
  | 'media'
  | 'carryover'
  | 'stagnant'
  | 'export'
  | 'kobutsu';

export interface GuideWorkflowStats {
  totalRecords: number;
  kobutsuFilledCount: number;
  stagnantCount: number;
}

export const WorkflowMapDiagram: React.FC<{
  onAction?: (action: GuideActionType) => void;
  compact?: boolean;
  stats?: GuideWorkflowStats;
}> = ({ onAction, compact = false, stats }) => {
  const interactiveCls = onAction
    ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all'
    : '';

  return (
    <div className={`bg-slate-50 border border-slate-200 rounded-2xl ${compact ? 'p-3.5 space-y-3' : 'p-4 sm:p-5 space-y-4'}`}>
      {/* Map Title Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white shadow-2xs shrink-0">
            <MapIcon className="w-4 h-4" />
          </span>
          <div>
            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex flex-wrap items-center gap-1.5">
              <span>松浦売上管理表「全体の流れ」1枚マップ</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                古物台帳・メルカリShops・滞留監視 対応版
              </span>
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500">
              細かい操作の前にまず全体の地図を確認。各ステップやボタンをクリックすると該当画面へ直接移動します。
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">① 査定</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">② 買取＆古物記録</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">③ 売却・手数料・滞留監視</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">④ 分析・法定出力</span>
        </div>
      </div>

      {/* UPPER FLOW: STEP 1 -> STEP 2 -> STEP 3 (3 BRANCHING ROUTES) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
        {/* STEP 1: Field Valuation */}
        <div
          onClick={() => onAction?.('gold')}
          className={`lg:col-span-3 bg-white border-2 border-amber-300 rounded-xl p-3 flex flex-col justify-between relative ${interactiveCls}`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="px-2 py-0.5 bg-amber-500 text-white rounded text-[10px] font-extrabold tracking-wide">
                STEP 1｜現場・査定
              </span>
              <Coins className="w-4 h-4 text-amber-500" />
            </div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm">金相場まとめ計算</div>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              K24・K18・Ptの重量を合算し、掛率スライダーで<strong className="text-amber-800">買取提示額</strong>と<strong className="text-emerald-700">見込粗利</strong>を即試算。
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-amber-100 flex items-center justify-between text-[10px] text-amber-800 font-bold">
            <span>※ 金以外はSTEP 2へ直行</span>
            {onAction && (
              <span className="inline-flex items-center gap-0.5 text-amber-700 underline">
                開く <ExternalLink className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        </div>

        {/* Arrow 1 -> 2 */}
        <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-center text-emerald-600">
          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mb-1 whitespace-nowrap">
            1クリック転記
          </span>
          <ArrowRight className="w-5 h-5" />
        </div>
        <div className="flex lg:hidden items-center justify-center text-emerald-600 py-0.5">
          <ArrowDown className="w-4 h-4" />
          <span className="text-[10px] font-bold text-amber-700 ml-1">1クリック転記（または直接入力）</span>
        </div>

        {/* STEP 2: Ledger Entry + Kobutsu Accordion + Repeater Autofill */}
        <div
          onClick={() => onAction?.('add')}
          className={`lg:col-span-3 bg-white border-2 border-emerald-400 rounded-xl p-3 flex flex-col justify-between shadow-2xs ${interactiveCls}`}
        >
          <div>
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-extrabold tracking-wide">
                STEP 2｜買取登録＆古物台帳
              </span>
              <div className="flex items-center gap-1">
                {stats && stats.totalRecords > 0 && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[9px] font-bold text-emerald-800 whitespace-nowrap">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                    全{stats.totalRecords}件/古物済{stats.kobutsuFilledCount}件
                  </span>
                )}
                <Plus className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            </div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm">買取記録 ＋ 本人確認（任意）</div>
            <ul className="text-[11px] text-slate-600 mt-1.5 space-y-1">
              <li className="flex items-start gap-1">
                <span className="text-emerald-600 font-bold">•</span>
                <span>
                  <strong>新規買取登録</strong>（品目タグ＋<strong className="text-emerald-700">リピーター自動補完</strong>）
                </span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-emerald-600 font-bold">•</span>
                <span>
                  <strong>古物台帳アコーディオン</strong>（生年月日から<strong className="text-sky-700">満年齢自動計算</strong>・後から行の📄で追記可）
                </span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>表最下部「＋入力」</strong>＆<strong>スマホカード表示</strong></span>
              </li>
            </ul>
          </div>
          <div className="mt-2.5 pt-2 border-t border-emerald-100 flex items-center justify-between text-[10px] text-emerald-800 font-bold">
            <span>全セル1クリック編集OK</span>
            {onAction && (
              <span className="inline-flex items-center gap-0.5 text-emerald-700 underline">
                登録画面へ <ExternalLink className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        </div>

        {/* Arrow 2 -> 3 Routes */}
        <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-center text-slate-500">
          <span className="text-[9px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 mb-1 whitespace-nowrap">
            売り方で分岐
          </span>
          <ArrowRight className="w-5 h-5" />
        </div>
        <div className="flex lg:hidden items-center justify-center text-slate-500 py-0.5">
          <ArrowDown className="w-4 h-4" />
          <span className="text-[10px] font-bold ml-1">売却ルートに応じて STEP 3 へ分岐</span>
        </div>

        {/* STEP 3: 3 Branching Sales Routes + Stagnant Monitor */}
        <div className="lg:col-span-4 flex flex-col gap-2 justify-between">
          {/* Route A: Immediate Cash & EC (Mercari Shops + Auto 10% Fee) */}
          <div
            onClick={() => onAction?.('ledger')}
            className={`bg-amber-50/85 border border-amber-300 rounded-lg px-3 py-2 flex items-center justify-between gap-2 ${interactiveCls}`}
          >
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 bg-amber-600 text-white rounded text-[9px] font-bold">STEP 3 ルートA</span>
                <span className="font-bold text-amber-950 text-xs">即換金・EC販売</span>
                <span className="px-1.5 py-0.5 bg-pink-100 text-pink-800 border border-pink-200 rounded text-[9px] font-bold">
                  メルカリShops対応
                </span>
              </div>
              <p className="text-[10px] text-amber-900 mt-0.5 leading-snug">
                金・ヤフオク・<strong>メルカリShops</strong>・回収を入力 → <strong className="text-rose-700">EC手数料10%自動計算</strong>（手動上書き可）＋送料で粗利/手残り確定
              </p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>

          {/* Route B: Antique Market */}
          <div
            onClick={() => onAction?.('market')}
            className={`bg-emerald-50/85 border border-emerald-300 rounded-lg px-3 py-2 flex items-center justify-between gap-2 ${interactiveCls}`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-emerald-700 text-white rounded text-[9px] font-bold">STEP 3 ルートB</span>
                <span className="font-bold text-emerald-950 text-xs">古物市場へ出品 → 落札反映</span>
              </div>
              <p className="text-[10px] text-emerald-900 mt-0.5 leading-snug">
                台帳の🔨ボタン → <strong>市場管理</strong> → 落札後に<strong>「台帳に反映」</strong>（歩率差引）で完結
              </p>
            </div>
            <Gavel className="w-4 h-4 text-emerald-700 shrink-0" />
          </div>

          {/* Route C: Carryover & 30-Day Stagnant Alert */}
          <div
            onClick={() => onAction?.('carryover')}
            className={`bg-purple-50/85 border ${stats && stats.stagnantCount > 0 ? 'border-rose-400' : 'border-purple-300'} rounded-lg px-3 py-2 flex flex-col gap-1.5 ${interactiveCls}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-1.5 py-0.5 bg-purple-700 text-white rounded text-[9px] font-bold">STEP 3 ルートC</span>
                  <span className="font-bold text-purple-950 text-xs">在庫繰越 ＆ 30日滞留監視</span>
                  {stats && stats.stagnantCount > 0 && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-rose-600 text-white rounded-full text-[9px] font-extrabold animate-pulse">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      滞留30日超: {stats.stagnantCount}件
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-purple-900 mt-0.5 leading-snug">
                  未売却は<strong>繰越管理</strong>で翌月引継。買取日から<strong className="text-rose-700">30日超の未完結在庫は自動赤アラート</strong>で通知。
                </p>
              </div>
              <Calendar className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            </div>
            {onAction && (
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onAction('stagnant');
                  }}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    stats && stats.stagnantCount > 0
                      ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 shadow-2xs'
                      : 'bg-white hover:bg-rose-50 text-rose-700 border-rose-300'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>滞留在庫チェック ({stats?.stagnantCount ?? 0}件)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Down Connector to Analytics & Closing */}
      <div className="flex items-center justify-center gap-2 text-slate-400">
        <div className="flex-1 h-px bg-slate-200" />
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 shadow-2xs text-center">
          <ArrowDown className="w-3 h-3 text-blue-600 shrink-0" />
          <span>台帳に1回入力するだけで、収支・媒体ROI・古物台帳まですべて自動集計（ブラウザ自動保存＋Undo対応）</span>
          <ArrowDown className="w-3 h-3 text-blue-600 shrink-0" />
        </div>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* LOWER FLOW: STEP 4 (Analytics, ROI, Kobutsu & Export) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
        {/* STEP 4-A: Profit & Daily Analytics */}
        <div
          onClick={() => onAction?.('analytics')}
          className={`lg:col-span-4 bg-white border-2 border-blue-300 rounded-xl p-3 flex flex-col justify-between ${interactiveCls}`}
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-extrabold">
                STEP 4-A｜収支・日別分析
              </span>
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="font-bold text-slate-900 text-xs">5販路集計・経費内訳・純利益</div>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              金・市場・Y・<strong className="text-pink-700">メルカリ</strong>・回収と、広告費・<strong>EC手数料・送料・交通・処分費</strong>から<strong className="text-blue-800">最終手残り純利益</strong>と日別推移を可視化。
            </p>
          </div>
          {onAction && (
            <div className="mt-2 pt-1.5 border-t border-blue-100 text-right text-[10px] font-bold text-blue-700">
              収支・日別分析を開く →
            </div>
          )}
        </div>

        {/* STEP 4-B: Media ROI */}
        <div
          onClick={() => onAction?.('media')}
          className={`lg:col-span-4 bg-white border-2 border-purple-300 rounded-xl p-3 flex flex-col justify-between ${interactiveCls}`}
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="px-2 py-0.5 bg-purple-700 text-white rounded text-[10px] font-extrabold">
                STEP 4-B｜媒体別 ROI 分析
              </span>
              <Layers className="w-4 h-4 text-purple-700" />
            </div>
            <div className="font-bold text-slate-900 text-xs">チラシ・HPの広告費回収 (CPA / ROI)</div>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              折込チラシ代やHP広告費を入力すると、<strong>1件獲得単価(CPA)</strong>と<strong>回収率(ROI)</strong>を媒体別に自動算出。
            </p>
          </div>
          {onAction && (
            <div className="mt-2 pt-1.5 border-t border-purple-100 text-right text-[10px] font-bold text-purple-700">
              媒体別分析を開く →
            </div>
          )}
        </div>

        {/* STEP 4-C: Kobutsu Ledger & Monthly Export */}
        <div
          onClick={() => onAction?.('export')}
          className={`lg:col-span-4 bg-slate-800 text-white border-2 border-slate-700 rounded-xl p-3 flex flex-col justify-between ${interactiveCls}`}
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-extrabold">
                STEP 4-C｜古物台帳 ＆ 月末出力
              </span>
              <FileDown className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-bold text-white text-xs">法定古物台帳出力 ＆ 売上表保存</div>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              期間指定で<strong className="text-sky-300">古物台帳（Excel / UTF-8 BOM付CSV・年齢自動計算）</strong>や<strong className="text-amber-300">スプレッドシート貼付</strong>を出力。画面下の「＋月追加」で翌月開始！
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700 flex items-center justify-between gap-2">
            {onAction ? (
              <>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onAction('kobutsu');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 text-[10px] font-extrabold shadow-xs transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>古物台帳出力へ</span>
                </button>
                <span className="text-[10px] font-bold text-emerald-300 whitespace-nowrap">
                  入出力・保存を開く →
                </span>
              </>
            ) : (
              <span className="text-[10px] text-slate-400">入出力・保存からいつでも出力可能</span>
            )}
          </div>
        </div>
      </div>

      {/* Color Legend Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[10px] text-slate-600">
        <span className="font-bold text-slate-700">画面の色・アイコンルール:</span>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-100 text-cyan-900 font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-600" /> シアン＝買取仕入
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> 黄色＝金売上
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600" /> 緑＝市場売上/粗利
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-pink-100 text-pink-900 font-semibold">
            <span className="w-2 h-2 rounded-full bg-pink-500" /> ピンク＝メルカリShops
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-semibold">
            <span className="w-2 h-2 rounded-full bg-purple-600" /> 紫＝翌月繰越
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-600" /> 赤＝滞留30日超 / 手数料・経費
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
            <ShieldCheck className="w-3 h-3 text-emerald-600" /> 古物情報入力済
          </span>
        </div>
      </div>
    </div>
  );
};

export const GuideModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onNavigateAction: (action: GuideActionType) => void;
  stats?: GuideWorkflowStats;
}> = ({ isOpen, onClose, onNavigateAction, stats }) => {
  const [tab, setTab] = useState<'map' | 'scenes' | 'details'>('map');

  if (!isOpen) return null;

  const handleAction = (action: GuideActionType) => {
    onClose();
    onNavigateAction(action);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden border border-gray-200 my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500 rounded-lg text-white">
              <MapIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base flex flex-wrap items-center gap-2">
                <span>松浦売上管理表 操作ガイド</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full font-medium">
                  現場運用・古物台帳対応
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                日々の査定・古物記録からメルカリ/市場売却・30日滞留監視・法定台帳出力までの全体ナビ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Switcher (3 Tabs) */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs flex-wrap">
              <button
                type="button"
                onClick={() => setTab('map')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  tab === 'map' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>全体の流れ（1枚の地図）</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('scenes')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  tab === 'scenes' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>目的別クイック手順</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('details')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  tab === 'details' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>細かい操作・計算ルール</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs text-gray-800">
          {tab === 'map' && (
            <>
              <WorkflowMapDiagram onAction={handleAction} stats={stats} />

              {/* Quick 3-Principle Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
                  <MousePointerClick className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-emerald-950 text-xs">1クリック編集 ＆ 自動保存・Undo</div>
                    <p className="text-[11px] text-emerald-900 mt-0.5 leading-relaxed">
                      表の金額・目標粗利・広告費は<strong>1クリックで編集</strong>でき自動保存。間違えても左上の <strong>Undo</strong> で即復元できます。
                    </p>
                  </div>
                </div>
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-950 text-xs">二重入力ゼロ ＆ リピーター補完</div>
                    <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                      金計算→台帳、台帳⇄市場、翌月繰越は1クリック連携。過去顧客は名前を選ぶだけで住所・本人確認を<strong>自動補完</strong>します。
                    </p>
                  </div>
                </div>
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-blue-950 text-xs">古物・手数料・滞留を自動ガード</div>
                    <p className="text-[11px] text-blue-900 mt-0.5 leading-relaxed">
                      開閉式古物入力、EC手数料10%自動計算、30日超滞留の赤アラート抽出で、現場スピードと法令・利益管理を両立します。
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'scenes' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    目的別クイック手順（よく使う現場シーン別 3ステップ）
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    「今やりたいこと」に合わせて最短ルートを確認し、右下ボタンからすぐ操作画面を開けます。
                  </p>
                </div>
                {stats && (
                  <div className="flex items-center gap-2 text-[11px] font-bold">
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                      登録済: {stats.totalRecords}件
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                      古物情報済: {stats.kobutsuFilledCount}件
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg border ${stats.stagnantCount > 0 ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-white border-slate-200 text-slate-600'}`}>
                      30日超滞留: {stats.stagnantCount}件
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Scene 1 */}
                <div className="bg-white border-2 border-amber-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-amber-100">
                      <h4 className="font-extrabold text-sm text-amber-950 flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-amber-500" />
                        ① 査定現場での買取登録（金・一般品目）
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">現場・車内</span>
                    </div>
                    <ol className="mt-3 space-y-2 text-[11px] text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                        <span>貴金属がある場合は<strong>「金相場まとめ計算」</strong>でK24/K18/Ptを合算し、「新規案件に反映」を押す。</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                        <span>顧客名を入力（過去客なら<strong>候補から選択して自動補完</strong>）し、品目タグ・買取額・媒体を選ぶ。</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                        <span>余裕があれば<strong>「古物台帳・本人確認情報（任意）」</strong>を開いて記録（急ぐ場合は後で行の<strong>📄ボタン</strong>から追記）。</span>
                      </li>
                    </ol>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleAction('gold')}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Coins className="w-3.5 h-3.5" /> 金相場計算へ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('add')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> 新規買取登録へ
                    </button>
                  </div>
                </div>

                {/* Scene 2 */}
                <div className="bg-white border-2 border-pink-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-pink-100">
                      <h4 className="font-extrabold text-sm text-pink-950 flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-pink-600" />
                        ② ヤフオク・メルカリShops で売却した時
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-pink-100 text-pink-900 text-[10px] font-bold">EC販売・手数料</span>
                    </div>
                    <ol className="mt-3 space-y-2 text-[11px] text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-pink-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                        <span>台帳セルまたは行の<strong>📄詳細ボタン</strong>から、<strong>Y売上(J列)</strong> または <strong>メルカリShops売上(K列)</strong> を入力。</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                        <span><strong>EC手数料(N列)が10%で自動計算</strong>されます。異なる料率やキャンペーン時はそのまま手動上書きもOK。</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                        <span><strong>送料/梱包費(O列)</strong>を入れ、繰越額を0円・状態を<strong>「完結」</strong>にすると最終純利益が確定します。</span>
                      </li>
                    </ol>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleAction('ledger')}
                      className="px-3 py-1 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      台帳で売上入力する <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Scene 3 */}
                <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-emerald-100">
                      <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-1.5">
                        <Gavel className="w-4 h-4 text-emerald-700" />
                        ③ 古物市場の出品 〜 落札反映
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold">市場連携</span>
                    </div>
                    <ol className="mt-3 space-y-2 text-[11px] text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                        <span>台帳の行右端にある<strong>🔨（市場出品）ボタン</strong>を押すと、品目と原価を引き継いで市場管理へ送られます。</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                        <span>オークション後に「市場管理」タブで<strong>実際落札額</strong>と<strong>手数料（歩率%）</strong>を入力。</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                        <span><strong>「台帳に反映」</strong>をクリックすると歩率差引後の手取り額が元案件に入り、ステータスが「完結」になります。</span>
                      </li>
                    </ol>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleAction('market')}
                      className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Gavel className="w-3.5 h-3.5" /> 市場管理を開く
                    </button>
                  </div>
                </div>

                {/* Scene 4 */}
                <div className="bg-white border-2 border-sky-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-sky-100">
                      <h4 className="font-extrabold text-sm text-sky-950 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        ④ 30日滞留チェック ＆ 月末締め・古物台帳出力
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-900 text-[10px] font-bold">在庫管理・法定出力</span>
                    </div>
                    <ol className="mt-3 space-y-2 text-[11px] text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                        <span>台帳上部の<strong>「滞留在庫アラート（30日超）」</strong>バナーをクリックし、未完結の長期在庫を値下げ・処分・出品見直し。</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                        <span>月末は画面下の「＋月追加」で翌月シートを作成し、<strong>「繰越管理」</strong>タブから未売却案件を翌月へ引き継ぎ。</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-sky-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                        <span><strong>「入出力・保存」</strong>から期間指定の<strong>古物台帳（Excel / UTF-8 BOM付CSV）</strong>と月次売上表をバックアップ保存。</span>
                      </li>
                    </ol>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-end gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleAction('stagnant')}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> 滞留在庫チェック
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('kobutsu')}
                      className="px-2.5 py-1 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> 古物台帳出力へ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Fast Entry & Detail Edit */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
                <h3 className="font-bold text-sm text-emerald-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  1. 入力最速化 ＆ 📄詳細・古物編集
                </h3>
                <ul className="space-y-2 text-[11px] text-gray-700 leading-relaxed">
                  <li className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                    <div className="font-bold text-emerald-950 flex items-center gap-1">
                      <CornerDownLeft className="w-3.5 h-3.5" /> 連続入力は表最下部の「＋入力」行
                    </div>
                    <p className="mt-0.5">
                      「今日」ボタンで日付セット → <kbd className="px-1 bg-white border rounded font-mono">Tab</kbd> で右へ移動 → <kbd className="px-1 bg-white border rounded font-mono">Enter</kbd> で即追加。複数件を一気に打つときに最速です。
                    </p>
                  </li>
                  <li className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <div className="font-bold text-gray-900">修正はセル1回クリック / 詳細編集は 📄 ボタン</div>
                    <p className="mt-0.5">
                      数値セルをクリックすると自動全選択され数字入力＋<kbd className="px-1 bg-white border rounded font-mono">Enter</kbd> で上書き完了（<kbd className="px-1 bg-white border rounded font-mono">Esc</kbd> で取消）。顧客情報・本人確認・送料の詳細は行の<strong>📄（編集）ボタン</strong>からいつでも編集できます。
                    </p>
                  </li>
                </ul>
              </div>

              {/* Card 2: Kobutsu Act & Repeater Autofill */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
                <h3 className="font-bold text-sm text-sky-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  2. 古物営業法・古物台帳 ＆ リピーター補完
                </h3>
                <ul className="space-y-2 text-[11px] text-gray-700 leading-relaxed">
                  <li className="bg-sky-50/70 p-2.5 rounded-lg border border-sky-100">
                    <div className="font-bold text-sky-950 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-sky-700" /> 開閉式「古物台帳・本人確認情報（任意）」
                    </div>
                    <p className="mt-0.5">
                      住所・職業・生年月日（取引日から<strong>満年齢を自動計算</strong>）・本人確認書類（運転免許証等）・記号番号・品目特徴/型番・数量を記録できます。記録済み案件には台帳に緑の盾アイコンが付きます。
                    </p>
                  </li>
                  <li className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <div className="font-bold text-gray-900 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-700" /> リピーター自動補完 ＆ 法定11項目出力
                    </div>
                    <p className="mt-0.5">
                      過去案件と同じ顧客名を候補から選ぶと顧客情報を自動補完。<strong>入出力・保存 →「古物台帳」タブ</strong>から期間指定で Excel(.xlsx) または UTF-8 BOM付CSV を出力できます。
                    </p>
                  </li>
                </ul>
              </div>

              {/* Card 3: Mercari Shops & Auto 10% Platform Fee */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
                <h3 className="font-bold text-sm text-pink-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                  <ShoppingBag className="w-4 h-4 text-pink-600" />
                  3. メルカリShops ＆ EC手数料10%自動計算・送料
                </h3>
                <ul className="space-y-2 text-[11px] text-gray-700 leading-relaxed">
                  <li className="bg-pink-50/60 p-2.5 rounded-lg border border-pink-100">
                    <div className="font-bold text-pink-950 flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 text-pink-600" /> ヤフオク・メルカリ売上に連動して手数料を自動算出
                    </div>
                    <p className="mt-0.5">
                      <strong>Y売上(J列)</strong> または <strong>メルカリShops売上(K列)</strong> を入力すると、既定料率 <strong>10%</strong> で<strong>販売手数料(N列)</strong>を自動計算します。
                    </p>
                  </li>
                  <li className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <div className="font-bold text-gray-900">手動上書き ＆ 自動計算リセット・送料管理</div>
                    <p className="mt-0.5">
                      キャンペーン料率等で手動変更すると手動上書きモードになり、モーダル・詳細編集内の「10%自動計算に戻す」からいつでも自動計算へ復帰できます。<strong>送料/梱包費(O列)</strong>も粗利後の純利益計算へ自動反映されます。
                    </p>
                  </li>
                </ul>
              </div>

              {/* Card 4: Market, Carryover & Stagnant 30+ Days */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
                <h3 className="font-bold text-sm text-purple-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Gavel className="w-4 h-4 text-purple-600" />
                  4. 古物市場出品・繰越・30日超滞留アラート
                </h3>
                <ul className="space-y-2 text-[11px] text-gray-700 leading-relaxed">
                  <li className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                    <div className="font-bold text-emerald-950">台帳 ⇄ 市場管理（1クリック連携）</div>
                    <p className="mt-0.5">
                      行の <strong>🔨アイコン</strong> で市場出品登録。「市場管理」で実際落札額を入力し<strong>「台帳に反映」</strong>を押すと歩率差引後の手取り額が「市場売上」に入り「完結」になります。
                    </p>
                  </li>
                  <li className="bg-rose-50/60 p-2.5 rounded-lg border border-rose-200">
                    <div className="font-bold text-rose-950 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> 30日超の滞留在庫を自動抽出
                    </div>
                    <p className="mt-0.5">
                      「完結」以外の案件で取引日から30日以上経過した在庫を自動検知し、件数と滞留金額を台帳上部の赤アラートに表示（クリックで該当案件のみ絞り込み）。月末は「繰越管理」で翌月シートへ引き継げます。
                    </p>
                  </li>
                </ul>
              </div>

              {/* Card 5: Mobile & Filter */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
                <h3 className="font-bold text-sm text-amber-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  5. 現場スマホ表示 ＆ ステータス・滞留絞り込み
                </h3>
                <ul className="space-y-2 text-[11px] text-gray-700 leading-relaxed">
                  <li className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                    <div className="font-bold text-amber-950">スマホカード表示モード</div>
                    <p className="mt-0.5">
                      ツールバーの<strong>「カード表示」</strong>で横スクロール不要の1案件1カードに切り替え可能。車内でもメルカリ売上・手数料・古物編集・市場出品をワンタップで操作できます。
                    </p>
                  </li>
                  <li className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <div className="font-bold text-gray-900 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5 text-slate-600" /> ワンクリック絞り込み
                    </div>
                    <p className="mt-0.5">
                      ヘッダーのステータスフィルタで「すべて」「完結」「繰越」「市場出品中」「<strong>滞留30日超</strong>」および媒体別（チラシ・HP等）を即座に絞り込めます。
                    </p>
                  </li>
                </ul>
              </div>

              {/* Card 6: Formulas & Compatibility */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
                <h3 className="font-bold text-sm text-blue-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  6. 最新自動計算ルール ＆ データ保管・互換性
                </h3>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-[10.5px] space-y-1 text-slate-800 leading-relaxed">
                  <div>• <span className="font-bold text-blue-800">売上合計</span> = 金売上 + 市場売上 + Y売上 + メルカリ売上 + 回収・他</div>
                  <div>• <span className="font-bold text-emerald-800">案件粗利</span> = 売上合計 − 買取仕入額</div>
                  <div>• <span className="font-bold text-pink-800">EC手数料(既定10%)</span> = 四捨五入((Y売上 + メルカリ売上) × 10%)</div>
                  <div>• <span className="font-bold text-rose-800">経費・手数料計</span> = 販路手数料 + 送料/梱包費 + 交通費 + 処分費</div>
                  <div>• <span className="font-bold text-emerald-900">案件純利益</span> = 案件粗利 − 経費・手数料計</div>
                  <div>• <span className="font-bold text-cyan-800">月次最終手残り純利益</span> = 粗利計 − 広告費計 − 経費・手数料計</div>
                  <div>• <span className="font-bold text-purple-800">市場手取り</span> = 実際落札額 × (1 − 歩率%)</div>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  <strong>データの保管・互換:</strong> ブラウザに自動保存され、既存の旧形式データやスプレッドシート貼り付け（<strong>旧18列 / 新21列</strong>の両対応）を保ったまま安全に動作します。定期バックアップは<strong>「入出力・保存」</strong>から .xlsx 出力をご活用ください。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-gray-50 border-t border-gray-200 text-xs shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {tab !== 'map' && (
              <button
                type="button"
                onClick={() => setTab('map')}
                className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <MapIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>全体の流れ（1枚の地図）</span>
              </button>
            )}
            {tab !== 'scenes' && (
              <button
                type="button"
                onClick={() => setTab('scenes')}
                className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>目的別クイック手順</span>
              </button>
            )}
            {tab !== 'details' && (
              <button
                type="button"
                onClick={() => setTab('details')}
                className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>細かい操作・計算ルール</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleAction('kobutsu')}
              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-lg font-bold shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>古物台帳出力</span>
            </button>
            <button
              type="button"
              onClick={() => handleAction('add')}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>さっそく買取を登録する</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 rounded-lg font-semibold cursor-pointer"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
