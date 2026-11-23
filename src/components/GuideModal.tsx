import React, { useState } from 'react';
import {
  X, Map as MapIcon, BookOpen, Coins, Plus, Gavel, Calendar, BarChart3, Layers,
  FileDown, ArrowRight, ArrowDown, CheckCircle2, Smartphone, Zap,
  Calculator, Sparkles, CornerDownLeft, MousePointerClick, ExternalLink
} from 'lucide-react';

export type GuideActionType =
  | 'gold'
  | 'add'
  | 'ledger'
  | 'market'
  | 'analytics'
  | 'media'
  | 'carryover'
  | 'export';

export const WorkflowMapDiagram: React.FC<{
  onAction?: (action: GuideActionType) => void;
  compact?: boolean;
}> = ({ onAction, compact = false }) => {
  const interactiveCls = onAction
    ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all'
    : '';

  return (
    <div className={`bg-slate-50 border border-slate-200 rounded-2xl ${compact ? 'p-3.5 space-y-3' : 'p-4 sm:p-5 space-y-4'}`}>
      {/* Map Title Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-600 text-white shadow-2xs">
            <MapIcon className="w-3.5 h-3.5" />
          </span>
          <div>
            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
              松浦売上管理表「全体の流れ」1枚マップ
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500">
              細かい操作の前に、まずは全体の地図を確認。各ステップをクリックすると該当機能へ直接移動します。
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">① 査定</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">② 台帳記録</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">③ 売却・繰越</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">④ 分析・出力</span>
        </div>
      </div>

      {/* UPPER FLOW: STEP 1 -> STEP 2 -> 3 SALES ROUTES */}
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
              K18・Ptなどの重さを合算し、掛率スライダーで<strong className="text-amber-800">買取提示額</strong>と<strong className="text-emerald-700">粗利</strong>を即試算。
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

        {/* STEP 2: Daily Ledger Entry */}
        <div
          onClick={() => onAction?.('add')}
          className={`lg:col-span-3 bg-white border-2 border-emerald-400 rounded-xl p-3 flex flex-col justify-between shadow-2xs ${interactiveCls}`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-extrabold tracking-wide">
                STEP 2｜日々の記録
              </span>
              <Plus className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm">月次台帳に買取を登録</div>
            <ul className="text-[11px] text-slate-600 mt-1.5 space-y-1">
              <li className="flex items-start gap-1">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>新規買取登録</strong>（品目タグ1クリック）</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>表最下部「＋入力」</strong>（Tab+Enter連続）</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>スマホカード表示</strong>（車内でサクッと）</span>
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
          <span className="text-[10px] font-bold ml-1">売却ルートに応じて3つに分岐</span>
        </div>

        {/* STEP 2.5: 3 Branching Sales Routes */}
        <div className="lg:col-span-4 flex flex-col gap-2 justify-between">
          {/* Route A: Immediate Cash */}
          <div
            onClick={() => onAction?.('ledger')}
            className={`bg-amber-50/80 border border-amber-300 rounded-lg px-3 py-2 flex items-center justify-between gap-2 ${interactiveCls}`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-amber-600 text-white rounded text-[9px] font-bold">ルートA</span>
                <span className="font-bold text-amber-950 text-xs">即現金化（金・Y売上・回収）</span>
              </div>
              <p className="text-[10px] text-amber-900 mt-0.5">
                売上額を入力 → 自動で粗利確定 ＆ ステータス<strong>「完結」</strong>
              </p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>

          {/* Route B: Antique Market */}
          <div
            onClick={() => onAction?.('market')}
            className={`bg-emerald-50/80 border border-emerald-300 rounded-lg px-3 py-2 flex items-center justify-between gap-2 ${interactiveCls}`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-emerald-700 text-white rounded text-[9px] font-bold">ルートB</span>
                <span className="font-bold text-emerald-950 text-xs">古物市場へ出品 → 落札反映</span>
              </div>
              <p className="text-[10px] text-emerald-900 mt-0.5">
                台帳の🔨ボタン → <strong>市場管理</strong> → 落札後に<strong>「台帳に反映」</strong>で完結
              </p>
            </div>
            <Gavel className="w-4 h-4 text-emerald-700 shrink-0" />
          </div>

          {/* Route C: Carryover */}
          <div
            onClick={() => onAction?.('carryover')}
            className={`bg-purple-50/80 border border-purple-300 rounded-lg px-3 py-2 flex items-center justify-between gap-2 ${interactiveCls}`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-purple-700 text-white rounded text-[9px] font-bold">ルートC</span>
                <span className="font-bold text-purple-950 text-xs">今月未売却（在庫繰越）</span>
              </div>
              <p className="text-[10px] text-purple-900 mt-0.5">
                繰越額を入力 → <strong>繰越管理</strong> → 月末1クリックで翌月シートへ引継
              </p>
            </div>
            <Calendar className="w-4 h-4 text-purple-700 shrink-0" />
          </div>
        </div>
      </div>

      {/* Down Connector to Analytics & Closing */}
      <div className="flex items-center justify-center gap-2 text-slate-400">
        <div className="flex-1 h-px bg-slate-200" />
        <div className="flex items-center gap-1 px-3 py-0.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 shadow-2xs">
          <ArrowDown className="w-3 h-3 text-blue-600" />
          <span>台帳に入力するだけで以下すべて自動集計</span>
          <ArrowDown className="w-3 h-3 text-blue-600" />
        </div>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* LOWER FLOW: STEP 3 (Analytics) -> STEP 4 (Closing & Export) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
        {/* STEP 3A: Profit & Daily Analytics */}
        <div
          onClick={() => onAction?.('analytics')}
          className={`lg:col-span-4 bg-white border-2 border-blue-300 rounded-xl p-3 flex flex-col justify-between ${interactiveCls}`}
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-extrabold">
                STEP 3-A｜収支・日別分析
              </span>
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="font-bold text-slate-900 text-xs">月次P&L・販路構成・日別グラフ</div>
            <p className="text-[11px] text-slate-600 mt-1">
              売上・買取原価・経費から<strong>最終手残り純利益</strong>を自動算出。日別チャートで好調日も一目で把握。
            </p>
          </div>
          {onAction && (
            <div className="mt-2 pt-1.5 border-t border-blue-100 text-right text-[10px] font-bold text-blue-700">
              収支・日別分析を開く →
            </div>
          )}
        </div>

        {/* STEP 3B: Media ROI */}
        <div
          onClick={() => onAction?.('media')}
          className={`lg:col-span-4 bg-white border-2 border-purple-300 rounded-xl p-3 flex flex-col justify-between ${interactiveCls}`}
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="px-2 py-0.5 bg-purple-700 text-white rounded text-[10px] font-extrabold">
                STEP 3-B｜媒体別分析
              </span>
              <Layers className="w-4 h-4 text-purple-700" />
            </div>
            <div className="font-bold text-slate-900 text-xs">チラシ・HPの広告費回収 (CPA / ROI)</div>
            <p className="text-[11px] text-slate-600 mt-1">
              折込チラシ代やHP広告費を入力すると、<strong>1件獲得単価(CPA)</strong>と<strong>回収率(ROI)</strong>を自動計算。
            </p>
          </div>
          {onAction && (
            <div className="mt-2 pt-1.5 border-t border-purple-100 text-right text-[10px] font-bold text-purple-700">
              媒体別分析を開く →
            </div>
          )}
        </div>

        {/* STEP 4: Export & Next Month */}
        <div
          onClick={() => onAction?.('export')}
          className={`lg:col-span-4 bg-slate-800 text-white border-2 border-slate-700 rounded-xl p-3 flex flex-col justify-between ${interactiveCls}`}
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-extrabold">
                STEP 4｜月末締め・出力
              </span>
              <FileDown className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-bold text-white text-xs">Excel / スプレッドシート出力 ＆ 翌月へ</div>
            <p className="text-[11px] text-slate-300 mt-1">
              1クリックで<strong className="text-amber-300">Googleスプレッドシート貼付</strong>や<strong className="text-emerald-300">.xlsx保存</strong>。画面下の「＋月追加」で翌月開始！
            </p>
          </div>
          {onAction && (
            <div className="mt-2 pt-1.5 border-t border-slate-700 text-right text-[10px] font-bold text-emerald-300">
              入出力・保存を開く →
            </div>
          )}
        </div>
      </div>

      {/* Color Legend Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[10px] text-slate-600">
        <span className="font-bold text-slate-700">画面の色分けルール:</span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-100 text-cyan-900 font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-600" /> シアン＝買取仕入（支払）
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> 黄色＝金売上（即換金）
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600" /> 緑＝市場売上・粗利益
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-semibold">
            <span className="w-2 h-2 rounded-full bg-purple-600" /> 紫＝翌月繰越（未売却在庫）
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
}> = ({ isOpen, onClose, onNavigateAction }) => {
  const [tab, setTab] = useState<'map' | 'details'>('map');

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
              <h2 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>松浦売上管理表 操作ガイド</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full font-medium">
                  まず1枚の全体地図から
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                日々の買取入力から古物市場の落札反映・利益確定・月次繰越までの流れ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setTab('map')}
                className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  tab === 'map' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>全体の流れ（1枚の地図）</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('details')}
                className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  tab === 'details' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>細かい操作・時短ワザ</span>
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
          {tab === 'map' ? (
            <>
              <WorkflowMapDiagram onAction={handleAction} />

              {/* Quick 3-Point Summary Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
                  <MousePointerClick className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-emerald-950 text-xs">迷ったら「1クリック」</div>
                    <p className="text-[11px] text-emerald-900 mt-0.5">
                      表の金額・テキスト・目標粗利・広告費はすべて<strong>1クリックで直接編集</strong>できます。
                    </p>
                  </div>
                </div>
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-950 text-xs">二重入力は不要</div>
                    <p className="text-[11px] text-amber-900 mt-0.5">
                      「金相場計算 → 台帳」「台帳 ⇄ 市場管理」「当月 → 翌月繰越」はすべて1クリック連携です。
                    </p>
                  </div>
                </div>
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-blue-950 text-xs">すべて自動保存・やり直し可</div>
                    <p className="text-[11px] text-blue-900 mt-0.5">
                      入力内容はブラウザに自動保存。間違えても左上の <strong>Undo (元に戻す)</strong> で戻せます。
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Fast Entry */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
                <h3 className="font-bold text-sm text-emerald-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  1. 入力を最速化する3つの方法
                </h3>
                <ul className="space-y-2 text-[11px] text-gray-700 leading-relaxed">
                  <li className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                    <div className="font-bold text-emerald-950 flex items-center gap-1">
                      <CornerDownLeft className="w-3.5 h-3.5" /> 連続入力は表最下部の「＋入力」行
                    </div>
                    <p className="mt-0.5">
                      「今日」ボタンで日付セット → <kbd className="px-1 bg-white border rounded font-mono">Tab</kbd> で右へ移動 → 最後に <kbd className="px-1 bg-white border rounded font-mono">Enter</kbd> で即追加。複数件を一気に打つときに最速です。
                    </p>
                  </li>
                  <li className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <div className="font-bold text-gray-900">詳細登録は「新規買取登録」モーダル</div>
                    <p className="mt-0.5">
                      品目タグを1クリックで追加でき、「未売却(全額繰越)」ボタンや「同時に市場管理にも登録」チェックボックスが使えます。
                    </p>
                  </li>
                  <li className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <div className="font-bold text-gray-900">修正はセルを1回クリックするだけ</div>
                    <p className="mt-0.5">
                      数値セルをクリックすると自動で全選択されるため、そのまま数字を打って <kbd className="px-1 bg-white border rounded font-mono">Enter</kbd> で上書き完了します（<kbd className="px-1 bg-white border rounded font-mono">Esc</kbd> で取消）。
                    </p>
                  </li>
                </ul>
              </div>

              {/* Card 2: Market & Carryover */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
                <h3 className="font-bold text-sm text-purple-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Gavel className="w-4 h-4 text-purple-600" />
                  2. 古物市場の出品 ＆ 翌月繰越のつなぎ方
                </h3>
                <ul className="space-y-2 text-[11px] text-gray-700 leading-relaxed">
                  <li className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                    <div className="font-bold text-emerald-950">台帳 → 市場管理（1クリック出品）</div>
                    <p className="mt-0.5">
                      明細行の右端にある <strong>🔨（ハンマー）アイコン</strong> を押すと、品目・買取額を引き継いで「市場管理」タブに自動登録され、状態も「市場出品中」に変わります。
                    </p>
                  </li>
                  <li className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                    <div className="font-bold text-emerald-950">市場管理 → 台帳（落札額の自動反映）</div>
                    <p className="mt-0.5">
                      オークション後に「実際落札額」を入力し、右端の <strong>「台帳に反映」</strong> を押すと、市場手数料（歩率）を差し引いた手取り額が元案件の「市場売上」に入り「完結」になります。
                    </p>
                  </li>
                  <li className="bg-purple-50/60 p-2.5 rounded-lg border border-purple-100">
                    <div className="font-bold text-purple-950">月末の在庫引き継ぎ</div>
                    <p className="mt-0.5">
                      画面下の <strong>「＋月追加」</strong> で来月シートを作成後、<strong>「繰越・月次引継」</strong> タブから「翌月シートへ引き継ぐ」を押すと未売却案件がまとめて移行されます。
                    </p>
                  </li>
                </ul>
              </div>

              {/* Card 3: Mobile & Filters */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
                <h3 className="font-bold text-sm text-amber-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  3. 現場スマホ活用 ＆ 絞り込み検索
                </h3>
                <ul className="space-y-2 text-[11px] text-gray-700 leading-relaxed">
                  <li className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                    <div className="font-bold text-amber-950">金相場まとめ計算（複数点合算）</div>
                    <p className="mt-0.5">
                      K24/K18/Pt900などを「まとめ査定リストに追加」で合算し、最後に「新規案件に反映」すると買取額・金売上・内訳メモが自動入力されます。
                    </p>
                  </li>
                  <li className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <div className="font-bold text-gray-900">スマホカード表示 ＆ ステータス絞り込み</div>
                    <p className="mt-0.5">
                      ツールバーの <strong>「スマホカード表示」</strong> で車内でも見やすく入力可能。隣のボタンで「完結」「繰越・未売却」「市場出品中」や媒体別に1クリック絞り込みできます。
                    </p>
                  </li>
                </ul>
              </div>

              {/* Card 4: Formulas & Backup */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
                <h3 className="font-bold text-sm text-blue-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  4. 自動計算のルール ＆ バックアップ
                </h3>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-[11px] space-y-1 text-slate-800">
                  <div>• <span className="font-bold text-blue-800">売上合計</span> = 金売上 + 市場売上 + Y売上 + 回収・他</div>
                  <div>• <span className="font-bold text-emerald-800">案件粗利</span> = 売上合計 − 買取仕入額</div>
                  <div>• <span className="font-bold text-cyan-800">最終手残り純利益</span> = 粗利計 − 広告費計 − (交通費 + 処分費)</div>
                  <div>• <span className="font-bold text-purple-800">市場手取り</span> = 実際落札額 × (1 − 歩率%)</div>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  <strong>データの保管:</strong> 入力データはご利用端末のブラウザ内に自動保存されます。PC移行や月末保管の際は、右上の <strong>「入出力・保存」</strong> から Excel（.xlsx）保存、またはGoogleスプレッドシートへ1クリック貼り付けしてください。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-gray-50 border-t border-gray-200 text-xs shrink-0">
          <div className="flex items-center gap-2">
            {tab === 'map' ? (
              <button
                type="button"
                onClick={() => setTab('details')}
                className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>細かい操作・時短ワザを見る</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setTab('map')}
                className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <MapIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>全体の流れ（1枚の地図）に戻る</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
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
