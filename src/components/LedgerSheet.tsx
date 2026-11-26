import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet, Star, CheckCircle2, Coins, Plus, FileDown,
  Undo2, Redo2, Printer, Trash2, Copy, Search, ArrowUpDown,
  RotateCcw, Target, Smartphone, Table, Flame, CornerDownLeft,
  Gavel, UserCheck, TrendingUp, MapPin, Map as MapIcon, ChevronDown, ChevronUp, BookOpen,
  AlertTriangle, FileText, ShieldCheck, Filter
} from 'lucide-react';
import {
  DealRecord, AdCosts, STAFF_LIST, MEDIA_LIST, STATUS_LIST, CATEGORY_PRESETS,
  formatCurrency, calcStaffStats, calcRecordSales, calcRecordGross, calcRecordNet,
  calcDefaultPlatformFee, getElapsedDaysFromDeal, isStagnantRecord
} from '../data';
import { WorkflowMapDiagram, GuideActionType } from './GuideModal';

export type StatusFilterType = 'すべて' | '完結' | '繰越' | '市場出品中' | '滞留30日超';

export const SheetHeader: React.FC<{
  sheetTitle: string;
  onTitleChange: (val: string) => void;
  onOpenAddModal: () => void;
  onOpenGoldCalc: () => void;
  onOpenExportModal: () => void;
  onOpenGuide: () => void;
  statusFilter: StatusFilterType;
  onChangeStatusFilter: (s: StatusFilterType) => void;
  stagnantCount?: number;
  mediaFilter: string;
  onChangeMediaFilter: (m: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  lastSavedText: string;
  onResetDefault: () => void;
  viewMode: 'table' | 'card';
  onChangeViewMode: (m: 'table' | 'card') => void;
}> = ({
  sheetTitle,
  onTitleChange,
  onOpenAddModal,
  onOpenGoldCalc,
  onOpenExportModal,
  onOpenGuide,
  statusFilter,
  onChangeStatusFilter,
  stagnantCount = 0,
  mediaFilter,
  onChangeMediaFilter,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  lastSavedText,
  onResetDefault,
  viewMode,
  onChangeViewMode,
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [starred, setStarred] = useState(true);

  return (
    <header className="bg-white border-b border-gray-200 select-none shadow-xs">
      <div className="flex items-center justify-between px-3 py-1.5 gap-2 border-b border-gray-100 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded shrink-0" title="松浦売上管理表">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-8 h-8">
              <defs>
                <linearGradient id="hdrBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="hdrGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fde047" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
              </defs>
              <rect x="4" y="4" width="52" height="52" rx="12" fill="url(#hdrBgGrad)" />
              <path d="M4 16 C4 9.373 9.373 4 16 4 L44 4 C50.627 4 56 9.373 56 16 L56 19 L4 19 Z" fill="#065f46" opacity="0.55" />
              <g fill="#ffffff" opacity="0.92">
                <rect x="11" y="23" width="11" height="6" rx="1.5" />
                <rect x="25" y="23" width="24" height="6" rx="1.5" />
                <rect x="11" y="32" width="11" height="6" rx="1.5" />
                <rect x="25" y="32" width="24" height="6" rx="1.5" />
                <rect x="11" y="41" width="11" height="6" rx="1.5" />
                <rect x="25" y="41" width="16" height="6" rx="1.5" />
              </g>
              <circle cx="46" cy="46" r="15" fill="url(#hdrGoldGrad)" stroke="#ffffff" strokeWidth="2.5" />
              <path d="M41.5 39.5 L46 45.5 L50.5 39.5 M42.5 46.5 H49.5 M42.5 49.5 H49.5 M46 45.5 V53" stroke="#78350f" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              {editingTitle ? (
                <input
                  type="text"
                  value={sheetTitle}
                  onChange={e => onTitleChange(e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
                  autoFocus
                  className="px-1.5 py-0.5 text-base font-semibold text-gray-800 border border-emerald-500 rounded focus:outline-none"
                />
              ) : (
                <h1
                  onClick={() => setEditingTitle(true)}
                  className="text-base font-semibold text-gray-800 cursor-pointer hover:bg-gray-100 px-1.5 py-0.5 rounded truncate transition-colors"
                  title="クリックしてタイトルを変更"
                >
                  {sheetTitle}
                </h1>
              )}
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded-full font-bold">
                <UserCheck className="w-3 h-3 text-cyan-600" />
                松浦 専用台帳
              </span>
              <button
                onClick={() => setStarred(!starred)}
                className={`p-1 rounded hover:bg-gray-100 cursor-pointer ${starred ? 'text-amber-500' : 'text-gray-400'}`}
                title="スターを付ける"
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
              <span className="flex items-center gap-1 text-xs text-emerald-700 px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">{lastSavedText}</span>
              </span>
            </div>

            <div className="flex items-center gap-0.5 text-xs text-gray-700 mt-0.5 flex-wrap">
              {['ファイル', '編集', '表示', '挿入', 'ツール', 'データ', 'ガイド'].map(menu => (
                <div key={menu} className="relative">
                  <button
                    onClick={() => {
                      if (menu === 'ガイド') {
                        setOpenMenu(null);
                        onOpenGuide();
                      } else {
                        setOpenMenu(openMenu === menu ? null : menu);
                      }
                    }}
                    onMouseEnter={() => menu !== 'ガイド' && openMenu && setOpenMenu(menu)}
                    className={`px-2 py-0.5 rounded hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer ${
                      openMenu === menu ? 'bg-gray-100 text-emerald-700 font-medium' : ''
                    } ${menu === 'ガイド' ? 'text-sky-700 font-semibold hover:bg-sky-50' : ''}`}
                  >
                    {menu}
                  </button>
                  {openMenu === menu && menu !== 'ガイド' && (
                    <div
                      className="absolute top-full left-0 z-50 min-w-52 bg-white border border-gray-200 rounded-md shadow-lg py-1 text-xs text-gray-700"
                      onMouseLeave={() => setOpenMenu(null)}
                    >
                      {menu === 'ファイル' && (
                        <>
                          <button
                            onClick={() => { onOpenExportModal(); setOpenMenu(null); }}
                            className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between cursor-pointer"
                          >
                            <span>入出力・古物台帳出力</span>
                            <span className="text-[10px] text-gray-400">.xlsx / CSV</span>
                          </button>
                          <button
                            onClick={() => { onOpenAddModal(); setOpenMenu(null); }}
                            className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                          >
                            新規買取案件を追加
                          </button>
                          <button
                            onClick={() => { window.print(); setOpenMenu(null); }}
                            className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                          >
                            印刷プレビュー
                          </button>
                          <div className="border-t border-gray-100 my-1" />
                          <button
                            onClick={() => {
                              setOpenMenu(null);
                              if (window.confirm('すべてのデータをゼロにリセットしますか？')) onResetDefault();
                            }}
                            className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 cursor-pointer font-semibold"
                          >
                            全データをゼロにリセット
                          </button>
                        </>
                      )}
                      {menu === '編集' && (
                        <>
                          <button
                            onClick={() => { onUndo(); setOpenMenu(null); }}
                            disabled={!canUndo}
                            className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 disabled:opacity-40 cursor-pointer"
                          >
                            元に戻す (Undo)
                          </button>
                          <button
                            onClick={() => { onRedo(); setOpenMenu(null); }}
                            disabled={!canRedo}
                            className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 disabled:opacity-40 cursor-pointer"
                          >
                            やり直し (Redo)
                          </button>
                        </>
                      )}
                      {menu === '表示' && (
                        <>
                          <button
                            onClick={() => {
                              onChangeStatusFilter(statusFilter === '繰越' ? 'すべて' : '繰越');
                              setOpenMenu(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between cursor-pointer"
                          >
                            <span>繰越・未売却在庫のみ絞り込み</span>
                            <span>{statusFilter === '繰越' ? '✓' : ''}</span>
                          </button>
                          <button
                            onClick={() => {
                              onChangeStatusFilter(statusFilter === '滞留30日超' ? 'すべて' : '滞留30日超');
                              setOpenMenu(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-rose-50 hover:text-rose-700 flex items-center justify-between cursor-pointer"
                          >
                            <span>滞留在庫(30日超)のみ絞り込み</span>
                            <span>{statusFilter === '滞留30日超' ? '✓' : ''}</span>
                          </button>
                          <button
                            onClick={() => { onChangeViewMode(viewMode === 'table' ? 'card' : 'table'); setOpenMenu(null); }}
                            className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between cursor-pointer"
                          >
                            <span>スマホ・カード表示モード</span>
                            <span>{viewMode === 'card' ? '✓' : ''}</span>
                          </button>
                        </>
                      )}
                      {menu === '挿入' && (
                        <button
                          onClick={() => { onOpenAddModal(); setOpenMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                        >
                          新しい買取行を追加
                        </button>
                      )}
                      {menu === 'ツール' && (
                        <button
                          onClick={() => { onOpenGoldCalc(); setOpenMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-amber-50 hover:text-amber-800 cursor-pointer"
                        >
                          金・貴金属グラムまとめ計算シミュレーター
                        </button>
                      )}
                      {menu === 'データ' && (
                        <button
                          onClick={() => { onOpenExportModal(); setOpenMenu(null); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                        >
                          TSV/CSVデータの貼り付けインポート・古物台帳出力
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="全体の流れ（1枚の地図）と詳しい操作ガイドを開く"
          >
            <MapIcon className="w-3.5 h-3.5 text-sky-600" />
            <span>全体マップ・使い方</span>
          </button>

          <button
            onClick={onOpenGoldCalc}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="出張先での金・プラチナグラムまとめ計算ツール"
          >
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>金相場まとめ計算</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>新規買取登録</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-gray-600" />
            <span className="hidden md:inline">入出力・保存</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('すべてのデータをゼロにリセットしますか？')) onResetDefault();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="全データをゼロにリセット"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ゼロにリセット</span>
          </button>
        </div>
      </div>

      {/* Quick Filter & Toolbar Strip */}
      <div className="flex items-center flex-wrap gap-1.5 px-3 py-1 bg-gray-50/90 text-gray-700 text-xs overflow-x-auto">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1 hover:bg-gray-200 disabled:opacity-30 rounded text-gray-600 cursor-pointer"
          title="元に戻す"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1 hover:bg-gray-200 disabled:opacity-30 rounded text-gray-600 cursor-pointer"
          title="やり直し"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => window.print()}
          className="p-1 hover:bg-gray-200 rounded text-gray-600 cursor-pointer"
          title="印刷"
        >
          <Printer className="w-3.5 h-3.5" />
        </button>
        <div className="h-4 w-px bg-gray-300 mx-0.5" />

        {/* Status Quick Filter */}
        <div className="flex items-center bg-white border border-gray-300 rounded p-0.5 gap-0.5">
          {(['すべて', '完結', '繰越', '市場出品中'] as const).map(st => (
            <button
              key={st}
              onClick={() => onChangeStatusFilter(st)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === st
                  ? st === '繰越'
                    ? 'bg-purple-600 text-white font-bold'
                    : st === '市場出品中'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-emerald-600 text-white font-bold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {st === '繰越' ? '繰越・未売却' : st}
            </button>
          ))}
          {(stagnantCount > 0 || statusFilter === '滞留30日超') && (
            <button
              onClick={() => onChangeStatusFilter(statusFilter === '滞留30日超' ? 'すべて' : '滞留30日超')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                statusFilter === '滞留30日超'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
              title="買取日から30日以上経過した未完結在庫で絞り込み"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>滞留30日超</span>
              <span className={`px-1 rounded-full text-[10px] font-mono ${
                statusFilter === '滞留30日超' ? 'bg-rose-800 text-white' : 'bg-rose-200 text-rose-900'
              }`}>
                {stagnantCount}
              </span>
            </button>
          )}
        </div>

        {/* Media Filter */}
        <div className="flex items-center bg-white border border-gray-300 rounded px-1.5 py-0.5 gap-1">
          <span className="text-[10px] text-gray-500 font-semibold">媒体:</span>
          <select
            value={mediaFilter}
            onChange={e => onChangeMediaFilter(e.target.value)}
            className="text-[11px] font-medium text-gray-800 bg-transparent outline-none cursor-pointer"
          >
            <option value="すべて">全媒体</option>
            {MEDIA_LIST.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="h-4 w-px bg-gray-300 mx-0.5" />
        <div className="flex items-center bg-white border border-gray-300 rounded p-0.5">
          <button
            onClick={() => onChangeViewMode('table')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] cursor-pointer ${
              viewMode === 'table' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Table className="w-3 h-3" />
            <span>表モード</span>
          </button>
          <button
            onClick={() => onChangeViewMode('card')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] cursor-pointer ${
              viewMode === 'card' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>スマホカード表示</span>
          </button>
        </div>

        <div className="ml-auto hidden xl:flex items-center gap-2 text-[11px] text-gray-500">
          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
            ✓ セル1クリック編集 | EC手数料10%自動計算 | 古物台帳＆30日滞留アラート対応
          </span>
        </div>
      </div>
    </header>
  );
};

export const LedgerSheet: React.FC<{
  records: DealRecord[];
  allRecords?: DealRecord[];
  adCosts: AdCosts;
  currentMonth: string;
  targetGrossProfit: number;
  onUpdateTargetGrossProfit: (val: number) => void;
  onAddRecord: (r: DealRecord) => void;
  onUpdateRecord: (r: DealRecord) => void;
  onDeleteRecord: (id: string) => void;
  onDuplicateRecord: (r: DealRecord) => void;
  onSendToMarket: (r: DealRecord) => void;
  onOpenAddModal: () => void;
  onEditRecordModal: (r: DealRecord) => void;
  onOpenGuide: () => void;
  onGuideAction: (action: GuideActionType) => void;
  statusFilter: StatusFilterType;
  onChangeStatusFilter: (s: StatusFilterType) => void;
  onSelectMonth?: (m: string) => void;
  mediaFilter: string;
  onUpdateMediaAdCost: (media: string, val: number) => void;
  viewMode: 'table' | 'card';
}> = ({
  records,
  allRecords,
  adCosts,
  currentMonth,
  targetGrossProfit,
  onUpdateTargetGrossProfit,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onDuplicateRecord,
  onSendToMarket,
  onOpenAddModal,
  onEditRecordModal,
  onOpenGuide,
  onGuideAction,
  statusFilter,
  onChangeStatusFilter,
  onSelectMonth,
  mediaFilter,
  onUpdateMediaAdCost,
  viewMode,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string; recordId?: string; field?: keyof DealRecord }>({
    row: 13,
    col: 'E',
  });
  const [formulaInput, setFormulaInput] = useState('');
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof DealRecord } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'purchaseDesc' | 'salesDesc' | 'grossDesc'>('default');
  const [editingAdMedia, setEditingAdMedia] = useState<'チラシ' | 'HP' | null>(null);
  const [editingTarget, setEditingTarget] = useState(false);
  const [showStartMap, setShowStartMap] = useState(true);
  const [isQuickManualFee, setIsQuickManualFee] = useState(false);

  const getTodayMD = () => {
    const now = new Date();
    return `${now.getMonth() + 1}/${now.getDate()}`;
  };

  const defaultDay = `${currentMonth.split('/')[1] || String(new Date().getMonth() + 1)}/${new Date().getDate()}`;
  const [quickRow, setQuickRow] = useState({
    date: defaultDay,
    area: '',
    customerName: '',
    category: '',
    purchaseAmount: '',
    media: 'チラシ',
    carryover: '',
    marketSales: '',
    goldSales: '',
    yahooSales: '',
    mercariSales: '',
    recoverySales: '',
    platformFee: '',
    shippingCost: '',
    transportCost: '',
    disposalCost: '',
    status: '完結',
    memo: '',
  });

  useEffect(() => {
    const m = currentMonth.split('/')[1];
    if (m) {
      setQuickRow(prev => ({
        ...prev,
        date: `${m}/${new Date().getDate()}`,
      }));
    }
  }, [currentMonth]);

  const updateQuickField = (field: keyof typeof quickRow, val: string) => {
    setQuickRow(prev => {
      const next = { ...prev, [field]: val };
      if ((field === 'yahooSales' || field === 'mercariSales') && !isQuickManualFee) {
        const y = Number(field === 'yahooSales' ? val : prev.yahooSales) || 0;
        const mc = Number(field === 'mercariSales' ? val : prev.mercariSales) || 0;
        const autoFee = calcDefaultPlatformFee(y, mc);
        next.platformFee = y + mc > 0 ? String(autoFee) : '';
      }
      return next;
    });
  };

  const handleQuickAdd = () => {
    if (!quickRow.customerName.trim() && !quickRow.category.trim() && !quickRow.purchaseAmount && !quickRow.area.trim()) return;
    const pAmt = Number(quickRow.purchaseAmount) || 0;
    const gSales = Number(quickRow.goldSales) || 0;
    const mSales = Number(quickRow.marketSales) || 0;
    const ySales = Number(quickRow.yahooSales) || 0;
    const mcSales = Number(quickRow.mercariSales) || 0;
    const rSales = Number(quickRow.recoverySales) || 0;
    const carry = Number(quickRow.carryover) || 0;
    const feeVal = quickRow.platformFee !== ''
      ? Number(quickRow.platformFee) || 0
      : calcDefaultPlatformFee(ySales, mcSales);

    onAddRecord({
      id: `rec-q-${Date.now()}`,
      month: currentMonth,
      date: quickRow.date || defaultDay,
      staff: STAFF_LIST[0],
      customerName: quickRow.customerName.trim() || 'お客様',
      area: quickRow.area.trim(),
      category: quickRow.category.trim(),
      purchaseAmount: pAmt,
      media: quickRow.media,
      carryover: carry,
      marketSales: mSales,
      goldSales: gSales,
      yahooSales: ySales,
      mercariSales: mcSales,
      recoverySales: rSales,
      estimatedGoldGrossProfit: gSales > 0 ? Math.max(0, gSales - pAmt) : 0,
      estimatedYahooGrossProfit: ySales > 0 ? Math.max(0, ySales - pAmt) : 0,
      platformFee: feeVal,
      shippingCost: Number(quickRow.shippingCost) || 0,
      transportCost: Number(quickRow.transportCost) || 0,
      disposalCost: Number(quickRow.disposalCost) || 0,
      status: carry > 0 && gSales + mSales + ySales + mcSales + rSales === 0 ? '全量繰越(未売却)' : quickRow.status,
      memo: quickRow.memo.trim(),
    });
    setIsQuickManualFee(false);
    setQuickRow(prev => ({
      ...prev,
      area: '',
      customerName: '',
      category: '',
      purchaseAmount: '',
      carryover: '',
      marketSales: '',
      goldSales: '',
      yahooSales: '',
      mercariSales: '',
      recoverySales: '',
      platformFee: '',
      shippingCost: '',
      transportCost: '',
      disposalCost: '',
      status: '完結',
      memo: '',
    }));
  };

  const quickPurchase = Number(quickRow.purchaseAmount) || 0;
  const quickSales =
    (Number(quickRow.goldSales) || 0) +
    (Number(quickRow.marketSales) || 0) +
    (Number(quickRow.yahooSales) || 0) +
    (Number(quickRow.mercariSales) || 0) +
    (Number(quickRow.recoverySales) || 0);
  const quickGrossPreview = quickSales - quickPurchase;

  // 滞留在庫（30日超・未完結）の抽出
  const currentStagnantRecords = useMemo(
    () => records.filter(r => isStagnantRecord(r, 30)),
    [records]
  );
  const allSourceRecords = allRecords || records;
  const allStagnantRecords = useMemo(
    () => allSourceRecords.filter(r => isStagnantRecord(r, 30)),
    [allSourceRecords]
  );
  const otherMonthStagnantRecords = useMemo(
    () => allStagnantRecords.filter(r => (r.month || '2026/9') !== currentMonth),
    [allStagnantRecords, currentMonth]
  );

  const currentStagnantPurchaseSum = currentStagnantRecords.reduce((s, r) => s + (r.purchaseAmount || 0), 0);
  const currentStagnantCarrySum = currentStagnantRecords.reduce((s, r) => s + (r.carryover || 0), 0);
  const allStagnantPurchaseSum = allStagnantRecords.reduce((s, r) => s + (r.purchaseAmount || 0), 0);
  const allStagnantCarrySum = allStagnantRecords.reduce((s, r) => s + (r.carryover || 0), 0);

  const matsuura = calcStaffStats('松浦', records, adCosts.松浦);
  const chirashiAd = adCosts.mediaCosts['チラシ'] || 0;
  const hpAd = adCosts.mediaCosts['HP'] || 0;
  const otherMediaAd = Object.entries(adCosts.mediaCosts)
    .filter(([k]) => k !== 'チラシ' && k !== 'HP')
    .reduce((s, [, v]) => s + v, 0);

  const numericFields: (keyof DealRecord)[] = [
    'purchaseAmount',
    'carryover',
    'marketSales',
    'goldSales',
    'yahooSales',
    'mercariSales',
    'recoverySales',
    'estimatedGoldGrossProfit',
    'estimatedYahooGrossProfit',
    'platformFee',
    'shippingCost',
    'transportCost',
    'disposalCost',
  ];

  const filteredRecords = records
    .filter(r => {
      if (statusFilter === '完結' && r.status !== '完結') return false;
      if (statusFilter === '繰越' && r.carryover <= 0 && !r.status.includes('繰越')) return false;
      if (statusFilter === '市場出品中' && r.status !== '市場出品中') return false;
      if (statusFilter === '滞留30日超' && !isStagnantRecord(r, 30)) return false;
      if (mediaFilter !== 'すべて' && r.media !== mediaFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const match =
          r.customerName.toLowerCase().includes(q) ||
          (r.category || '').toLowerCase().includes(q) ||
          (r.area || '').toLowerCase().includes(q) ||
          (r.customerAddress || '').toLowerCase().includes(q) ||
          (r.itemFeatures || '').toLowerCase().includes(q) ||
          (r.memo || '').toLowerCase().includes(q) ||
          r.date.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'purchaseDesc') return b.purchaseAmount - a.purchaseAmount;
      if (sortBy === 'salesDesc') return calcRecordSales(b) - calcRecordSales(a);
      if (sortBy === 'grossDesc') return calcRecordGross(b) - calcRecordGross(a);
      return 0;
    });

  const handleSelectAndEdit = (row: number, col: string, rec: DealRecord, field: keyof DealRecord) => {
    setSelectedCell({ row, col, recordId: rec.id, field });
    setFormulaInput(String(rec[field] ?? ''));
    setEditingCell({ id: rec.id, field });
    setEditValue(String(rec[field] ?? ''));
  };

  const handleSelectCellOnly = (row: number, col: string, rec: DealRecord, field: keyof DealRecord) => {
    setSelectedCell({ row, col, recordId: rec.id, field });
    setFormulaInput(String(rec[field] ?? ''));
  };

  const applyRecordFieldUpdate = (rec: DealRecord, field: keyof DealRecord, rawVal: string) => {
    let parsed: any = rawVal;
    if (numericFields.includes(field)) {
      parsed = parseFloat(rawVal.replace(/,/g, '')) || 0;
    }
    const updated: DealRecord = { ...rec, [field]: parsed };
    if ((field === 'goldSales' || field === 'purchaseAmount') && updated.goldSales > 0) {
      updated.estimatedGoldGrossProfit = Math.max(0, updated.goldSales - updated.purchaseAmount);
    }
    if ((field === 'yahooSales' || field === 'purchaseAmount') && updated.yahooSales > 0) {
      updated.estimatedYahooGrossProfit = Math.max(0, updated.yahooSales - updated.purchaseAmount);
    }
    if (field === 'yahooSales' || field === 'mercariSales') {
      const prevAutoFee = calcDefaultPlatformFee(rec.yahooSales, rec.mercariSales);
      const prevFee = rec.platformFee;
      if (prevFee === undefined || prevFee === prevAutoFee) {
        updated.platformFee = calcDefaultPlatformFee(updated.yahooSales, updated.mercariSales);
      }
    }
    onUpdateRecord(updated);
  };

  const handleCommitEdit = (rec: DealRecord) => {
    if (!editingCell) return;
    applyRecordFieldUpdate(rec, editingCell.field, editValue);
    setEditingCell(null);
  };

  const handleFormulaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell.recordId || !selectedCell.field) return;
    const targetRec = records.find(r => r.id === selectedCell.recordId);
    if (!targetRec) return;
    applyRecordFieldUpdate(targetRec, selectedCell.field, formulaInput);
  };

  const grossMarginPct = matsuura.salesTotal > 0 ? (matsuura.grossProfit / matsuura.salesTotal) * 100 : 0;
  const totalFixedCosts = matsuura.adCost + matsuura.otherExpenses;
  const breakEvenRemaining = Math.max(0, totalFixedCosts - matsuura.grossProfit);
  const breakEvenPct = totalFixedCosts > 0 ? Math.min(100, Math.max(0, (matsuura.grossProfit / totalFixedCosts) * 100)) : 100;
  const targetPct = targetGrossProfit > 0 ? Math.min(100, Math.max(0, (matsuura.grossProfit / targetGrossProfit) * 100)) : 0;

  const salesChannels = [
    { label: '金・地金(即換金)', amount: matsuura.goldSalesTotal, color: 'bg-amber-500' },
    { label: '古物市場', amount: matsuura.marketSalesTotal, color: 'bg-emerald-500' },
    { label: 'ヤフオク', amount: matsuura.yahooSalesTotal, color: 'bg-blue-500' },
    { label: 'メルカリShops', amount: matsuura.mercariSalesTotal, color: 'bg-rose-500' },
    { label: '回収・その他', amount: matsuura.recoverySalesTotal, color: 'bg-slate-500' },
  ];

  const handleAlertBannerClick = () => {
    if (currentStagnantRecords.length > 0 || statusFilter === '滞留30日超') {
      onChangeStatusFilter(statusFilter === '滞留30日超' ? 'すべて' : '滞留30日超');
      return;
    }
    if (otherMonthStagnantRecords.length > 0 && onSelectMonth) {
      const targetMonth = otherMonthStagnantRecords[0].month || '2026/9';
      onSelectMonth(targetMonth);
      onChangeStatusFilter('滞留30日超');
    }
  };

  const activeAlertCount = currentStagnantRecords.length > 0 ? currentStagnantRecords.length : allStagnantRecords.length;
  const activeAlertPurchaseSum = currentStagnantRecords.length > 0 ? currentStagnantPurchaseSum : allStagnantPurchaseSum;
  const activeAlertCarrySum = currentStagnantRecords.length > 0 ? currentStagnantCarrySum : allStagnantCarrySum;
  const activeAlertDisplayAmount = activeAlertCarrySum > 0 ? activeAlertCarrySum : activeAlertPurchaseSum;

  return (
    <div className="flex flex-col flex-1 bg-white overflow-hidden text-xs text-gray-800">
      {/* Datalist suggestions */}
      <datalist id="category-presets">
        {CATEGORY_PRESETS.map(c => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {/* Formula & Search Bar */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 bg-gray-50 border-b border-gray-200 text-xs shrink-0">
        <form onSubmit={handleFormulaSubmit} className="flex items-center gap-2 flex-1 min-w-64">
          <div className="flex items-center justify-center font-mono font-semibold px-2 py-0.5 min-w-14 bg-white border border-gray-300 rounded text-gray-700 shadow-2xs">
            {selectedCell.col}{selectedCell.row}
          </div>
          <div className="text-gray-400 font-serif italic font-bold select-none text-sm px-1">fx</div>
          <div className="h-4 w-px bg-gray-300" />
          <input
            type="text"
            value={formulaInput}
            onChange={e => setFormulaInput(e.target.value)}
            placeholder="セルをクリックして値を編集 (Enterで確定)"
            className="flex-1 bg-white px-2 py-1 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 rounded outline-none font-mono text-gray-800"
          />
        </form>

        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="お客様名・品目・地域・特徴で検索..."
              className="pl-7 pr-2.5 py-1 bg-white border border-gray-300 rounded-md text-xs focus:border-emerald-500 outline-none w-52"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-md px-2 py-1">
            <ArrowUpDown className="w-3 h-3 text-gray-500" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs text-gray-700 outline-none bg-transparent cursor-pointer"
            >
              <option value="default">登録順</option>
              <option value="salesDesc">売上高い順</option>
              <option value="grossDesc">粗利高い順</option>
              <option value="purchaseDesc">買取額高い順</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <div className="inline-block min-w-full align-top bg-white p-3 space-y-4">
          {/* Stagnant Stock Alert Banner (30日超 未完結) */}
          {allStagnantRecords.length > 0 && (
            <div
              onClick={handleAlertBannerClick}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleAlertBannerClick();
                }
              }}
              className={`rounded-xl border-2 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 transition-all cursor-pointer select-none shadow-2xs ${
                statusFilter === '滞留30日超'
                  ? 'bg-rose-600 border-rose-700 text-white'
                  : 'bg-rose-50 hover:bg-rose-100/80 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className={`p-1.5 rounded-lg shrink-0 ${statusFilter === '滞留30日超' ? 'bg-rose-800 text-amber-300' : 'bg-rose-200 text-rose-800'}`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                    <span>
                      【滞留在庫アラート】30日超の未完結案件：
                      {currentStagnantRecords.length > 0
                        ? `当月 ${currentStagnantRecords.length}件`
                        : `他月シートに ${otherMonthStagnantRecords.length}件`}
                    </span>
                    <span className={`font-mono px-2 py-0.5 rounded text-xs font-extrabold ${
                      statusFilter === '滞留30日超' ? 'bg-rose-800 text-white' : 'bg-white border border-rose-300 text-rose-800'
                    }`}>
                      合計 ¥{formatCurrency(activeAlertDisplayAmount)}
                    </span>
                  </div>
                  <div className={`text-[11px] mt-0.5 ${statusFilter === '滞留30日超' ? 'text-rose-100' : 'text-rose-800'}`}>
                    対象内訳 — 買取仕入計: ¥{formatCurrency(activeAlertPurchaseSum)}
                    {activeAlertCarrySum > 0 && ` ／ 繰越在庫評価計: ¥${formatCurrency(activeAlertCarrySum)}`}
                    {otherMonthStagnantRecords.length > 0 && currentStagnantRecords.length > 0 && (
                      <span className="ml-2 font-semibold">
                        （※他月にも {otherMonthStagnantRecords.length}件 の滞留在庫あり）
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  statusFilter === '滞留30日超'
                    ? 'bg-white text-rose-700 shadow-2xs'
                    : 'bg-rose-600 text-white shadow-2xs'
                }`}>
                  <Filter className="w-3.5 h-3.5" />
                  <span>
                    {statusFilter === '滞留30日超'
                      ? `絞り込み解除（全${records.length}件へ）`
                      : currentStagnantRecords.length > 0
                      ? `クリックして該当${activeAlertCount}件のみ表示`
                      : `${otherMonthStagnantRecords[0]?.month || ''}シートで確認`}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Top Personal Dashboard (松浦専用 統合サマリー) */}
          <div className="border border-gray-300 rounded shadow-xs bg-white overflow-hidden">
            <div className="bg-slate-800 text-white px-4 py-1.5 flex flex-wrap items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2.5">
                <span className="font-bold tracking-wide text-amber-300 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  松浦 出張買取 売上・粗利サマリー（{currentMonth}度）
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-700 text-cyan-300 rounded font-mono">
                  成約 {matsuura.purchaseCount}件 / 客単価 ¥{formatCurrency(matsuura.averageCustomerSpend)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <div>
                  総売上: <span className="font-bold text-amber-300">¥{formatCurrency(matsuura.salesTotal)}</span>
                </div>
                <div>
                  総粗利: <span className="font-bold text-emerald-300">¥{formatCurrency(matsuura.grossProfit)}</span>
                </div>
                <div>
                  手残り純利: <span className={`font-bold ${matsuura.netProfit >= 0 ? 'text-cyan-300' : 'text-rose-300'}`}>¥{formatCurrency(matsuura.netProfit)}</span>
                </div>
              </div>
            </div>

            {/* Goal & Break-even Progress Bar Strip */}
            <div className="bg-slate-900/95 text-white px-4 py-2 border-b border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
              {/* Target Gross Profit Gauge */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
                    <Target className="w-3.5 h-3.5" />
                    月間目標粗利ゲージ (クリック編集):
                    {editingTarget ? (
                      <input
                        type="number"
                        value={targetGrossProfit}
                        onFocus={e => e.target.select()}
                        onChange={e => onUpdateTargetGrossProfit(Number(e.target.value) || 0)}
                        onBlur={() => setEditingTarget(false)}
                        onKeyDown={e => e.key === 'Enter' && setEditingTarget(false)}
                        autoFocus
                        className="w-28 px-1.5 py-0.5 bg-slate-800 border border-emerald-400 rounded font-mono text-white text-right outline-none"
                      />
                    ) : (
                      <span
                        onClick={() => setEditingTarget(true)}
                        className="font-mono font-bold text-white underline decoration-dotted cursor-pointer hover:text-emerald-200"
                      >
                        ¥{formatCurrency(targetGrossProfit)}
                      </span>
                    )}
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {targetGrossProfit > 0 ? `${targetPct.toFixed(1)}% 達成` : '目標未設定'}
                    {targetGrossProfit > matsuura.grossProfit && targetGrossProfit > 0 && (
                      <span className="text-slate-400 font-normal ml-1.5">
                        (あと ¥{formatCurrency(targetGrossProfit - matsuura.grossProfit)})
                      </span>
                    )}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${targetPct}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Break-Even / Ad Cost Recovery Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <Flame className="w-3.5 h-3.5" />
                    広告費・経費・手数料回収ライン (分岐点: ¥{formatCurrency(totalFixedCosts)}):
                  </span>
                  <span className="font-mono font-bold">
                    {totalFixedCosts === 0 ? (
                      <span className="text-slate-400">広告費・経費 ¥0</span>
                    ) : breakEvenRemaining === 0 ? (
                      <span className="text-emerald-400">★ 損益分岐クリア！(+¥{formatCurrency(matsuura.netProfit)} 黒字)</span>
                    ) : (
                      <span className="text-rose-300">ペイまであと ¥{formatCurrency(breakEvenRemaining)} ({breakEvenPct.toFixed(1)}%)</span>
                    )}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${breakEvenPct}%` }}
                    className={`h-full transition-all duration-300 ${
                      breakEvenRemaining === 0 ? 'bg-gradient-to-r from-amber-400 to-emerald-400' : 'bg-gradient-to-r from-rose-500 to-amber-400'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* 2-Column Personal Dashboard: Left=当月収支・利益サマリー / Right=販路別内訳＆媒体実績 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-300 text-xs">
              {/* Left Panel: 松浦 当月収支・利益サマリー */}
              <div className="bg-cyan-50/40 p-3 flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-cyan-200">
                  <span className="px-2.5 py-0.5 bg-cyan-800 text-white font-bold rounded text-[11px] flex items-center gap-1.5 shadow-2xs">
                    <UserCheck className="w-3.5 h-3.5" />
                    松浦 当月収支・利益サマリー
                  </span>
                  <span className="font-mono text-cyan-900 font-bold text-xs">
                    粗利率: {grossMarginPct.toFixed(1)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-white p-2 rounded border border-cyan-200">
                    <div className="text-gray-500 text-[10px]">当月総売上</div>
                    <div className="font-mono font-extrabold text-blue-800 text-sm">¥{formatCurrency(matsuura.salesTotal)}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">客単価 ¥{formatCurrency(matsuura.averageCustomerSpend)}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-cyan-200">
                    <div className="text-gray-500 text-[10px]">買取仕入総額</div>
                    <div className="font-mono font-bold text-rose-700 text-sm">¥{formatCurrency(matsuura.purchaseTotal)}</div>
                    <div className="text-[10px] text-cyan-700 mt-0.5 font-semibold">{matsuura.purchaseCount}件 成約</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-emerald-300 bg-emerald-50/30">
                    <div className="text-emerald-800 text-[10px] font-semibold">獲得粗利益</div>
                    <div className="font-mono font-extrabold text-emerald-700 text-sm">¥{formatCurrency(matsuura.grossProfit)}</div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">売上 - 仕入</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-purple-200 bg-purple-50/30">
                    <div className="text-purple-800 text-[10px] font-semibold">翌月繰越(未売却)</div>
                    <div className="font-mono font-bold text-purple-700 text-sm">¥{formatCurrency(matsuura.carryoverTotal)}</div>
                    <div className="text-[10px] text-purple-600 mt-0.5">在庫プール</div>
                  </div>
                </div>

                {/* 収支計算バー */}
                <div className="bg-white border border-cyan-200 rounded-lg p-2.5 space-y-1.5 text-[11px]">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-gray-100">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-gray-600 flex items-center gap-1">
                        <span>チラシ広告費:</span>
                        {editingAdMedia === 'チラシ' ? (
                          <input
                            type="number"
                            value={chirashiAd}
                            onFocus={e => e.target.select()}
                            onChange={e => onUpdateMediaAdCost('チラシ', Number(e.target.value) || 0)}
                            onBlur={() => setEditingAdMedia(null)}
                            onKeyDown={e => e.key === 'Enter' && setEditingAdMedia(null)}
                            autoFocus
                            className="w-24 px-1.5 py-0.5 text-right bg-white border border-cyan-500 rounded font-mono text-xs outline-none"
                          />
                        ) : (
                          <span
                            onClick={() => setEditingAdMedia('チラシ')}
                            className="font-mono font-bold text-gray-900 underline decoration-dotted cursor-pointer hover:text-cyan-700"
                            title="クリックしてチラシ広告費を編集"
                          >
                            ¥{formatCurrency(chirashiAd)}
                          </span>
                        )}
                      </span>
                      <span className="text-gray-600 flex items-center gap-1">
                        <span>HP広告費:</span>
                        {editingAdMedia === 'HP' ? (
                          <input
                            type="number"
                            value={hpAd}
                            onFocus={e => e.target.select()}
                            onChange={e => onUpdateMediaAdCost('HP', Number(e.target.value) || 0)}
                            onBlur={() => setEditingAdMedia(null)}
                            onKeyDown={e => e.key === 'Enter' && setEditingAdMedia(null)}
                            autoFocus
                            className="w-24 px-1.5 py-0.5 text-right bg-white border border-emerald-500 rounded font-mono text-xs outline-none"
                          />
                        ) : (
                          <span
                            onClick={() => setEditingAdMedia('HP')}
                            className="font-mono font-bold text-gray-900 underline decoration-dotted cursor-pointer hover:text-emerald-700"
                            title="クリックしてHP広告費を編集"
                          >
                            ¥{formatCurrency(hpAd)}
                          </span>
                        )}
                      </span>
                      {otherMediaAd > 0 && (
                        <span className="text-gray-500 font-mono">他広告: ¥{formatCurrency(otherMediaAd)}</span>
                      )}
                    </div>
                    <span
                      className="text-gray-600 font-mono"
                      title={`販売手数料¥${formatCurrency(matsuura.platformFeeTotal)} + 送料梱包¥${formatCurrency(matsuura.shippingCostTotal)} + 交通費¥${formatCurrency(matsuura.transportCostTotal)} + 処分費¥${formatCurrency(matsuura.disposalCostTotal)}`}
                    >
                      経費・手数料計: <strong className="text-rose-700">¥{formatCurrency(matsuura.otherExpenses)}</strong>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-0.5 flex-wrap gap-1">
                    <span className="font-bold text-gray-700 text-xs">
                      粗利 ¥{formatCurrency(matsuura.grossProfit)} − 広告 ¥{formatCurrency(matsuura.adCost)} − 経費・手数料 ¥{formatCurrency(matsuura.otherExpenses)} ＝
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-cyan-950">最終手残り純利益:</span>
                      <span className={`font-mono text-base font-extrabold ${matsuura.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        ¥{formatCurrency(matsuura.netProfit)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel: 販路別売上内訳 ＆ 集客媒体別パフォーマンス */}
              <div className="bg-slate-50/70 p-3 flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-300">
                  <span className="px-2.5 py-0.5 bg-slate-800 text-white font-bold rounded text-[11px] flex items-center gap-1.5 shadow-2xs">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
                    販路別売上構成 ＆ 集客媒体パフォーマンス
                  </span>
                  <span className="text-[10px] text-gray-500">リアルタイム集計</span>
                </div>

                {/* 販路別 売上ミニバー */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {salesChannels.map(ch => {
                    const pct = matsuura.salesTotal > 0 ? Math.round((ch.amount / matsuura.salesTotal) * 100) : 0;
                    return (
                      <div key={ch.label} className="bg-white border border-gray-200 rounded p-1.5 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-gray-600 truncate font-medium">{ch.label}</span>
                          <span className="font-mono text-gray-400">{pct}%</span>
                        </div>
                        <div className="font-mono font-bold text-xs text-gray-900">¥{formatCurrency(ch.amount)}</div>
                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div style={{ width: `${pct}%` }} className={`h-full ${ch.color}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 集客媒体別 コンパクト表 */}
                <div className="bg-white rounded border border-gray-200 p-2 text-[11px]">
                  <div className="grid grid-cols-6 text-gray-500 font-semibold text-[10px] pb-1 border-b border-gray-200">
                    <span>集客媒体</span>
                    <span className="text-right">件数</span>
                    <span className="text-right">買取額</span>
                    <span className="text-right">売上計</span>
                    <span className="text-right">粗利計</span>
                    <span className="text-right">平均粗利</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {matsuura.mediaBreakdown.map(mb => (
                      <div key={mb.media} className="grid grid-cols-6 py-0.5 font-mono text-gray-700 items-center">
                        <span className={`font-sans font-semibold truncate ${
                          mb.media === 'チラシ' ? 'text-blue-700' : mb.media === 'HP' ? 'text-emerald-700' : 'text-gray-700'
                        }`}>
                          {mb.media}
                        </span>
                        <span className="text-right font-bold">{mb.count}</span>
                        <span className="text-right text-rose-700">{formatCurrency(mb.purchaseSum)}</span>
                        <span className="text-right">{formatCurrency(mb.totalSales)}</span>
                        <span className={`text-right font-bold ${mb.totalGross >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {formatCurrency(mb.totalGross)}
                        </span>
                        <span className="text-right text-gray-600">{formatCurrency(mb.averageUnitPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 初期画面ガイド: 当月データが0件のとき「まずは全体の流れ」1枚マップを差し出す */}
          {records.length === 0 && (
            <div className="border-2 border-sky-300 rounded-2xl bg-white shadow-xs overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-sky-50 border-b border-sky-200">
                <div className="flex items-center gap-2">
                  <MapIcon className="w-4 h-4 text-sky-700" />
                  <span className="font-bold text-xs sm:text-sm text-sky-950">
                    はじめての方へ：まずは1枚の地図で全体の流れをつかみましょう（データ登録後に自動で隠れます）
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onOpenGuide}
                    className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>細かい操作ガイドを開く</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStartMap(!showStartMap)}
                    className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {showStartMap ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>地図を折りたたむ</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>地図を表示</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              {showStartMap && (
                <div className="p-3">
                  <WorkflowMapDiagram onAction={onGuideAction} compact />
                </div>
              )}
            </div>
          )}

          {/* Card View Mode (Mobile / Field Mode) */}
          {viewMode === 'card' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-emerald-950">スマホ・車内クイックカード表示モード ({filteredRecords.length}件)</span>
                </div>
                <button
                  onClick={onOpenAddModal}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> 新規案件追加
                </button>
              </div>

              {filteredRecords.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
                  表示する案件データはありません。右上の「新規買取登録」または表モード下部の「＋入力」から追加してください。
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredRecords.map(rec => {
                    const gross = calcRecordGross(rec);
                    const net = calcRecordNet(rec);
                    const elapsedDays = getElapsedDaysFromDeal(rec);
                    const isStagnant = isStagnantRecord(rec, 30);
                    return (
                      <div
                        key={rec.id}
                        className={`bg-white rounded-xl p-4 shadow-2xs space-y-3 ${
                          isStagnant ? 'border-2 border-rose-400 bg-rose-50/15' : 'border border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2 gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            <span className="px-2 py-0.5 bg-gray-100 rounded font-mono font-bold text-gray-700 shrink-0">{rec.date}</span>
                            {isStagnant && elapsedDays !== null && (
                              <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded font-bold text-[10px] shrink-0">
                                滞留 {elapsedDays}日
                              </span>
                            )}
                            <span className="font-bold text-sm text-gray-900 truncate">{rec.customerName}</span>
                            {(rec.idDocType || rec.customerAddress) && (
                              <span title="古物台帳・本人確認入力済" className="text-emerald-600 shrink-0">
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </span>
                            )}
                            {rec.area && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] shrink-0">
                                <MapPin className="w-2.5 h-2.5" />
                                {rec.area}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <select
                              value={rec.media}
                              onChange={e => onUpdateRecord({ ...rec, media: e.target.value })}
                              className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-semibold outline-none"
                            >
                              {MEDIA_LIST.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <button
                              onClick={() => onEditRecordModal(rec)}
                              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                              title="詳細・古物台帳情報を編集"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onSendToMarket(rec)}
                              className="p-1 text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                              title="この案件を古物市場へ出品登録"
                            >
                              <Gavel className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDuplicateRecord(rec)}
                              className="p-1 text-gray-400 hover:text-emerald-600 cursor-pointer"
                              title="複製"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteRecord(rec.id)}
                              className="p-1 text-gray-400 hover:text-rose-600 cursor-pointer"
                              title="削除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 text-xs text-gray-600">
                          <div>
                            <span className="font-semibold text-gray-800">品目:</span> {rec.category || '-'}
                            {rec.memo && <div className="text-[11px] text-gray-500 mt-0.5">メモ: {rec.memo}</div>}
                          </div>
                          <select
                            value={rec.status}
                            onChange={e => onUpdateRecord({ ...rec, status: e.target.value })}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold outline-none shrink-0 ${
                              rec.status === '完結'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.status === '市場出品中'
                                ? 'bg-blue-100 text-blue-800'
                                : rec.status === '全量繰越(未売却)'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {STATUS_LIST.map(st => <option key={st} value={st}>{st}</option>)}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                          <div className="bg-rose-50 p-2 rounded border border-rose-200">
                            <div className="text-[10px] text-rose-700 font-sans">買取金額(仕入)</div>
                            <input
                              type="number"
                              value={rec.purchaseAmount}
                              onFocus={e => e.target.select()}
                              onChange={e => applyRecordFieldUpdate(rec, 'purchaseAmount', e.target.value)}
                              className="w-full bg-white border border-rose-300 rounded px-1.5 py-0.5 font-bold text-rose-800 mt-0.5"
                            />
                          </div>
                          <div className="bg-amber-50 p-2 rounded border border-amber-200">
                            <div className="text-[10px] text-amber-800 font-sans">金売上(即換金)</div>
                            <input
                              type="number"
                              value={rec.goldSales}
                              onFocus={e => e.target.select()}
                              onChange={e => applyRecordFieldUpdate(rec, 'goldSales', e.target.value)}
                              className="w-full bg-white border border-amber-300 rounded px-1.5 py-0.5 font-bold text-amber-900 mt-0.5"
                            />
                          </div>
                          <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
                            <div className="text-[10px] text-emerald-800 font-sans">市場売上</div>
                            <input
                              type="number"
                              value={rec.marketSales}
                              onFocus={e => e.target.select()}
                              onChange={e => applyRecordFieldUpdate(rec, 'marketSales', e.target.value)}
                              className="w-full bg-white border border-emerald-300 rounded px-1.5 py-0.5 font-bold text-emerald-900 mt-0.5"
                            />
                          </div>
                          <div className="bg-purple-50 p-2 rounded border border-purple-200">
                            <div className="text-[10px] text-purple-800 font-sans">翌月繰越</div>
                            <input
                              type="number"
                              value={rec.carryover}
                              onFocus={e => e.target.select()}
                              onChange={e => applyRecordFieldUpdate(rec, 'carryover', e.target.value)}
                              className="w-full bg-white border border-purple-300 rounded px-1.5 py-0.5 font-bold text-purple-900 mt-0.5"
                            />
                          </div>
                          <div className="bg-blue-50 p-2 rounded border border-blue-200">
                            <div className="text-[10px] text-blue-800 font-sans">Y売上(ヤフオク)</div>
                            <input
                              type="number"
                              value={rec.yahooSales}
                              onFocus={e => e.target.select()}
                              onChange={e => applyRecordFieldUpdate(rec, 'yahooSales', e.target.value)}
                              className="w-full bg-white border border-blue-300 rounded px-1.5 py-0.5 font-bold text-blue-900 mt-0.5"
                            />
                          </div>
                          <div className="bg-rose-50/70 p-2 rounded border border-rose-200">
                            <div className="text-[10px] text-rose-800 font-sans">メルカリShops</div>
                            <input
                              type="number"
                              value={rec.mercariSales || 0}
                              onFocus={e => e.target.select()}
                              onChange={e => applyRecordFieldUpdate(rec, 'mercariSales', e.target.value)}
                              className="w-full bg-white border border-rose-300 rounded px-1.5 py-0.5 font-bold text-rose-900 mt-0.5"
                            />
                          </div>
                          <div className="bg-orange-50 p-2 rounded border border-orange-200">
                            <div className="text-[10px] text-orange-800 font-sans">販売手数料(10%自動)</div>
                            <input
                              type="number"
                              value={rec.platformFee || 0}
                              onFocus={e => e.target.select()}
                              onChange={e => applyRecordFieldUpdate(rec, 'platformFee', e.target.value)}
                              className="w-full bg-white border border-orange-300 rounded px-1.5 py-0.5 font-bold text-orange-900 mt-0.5"
                            />
                          </div>
                          <div className="bg-gray-50 p-2 rounded border border-gray-200">
                            <div className="text-[10px] text-gray-700 font-sans">送料・梱包費</div>
                            <input
                              type="number"
                              value={rec.shippingCost || 0}
                              onFocus={e => e.target.select()}
                              onChange={e => applyRecordFieldUpdate(rec, 'shippingCost', e.target.value)}
                              className="w-full bg-white border border-gray-300 rounded px-1.5 py-0.5 font-bold text-gray-900 mt-0.5"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 font-mono text-xs">
                          <div>
                            <span className="font-sans text-gray-500 mr-1.5">粗利:</span>
                            <span className={`font-bold ${gross >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                              {gross >= 0 ? '+' : ''}¥{formatCurrency(gross)}
                            </span>
                          </div>
                          <div>
                            <span className="font-sans text-gray-500 mr-1.5">経費・手数料後:</span>
                            <span className={`text-sm font-extrabold ${net >= 0 ? 'text-cyan-800' : 'text-rose-600'}`}>
                              {net >= 0 ? '+' : ''}¥{formatCurrency(net)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Main Spreadsheet Table */
            <div className="border border-gray-300 rounded shadow-xs bg-white overflow-hidden">
              <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    松浦 出張買取 実績明細シート（1クリックで即編集＋最下部クイック連続追加）
                  </span>
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-mono">
                    表示中: {filteredRecords.length} 件
                  </span>
                  {statusFilter !== 'すべて' && (
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium border ${
                      statusFilter === '滞留30日超'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-purple-100 text-purple-800 border-purple-300'
                    }`}>
                      ※ 状態: {statusFilter}
                    </span>
                  )}
                  {mediaFilter !== 'すべて' && (
                    <span className="text-xs bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded-md font-medium">
                      ※ 媒体: {mediaFilter}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenAddModal}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>詳細・古物情報モーダルで追加</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans text-xs select-none">
                  <thead>
                    <tr className="bg-gray-100 text-gray-500 border-b border-gray-300 text-[10px] font-mono text-center">
                      <th className="w-10 py-1 bg-gray-200 border-r border-gray-300">#</th>
                      <th className="w-20 border-r border-gray-300">A (日付)</th>
                      <th className="w-24 border-r border-gray-300">B (地域)</th>
                      <th className="w-32 border-r border-gray-300">C (お客様/案件)</th>
                      <th className="w-32 border-r border-gray-300">D (品目)</th>
                      <th className="w-24 border-r border-gray-300 bg-cyan-100/60 text-cyan-900 font-bold">E (買取仕入)</th>
                      <th className="w-20 border-r border-gray-300">F (媒体)</th>
                      <th className="w-24 border-r border-gray-300 bg-purple-50 text-purple-900">G (繰越/在庫)</th>
                      <th className="w-24 border-r border-gray-300 bg-emerald-50 text-emerald-900">H (市場売上)</th>
                      <th className="w-24 border-r border-gray-300 bg-amber-100/60 text-amber-900 font-bold">I (金売上)</th>
                      <th className="w-20 border-r border-gray-300">J (Y売上)</th>
                      <th className="w-24 border-r border-gray-300 bg-rose-50 text-rose-900">K (メルカリ)</th>
                      <th className="w-20 border-r border-gray-300">L (回収/他)</th>
                      <th className="w-24 border-r border-gray-300 bg-emerald-100/70 text-emerald-900 font-bold">M (案件粗利)</th>
                      <th className="w-20 border-r border-gray-300 bg-orange-50 text-orange-900">N (手数料)</th>
                      <th className="w-20 border-r border-gray-300">O (送料/梱包)</th>
                      <th className="w-16 border-r border-gray-300">P (交通費)</th>
                      <th className="w-16 border-r border-gray-300">Q (処分費)</th>
                      <th className="w-28 border-r border-gray-300">R (状態)</th>
                      <th className="min-w-40 border-r border-gray-300">S (メモ・備考)</th>
                      <th className="w-28">操作</th>
                    </tr>
                    <tr className="bg-gray-50 text-gray-700 border-b border-gray-300 font-semibold text-center">
                      <td className="py-2 bg-gray-100 border-r border-gray-300 font-mono text-[11px]">行</td>
                      <td className="px-2 py-1.5 border-r border-gray-300">日付</td>
                      <td className="px-2 py-1.5 border-r border-gray-300 text-left">訪問地域</td>
                      <td className="px-2 py-1.5 border-r border-gray-300 text-left">お客様名 / 案件</td>
                      <td className="px-2 py-1.5 border-r border-gray-300 text-left">品目カテゴリ</td>
                      <td className="px-2 py-1.5 border-r border-gray-300 bg-cyan-100/70 text-cyan-950 text-right">買取金額</td>
                      <td className="px-2 py-1.5 border-r border-gray-300">集客媒体</td>
                      <td className="px-2 py-1.5 border-r border-gray-300 bg-purple-100/70 text-purple-950 text-right">翌月繰越</td>
                      <td className="px-2 py-1.5 border-r border-gray-300 bg-emerald-100/70 text-emerald-950 text-right">市場売上</td>
                      <td className="px-2 py-1.5 border-r border-gray-300 bg-amber-200/80 text-amber-950 text-right">金売上</td>
                      <td className="px-2 py-1.5 border-r border-gray-300 text-right">Y売上</td>
                      <td className="px-2 py-1.5 border-r border-gray-300 bg-rose-100/70 text-rose-950 text-right">メルカリShops</td>
                      <td className="px-2 py-1.5 border-r border-gray-300 text-right">回収・他</td>
                      <td className="px-2 py-1.5 border-r border-gray-300 bg-emerald-200/70 text-emerald-950 text-right">自動粗利</td>
                      <td className="px-2 py-1.5 border-r border-gray-300 bg-orange-100/70 text-orange-950 text-right" title="ヤフオク・メルカリ売上の10%自動計算（クリックで手動変更可）">EC手数料</td>
                      <td className="px-2 py-1.5 border-r border-gray-300 text-right">送料/梱包</td>
                      <td className="px-2 py-1.5 border-r border-gray-300 text-right">交通費</td>
                      <td className="px-2 py-1.5 border-r border-gray-300 text-right">処分費</td>
                      <td className="px-2 py-1.5 border-r border-gray-300">案件状態</td>
                      <td className="px-2 py-1.5 border-r border-gray-300 text-left">詳細・メモ</td>
                      <td className="px-2 py-1.5">詳細/市/複/消</td>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 font-mono">
                    {filteredRecords.map((rec, idx) => {
                      const rowNum = 13 + idx;
                      const isRowSelected = selectedCell.row === rowNum;
                      const dealGross = calcRecordGross(rec);
                      const elapsedDays = getElapsedDaysFromDeal(rec);
                      const isStagnant = isStagnantRecord(rec, 30);
                      const hasKobutsuInfo = Boolean(rec.idDocType || rec.idDocNumber || rec.customerAddress);

                      const renderEditableNumber = (colLetter: string, field: keyof DealRecord, extraClass = '') => {
                        const val = Number(rec[field]) || 0;
                        const isEditing = editingCell?.id === rec.id && editingCell.field === field;
                        return (
                          <td
                            onClick={() => {
                              if (!isEditing) handleSelectAndEdit(rowNum, colLetter, rec, field);
                            }}
                            className={`px-2 py-1 text-right border-r border-gray-200 cursor-pointer hover:ring-1 hover:ring-inset hover:ring-emerald-400 ${extraClass}`}
                            title="クリックで数値を直接編集"
                          >
                            {isEditing ? (
                              <input
                                type="number"
                                value={editValue}
                                onFocus={e => e.target.select()}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={() => handleCommitEdit(rec)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleCommitEdit(rec);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                autoFocus
                                className="w-full px-1 py-0.5 border border-emerald-500 rounded bg-white text-right text-xs outline-none"
                              />
                            ) : (
                              formatCurrency(val)
                            )}
                          </td>
                        );
                      };

                      const renderEditableText = (
                        colLetter: string,
                        field: keyof DealRecord,
                        extraClass = '',
                        listId?: string,
                        prefixBadge?: React.ReactNode
                      ) => {
                        const val = String(rec[field] ?? '');
                        const isEditing = editingCell?.id === rec.id && editingCell.field === field;
                        return (
                          <td
                            onClick={() => {
                              if (!isEditing) handleSelectAndEdit(rowNum, colLetter, rec, field);
                            }}
                            className={`px-2 py-1 border-r border-gray-200 font-sans cursor-pointer hover:ring-1 hover:ring-inset hover:ring-emerald-400 ${extraClass}`}
                            title="クリックでテキスト編集"
                          >
                            {isEditing ? (
                              <input
                                type="text"
                                list={listId}
                                value={editValue}
                                onFocus={e => e.target.select()}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={() => handleCommitEdit(rec)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleCommitEdit(rec);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                autoFocus
                                className="w-full px-1 py-0.5 border border-emerald-500 rounded bg-white text-xs outline-none"
                              />
                            ) : (
                              <div className="flex items-center gap-1 justify-between">
                                <span className="truncate">{val || '-'}</span>
                                {prefixBadge}
                              </div>
                            )}
                          </td>
                        );
                      };

                      return (
                        <tr
                          key={rec.id}
                          className={`hover:bg-blue-50/50 transition-colors ${
                            isStagnant
                              ? 'bg-rose-50/50'
                              : isRowSelected
                              ? 'bg-blue-50/70'
                              : idx % 2 === 0
                              ? 'bg-white'
                              : 'bg-gray-50/30'
                          }`}
                        >
                          <td className={`py-1 px-1 text-center border-r border-gray-300 text-[11px] font-mono select-none ${
                            isStagnant ? 'bg-rose-100 text-rose-800 font-bold' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {rowNum}
                          </td>
                          {/* A: 日付 */}
                          <td
                            onClick={() => {
                              if (!(editingCell?.id === rec.id && editingCell.field === 'date')) {
                                handleSelectAndEdit(rowNum, 'A', rec, 'date');
                              }
                            }}
                            className="px-1.5 py-1 text-center font-sans font-medium text-gray-700 border-r border-gray-200 cursor-pointer hover:ring-1 hover:ring-inset hover:ring-emerald-400"
                            title="クリックで日付を編集"
                          >
                            {editingCell?.id === rec.id && editingCell.field === 'date' ? (
                              <input
                                type="text"
                                value={editValue}
                                onFocus={e => e.target.select()}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={() => handleCommitEdit(rec)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleCommitEdit(rec);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                autoFocus
                                className="w-full px-1 py-0.5 border border-emerald-500 rounded bg-white text-center text-xs outline-none"
                              />
                            ) : (
                              <div className="flex flex-col items-center leading-tight">
                                <span>{rec.date}</span>
                                {isStagnant && elapsedDays !== null && (
                                  <span className="text-[9px] px-1 rounded bg-rose-200 text-rose-900 font-bold whitespace-nowrap mt-0.5">
                                    滞留{elapsedDays}日
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          {renderEditableText('B', 'area', 'text-gray-600 max-w-24')}
                          {renderEditableText(
                            'C',
                            'customerName',
                            'font-medium text-gray-900 max-w-32',
                            undefined,
                            hasKobutsuInfo ? (
                              <span title="古物台帳・本人確認入力済" className="text-emerald-600 shrink-0">
                                <ShieldCheck className="w-3 h-3" />
                              </span>
                            ) : undefined
                          )}
                          {renderEditableText('D', 'category', 'text-gray-600 max-w-32', 'category-presets')}
                          {renderEditableNumber(
                            'E',
                            'purchaseAmount',
                            `bg-cyan-50/40 font-semibold ${rec.purchaseAmount > 0 ? 'text-gray-900' : 'text-gray-400'}`
                          )}
                          <td
                            onClick={() => handleSelectCellOnly(rowNum, 'F', rec, 'media')}
                            className="px-1.5 py-1 text-center border-r border-gray-200 font-sans"
                          >
                            <select
                              value={rec.media}
                              onChange={e => onUpdateRecord({ ...rec, media: e.target.value })}
                              className={`px-1 py-0.5 rounded text-[10px] font-medium outline-none cursor-pointer ${
                                rec.media === 'チラシ'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : rec.media === 'HP'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {MEDIA_LIST.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </td>
                          {renderEditableNumber(
                            'G',
                            'carryover',
                            `bg-purple-50/40 font-bold ${rec.carryover > 0 ? 'text-purple-700' : 'text-gray-400'}`
                          )}
                          {renderEditableNumber(
                            'H',
                            'marketSales',
                            `bg-emerald-50/40 ${rec.marketSales > 0 ? 'text-emerald-800 font-bold' : 'text-gray-400'}`
                          )}
                          {renderEditableNumber(
                            'I',
                            'goldSales',
                            `bg-amber-50 ${rec.goldSales > 0 ? 'text-amber-900 font-extrabold bg-amber-100/60' : 'text-gray-400'}`
                          )}
                          {renderEditableNumber(
                            'J',
                            'yahooSales',
                            rec.yahooSales > 0 ? 'text-gray-900 font-bold' : 'text-gray-400'
                          )}
                          {renderEditableNumber(
                            'K',
                            'mercariSales',
                            `bg-rose-50/40 ${(rec.mercariSales || 0) > 0 ? 'text-rose-800 font-bold' : 'text-gray-400'}`
                          )}
                          {renderEditableNumber(
                            'L',
                            'recoverySales',
                            rec.recoverySales > 0 ? 'text-gray-800 font-semibold' : 'text-gray-400'
                          )}
                          {/* M: 案件粗利 (自動計算) */}
                          <td
                            onClick={() => handleSelectCellOnly(rowNum, 'M', rec, 'purchaseAmount')}
                            className={`px-2 py-1 text-right border-r border-gray-200 font-bold ${
                              dealGross > 0
                                ? 'bg-emerald-50/70 text-emerald-700'
                                : dealGross < 0
                                ? rec.carryover > 0
                                  ? 'bg-purple-50/60 text-purple-700'
                                  : 'bg-rose-50/70 text-rose-600'
                                : 'bg-gray-50/50 text-gray-400'
                            }`}
                            title="売上合計 - 買取仕入額（自動計算）"
                          >
                            {dealGross > 0 ? '+' : ''}
                            {formatCurrency(dealGross)}
                          </td>
                          {renderEditableNumber(
                            'N',
                            'platformFee',
                            `bg-orange-50/40 ${(rec.platformFee || 0) > 0 ? 'text-orange-800 font-semibold' : 'text-gray-400'}`
                          )}
                          {renderEditableNumber(
                            'O',
                            'shippingCost',
                            (rec.shippingCost || 0) > 0 ? 'text-gray-700' : 'text-gray-400'
                          )}
                          {renderEditableNumber('P', 'transportCost', 'text-gray-600')}
                          {renderEditableNumber('Q', 'disposalCost', 'text-gray-600')}
                          <td
                            onClick={() => handleSelectCellOnly(rowNum, 'R', rec, 'status')}
                            className="px-1.5 py-1 text-center border-r border-gray-200 font-sans"
                          >
                            <select
                              value={rec.status}
                              onChange={e => onUpdateRecord({ ...rec, status: e.target.value })}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold outline-none cursor-pointer ${
                                rec.status === '完結'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rec.status === '市場出品中'
                                  ? 'bg-blue-100 text-blue-800'
                                  : rec.status === '全量繰越(未売却)'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {STATUS_LIST.map(st => <option key={st} value={st}>{st}</option>)}
                            </select>
                          </td>
                          {renderEditableText('S', 'memo', 'text-gray-600 max-w-48 text-[11px]')}
                          <td className="px-1.5 py-1 text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              <button
                                onClick={() => onEditRecordModal(rec)}
                                className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                title="詳細・古物台帳情報を編集"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onSendToMarket(rec)}
                                className="p-1 text-emerald-600 hover:text-emerald-800 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                                title="古物市場へ1クリック出品登録"
                              >
                                <Gavel className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDuplicateRecord(rec)}
                                className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                                title="この行を複製"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteRecord(rec.id)}
                                className="p-1 text-gray-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                title="行を削除"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Quick Continuous Entry Row (Tab + Enter) */}
                    <tr className="bg-emerald-50/50 border-t-2 border-emerald-300">
                      <td className="py-1.5 px-1 text-center bg-emerald-100 border-r border-emerald-300 text-emerald-800 font-bold text-[10px]">
                        ＋入力
                      </td>
                      <td className="p-1 border-r border-gray-200">
                        <div className="flex items-center gap-0.5">
                          <input
                            type="text"
                            value={quickRow.date}
                            onChange={e => updateQuickField('date', e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleQuickAdd()}
                            placeholder="日付"
                            className="w-full px-1 py-1 bg-white border border-gray-300 rounded text-center font-sans text-xs focus:border-emerald-600 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuickField('date', getTodayMD())}
                            className="px-1 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[9px] font-sans font-bold shrink-0 cursor-pointer"
                            title="今日の日付をセット"
                          >
                            今日
                          </button>
                        </div>
                      </td>
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={quickRow.area}
                          onChange={e => updateQuickField('area', e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleQuickAdd()}
                          placeholder="地域"
                          className="w-full px-1.5 py-1 bg-white border border-gray-300 rounded font-sans text-xs focus:border-emerald-600 outline-none"
                        />
                      </td>
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={quickRow.customerName}
                          onChange={e => updateQuickField('customerName', e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleQuickAdd()}
                          placeholder="お客様名 (Tab)"
                          className="w-full px-1.5 py-1 bg-white border border-gray-300 rounded font-sans text-xs focus:border-emerald-600 outline-none"
                        />
                      </td>
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          list="category-presets"
                          value={quickRow.category}
                          onChange={e => updateQuickField('category', e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleQuickAdd()}
                          placeholder="品目"
                          className="w-full px-1.5 py-1 bg-white border border-gray-300 rounded font-sans text-xs focus:border-emerald-600 outline-none"
                        />
                      </td>
                      <td className="p-1 border-r border-gray-200 bg-cyan-50/50">
                        <input
                          type="number"
                          value={quickRow.purchaseAmount}
                          onChange={e => updateQuickField('purchaseAmount', e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleQuickAdd()}
                          placeholder="買取額"
                          className="w-full px-1.5 py-1 bg-white border border-cyan-300 rounded text-right text-xs focus:border-cyan-600 outline-none"
                        />
                      </td>
                      <td className="p-1 border-r border-gray-200 text-center font-sans">
                        <select
                          value={quickRow.media}
                          onChange={e => updateQuickField('media', e.target.value)}
                          className="px-1 py-1 bg-white border border-gray-300 rounded text-[10px] outline-none"
                        >
                          {MEDIA_LIST.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </td>
                      <td className="p-1 border-r border-gray-200 bg-purple-50/40">
                        <input
                          type="number"
                          value={quickRow.carryover}
                          onChange={e => updateQuickField('carryover', e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleQuickAdd()}
                          placeholder="繰越"
                          className="w-full px-1.5 py-1 bg-white border border-purple-200 rounded text-right text-xs focus:border-purple-500 outline-none"
                        />
                      </td>
                      <td className="p-1 border-r border-gray-200 bg-emerald-50/40">
                        <input
                          type="number"
                          value={quickRow.marketSales}
                          onChange={e => updateQuickField('marketSales', e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleQuickAdd()}
                          placeholder="市場売"
                          className="w-full px-1.5 py-1 bg-white border border-emerald-200 rounded text-right text-xs focus:border-emerald-500 outline-none"
                        />
                      </td>
                      <td className="p-1 border-r border-gray-200 bg-amber-50/60">
                        <input
                          type="number"
                          value={quickRow.goldSales}
                          onChange={e => updateQuickField('goldSales', e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleQuickAdd()}
                          placeholder="金売上"
                          className="w-full px-1.5 py-1 bg-white border border-amber-300 rounded text-right text-xs focus:border-amber-600 outline-none"
                        />
                      </td>
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={quickRow.yahooSales}
                          onChange={e => updateQuickField('yahooSales', e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleQuickAdd()}
                          placeholder="Y売上"
                          className="w-full px-1.5 py-1 bg-white border border-gray-300 rounded text-right text-xs outline-none"
                        />
                      </td>
                      <td className="p-1 border-r border-gray-200 bg-rose-50/40">
                        <input
                          type="number"
                          value={quickRow.mercariSales}
                          onChange={e => updateQuickField('mercariSales', e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleQuickAdd()}
                          placeholder="メルカリ"
                          className="w-full px-1.5 py-1 bg-white border border-rose-200 rounded text-right text-xs focus:border-rose-500 outline-none"
                        />
                      </td>
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={quickRow.recoverySales}
                          onChange={e => updateQuickField('recoverySales', e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleQuickAdd()}
                          placeholder="回収"
                          className="w-full px-1.5 py-1 bg-white border border-gray-300 rounded text-right text-xs outline-none"
                        />
                      </td>
                      <td className={`p-1 border-r border-gray-200 text-right text-[11px] font-bold bg-emerald-50/30 ${
                        quickGrossPreview > 0 ? 'text-emerald-700' : quickGrossPreview < 0 ? 'text-rose-600' : 'text-gray-400'
                      }`}>
                        {quickPurchase > 0 || quickSales > 0 ? (
                          <>{quickGrossPreview > 0 ? '+' : ''}{formatCurrency(quickGrossPreview)}</>
                        ) : (
                          '自動'
                        )}
                      </td>
                      <td className="p-1 border-r border-gray-200 bg-orange-50/40">
                        <input
                          type="number"
                          value={quickRow.platformFee}
                          onChange={e => {
                            const v = e.target.value;
                            if (v === '') {
                              setIsQuickManualFee(false);
                              const auto = calcDefaultPlatformFee(Number(quickRow.yahooSales), Number(quickRow.mercariSales));
                              setQuickRow(prev => ({ ...prev, platformFee: auto > 0 ? String(auto) : '' }));
                            } else {
                              setIsQuickManualFee(true);
                              setQuickRow(prev => ({ ...prev, platformFee: v }));
                            }
                          }}
                          onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleQuickAdd()}
                          placeholder="10%自動"
                          title="ヤフオク・メルカリ売上の10%自動算出（上書き可）"
                          className="w-full px-1 py-1 bg-white border border-orange-200 rounded text-right text-xs focus:border-orange-500 outline-none"
                        />
                      </td>
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={quickRow.shippingCost}
                          onChange={e => updateQuickField('shippingCost', e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleQuickAdd()}
                          placeholder="送料"
                          className="w-full px-1 py-1 bg-white border border-gray-300 rounded text-right text-xs outline-none"
                        />
                      </td>
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={quickRow.transportCost}
                          onChange={e => updateQuickField('transportCost', e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleQuickAdd()}
                          placeholder="交通費"
                          className="w-full px-1 py-1 bg-white border border-gray-300 rounded text-right text-xs outline-none"
                        />
                      </td>
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="number"
                          value={quickRow.disposalCost}
                          onChange={e => updateQuickField('disposalCost', e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleQuickAdd()}
                          placeholder="処分費"
                          className="w-full px-1 py-1 bg-white border border-gray-300 rounded text-right text-xs outline-none"
                        />
                      </td>
                      <td className="p-1 border-r border-gray-200 text-center font-sans">
                        <select
                          value={quickRow.status}
                          onChange={e => updateQuickField('status', e.target.value)}
                          className="px-1 py-1 bg-white border border-gray-300 rounded text-[10px] outline-none"
                        >
                          {STATUS_LIST.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </td>
                      <td className="p-1 border-r border-gray-200">
                        <input
                          type="text"
                          value={quickRow.memo}
                          onChange={e => updateQuickField('memo', e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleQuickAdd()}
                          placeholder="メモ (Enterで即追加)"
                          className="w-full px-1.5 py-1 bg-white border border-gray-300 rounded font-sans text-xs focus:border-emerald-600 outline-none"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={handleQuickAdd}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-sans font-bold text-[11px] flex items-center justify-center gap-0.5 mx-auto cursor-pointer"
                          title="Enterキーでも追加できます"
                        >
                          <CornerDownLeft className="w-3 h-3" /> 追加
                        </button>
                      </td>
                    </tr>

                    {/* Summary Row */}
                    <tr className="bg-gray-100 font-bold border-t-2 border-gray-400 text-gray-900">
                      <td className="py-2 text-center bg-gray-200 border-r border-gray-300 font-mono text-[11px]">Σ</td>
                      <td className="px-2 py-1.5 text-center border-r border-gray-300 font-sans">合計</td>
                      <td className="px-2 py-1.5 border-r border-gray-300" />
                      <td className="px-2 py-1.5 border-r border-gray-300 font-sans text-xs">{filteredRecords.length} 案件合計</td>
                      <td className="px-2 py-1.5 border-r border-gray-300" />
                      <td className="px-2 py-1.5 text-right border-r border-gray-300 text-rose-700 bg-cyan-100/60 font-mono">
                        ¥{formatCurrency(filteredRecords.reduce((s, r) => s + r.purchaseAmount, 0))}
                      </td>
                      <td className="px-2 py-1.5 border-r border-gray-300" />
                      <td className="px-2 py-1.5 text-right border-r border-gray-300 text-purple-800 bg-purple-100/60 font-mono">
                        ¥{formatCurrency(filteredRecords.reduce((s, r) => s + r.carryover, 0))}
                      </td>
                      <td className="px-2 py-1.5 text-right border-r border-gray-300 text-emerald-800 bg-emerald-100/60 font-mono">
                        ¥{formatCurrency(filteredRecords.reduce((s, r) => s + r.marketSales, 0))}
                      </td>
                      <td className="px-2 py-1.5 text-right border-r border-gray-300 text-amber-900 bg-amber-200/80 font-mono">
                        ¥{formatCurrency(filteredRecords.reduce((s, r) => s + r.goldSales, 0))}
                      </td>
                      <td className="px-2 py-1.5 text-right border-r border-gray-300 font-mono">
                        ¥{formatCurrency(filteredRecords.reduce((s, r) => s + r.yahooSales, 0))}
                      </td>
                      <td className="px-2 py-1.5 text-right border-r border-gray-300 text-rose-800 bg-rose-100/60 font-mono">
                        ¥{formatCurrency(filteredRecords.reduce((s, r) => s + (r.mercariSales || 0), 0))}
                      </td>
                      <td className="px-2 py-1.5 text-right border-r border-gray-300 font-mono">
                        ¥{formatCurrency(filteredRecords.reduce((s, r) => s + r.recoverySales, 0))}
                      </td>
                      <td className="px-2 py-1.5 text-right border-r border-gray-300 text-emerald-800 bg-emerald-200/50 font-mono">
                        ¥{formatCurrency(filteredRecords.reduce((s, r) => s + calcRecordGross(r), 0))}
                      </td>
                      <td className="px-2 py-1.5 text-right border-r border-gray-300 text-orange-800 bg-orange-100/60 font-mono">
                        ¥{formatCurrency(filteredRecords.reduce((s, r) => s + (r.platformFee || 0), 0))}
                      </td>
                      <td className="px-2 py-1.5 text-right border-r border-gray-300 font-mono">
                        ¥{formatCurrency(filteredRecords.reduce((s, r) => s + (r.shippingCost || 0), 0))}
                      </td>
                      <td className="px-2 py-1.5 text-right border-r border-gray-300 font-mono">
                        ¥{formatCurrency(filteredRecords.reduce((s, r) => s + r.transportCost, 0))}
                      </td>
                      <td className="px-2 py-1.5 text-right border-r border-gray-300 font-mono">
                        ¥{formatCurrency(filteredRecords.reduce((s, r) => s + r.disposalCost, 0))}
                      </td>
                      <td className="px-2 py-1.5 border-r border-gray-300" />
                      <td className="px-2 py-1.5 border-r border-gray-300" />
                      <td className="px-2 py-1.5" />
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] text-gray-500">
                  ※ 任意のセルを1クリックして直接編集できます。古物台帳項目（住所・職業・生年月日・身分証）の入力は各行の📄ボタンまたは詳細モーダルから行えます。
                </span>
                <button
                  onClick={onOpenAddModal}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  詳細モーダルで追加する
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
