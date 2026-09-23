import { createContext, useContext } from 'react';

export type Lang = 'en' | 'ar';

export interface Dict {
  // App shell
  brand: string;
  brandTagline: string;
  searchPlaceholder: string;
  loadingData: string;
  marketStatus: string;
  marketLive: string;
  marketNote: string;
  openNav: string;
  closeNav: string;
  langToggle: string;

  // Auth
  loginTitle: string;
  loginSubtitle: string;
  loginEmail: string;
  loginEmailPlaceholder: string;
  loginPassword: string;
  loginPasswordPlaceholder: string;
  loginButton: string;
  loginSigningIn: string;
  loginError: string;
  logout: string;
  adminLabel: string;

  // Nav
  navMetals: string;
  navMetalsDesc: string;
  navFinance: string;
  navFinanceDesc: string;
  navInventory: string;
  navInventoryDesc: string;
  navStock: string;
  navStockDesc: string;
  navScanner: string;
  navScannerDesc: string;

  // Metal Analytics
  spotPrice: string;
  today: string;
  dayHigh: string;
  dayLow: string;
  sentiment: string;
  bullish: string;
  bearish: string;
  ratio: string;
  ratioDesc: string;
  live: string;
  goldLabel: string;
  silverLabel: string;
  purityLabel: string;
  conversionNote: string;
  gold24kLabel: string;
  gold18kLabel: string;
  pureSilverLabel: string;

  // Finance
  totalRevenue: string;
  moneyIn: string;
  totalExpenses: string;
  moneyOut: string;
  netProfitMargin: string;
  cashFlowTrend: string;
  cashFlowDesc: string;
  income: string;
  expense: string;
  recentTransactions: string;
  records: string;
  addTransaction: string;
  txId: string;
  txDate: string;
  txDescription: string;
  txType: string;
  txAmount: string;
  noTransactions: string;
  descPlaceholder: string;
  amountPlaceholder: string;
  saveTransaction: string;
  saving: string;
  sale: string;
  purchase: string;
  expenseKind: string;
  enterValid: string;

  // Inventory
  searchNameSku: string;
  filters: string;
  all: string;
  rings: string;
  necklaces: string;
  bracelets: string;
  earrings: string;
  maxPrice: string;
  inStock: string;
  noPieces: string;
  totalCaratWeight: string;
  diamondClarity: string;
  diamondColor: string;
  metalType: string;
  totalWeight: string;
  stockQuantity: string;
  sku: string;
  retailPrice: string;
  specifications: string;
  editDetails: string;
  viewHistory: string;
  ct: string;
  pcs: string;

  // Metal Stock
  totalReserveValue: string;
  liveValuation: string;
  physicalGold: string;
  physicalSilver: string;
  spotPricePerGram: string;
  liveValuationLabel: string;
  metalConsumption: string;
  consumptionDesc: string;
  goldGram: string;
  silverGram: string;
  consumed: string;
  kg: string;

  // Scanner
  qrScanner: string;
  scanOrManual: string;
  cameraOff: string;
  startCamera: string;
  uploadCode: string;
  manualLookup: string;
  enterSku: string;
  search: string;
  scanResult: string;
  resultDesc: string;
  scanPrompt: string;
  notFound: string;
  location: string;
  stock: string;
  fullSpecs: string;
  caratWeight: string;
  clarity: string;
  color: string;
  vaultLocation: string;

  // Invoice
  navInvoice: string;
  navInvoiceDesc: string;
  invoiceTitle: string;
  invoiceSubtitle: string;
  customerInfo: string;
  customerName: string;
  customerNamePlaceholder: string;
  customerPhone: string;
  customerPhonePlaceholder: string;
  invoiceDate: string;
  servicesList: string;
  servicesDesc: string;
  addCustomItem: string;
  customItemName: string;
  customItemPrice: string;
  addItem: string;
  noItemsSelected: string;
  colService: string;
  colQty: string;
  colPrice: string;
  colTotal: string;
  removeItem: string;
  summary: string;
  subtotal: string;
  discount: string;
  discountPlaceholder: string;
  totalAmount: string;
  printInvoice: string;
  resetInvoice: string;
  invoiceId: string;
  invoiceThankYou: string;
  invoicePhone: string;
  invoiceAddress: string;
  variablePrice: string;
  tnd: string;
  qty: string;
  price: string;
  print: string;
  scanToVerify: string;
  mizanTitle: string;
  mizanGold: string;
  mizanSilver: string;
  mizanWeight: string;
  mizanRate: string;
  mizanRateHint: string;
  mizanCalc: string;
  mizanAdd: string;
  mizanGram: string;
}

export const translations: Record<Lang, Dict> = {
  en: {
    brand: 'Glow Gallery',
    brandTagline: 'Jewelry Atelier',
    searchPlaceholder: 'Search SKU, item, transaction…',
    loadingData: 'Loading atelier data…',
    marketStatus: 'Market Status',
    marketLive: 'Live · NY Open',
    marketNote: 'Simulated spot feed for demonstration.',
    openNav: 'Open navigation',
    closeNav: 'Close navigation',
    langToggle: 'العربية',

    loginTitle: 'Admin Sign In',
    loginSubtitle: 'Enter your credentials to access the dashboard',
    loginEmail: 'Email',
    loginEmailPlaceholder: 'admin@glowgallery.com',
    loginPassword: 'Password',
    loginPasswordPlaceholder: 'Enter your password',
    loginButton: 'Sign In',
    loginSigningIn: 'Signing in…',
    loginError: 'Invalid email or password.',
    logout: 'Sign Out',
    adminLabel: 'Administrator',

    navMetals: 'Live Metal Analytics',
    navMetalsDesc: 'Gold & silver spot prices',
    navFinance: 'Finance & Cash Flow',
    navFinanceDesc: 'Revenue, expenses, profit',
    navInventory: 'Jewelry Inventory',
    navInventoryDesc: 'Catalog & detailed specs',
    navStock: 'Precious Metals Stock',
    navStockDesc: 'Raw bullion & reserves',
    navScanner: 'QR Code Scanner',
    navScannerDesc: 'Rapid SKU lookup',

    spotPrice: 'Spot Price',
    today: 'today',
    dayHigh: 'Day High',
    dayLow: 'Day Low',
    sentiment: 'Sentiment',
    bullish: 'Bullish',
    bearish: 'Bearish',
    ratio: 'XAU / XAG Ratio',
    ratioDesc: 'Gold-to-silver exchange ratio',
    live: 'Live',
    goldLabel: 'Gold (XAU)',
    silverLabel: 'Silver (XAG)',
    purityLabel: 'Purity',
    conversionNote: 'Conversion',
    gold24kLabel: 'Gold 24K',
    gold18kLabel: 'Gold 18K',
    pureSilverLabel: 'Pure Silver',

    totalRevenue: 'Total Revenue',
    moneyIn: 'Money In',
    totalExpenses: 'Total Expenses',
    moneyOut: 'Money Out',
    netProfitMargin: 'Net Profit Margin',
    cashFlowTrend: 'Cash Flow Trend',
    cashFlowDesc: 'Income vs. expenses over the last 14 entries',
    income: 'Income',
    expense: 'Expense',
    recentTransactions: 'Recent Transactions',
    records: 'records',
    addTransaction: 'Add Transaction',
    txId: 'ID',
    txDate: 'Date',
    txDescription: 'Description',
    txType: 'Type',
    txAmount: 'Amount',
    noTransactions: 'No transactions yet.',
    descPlaceholder: 'Description',
    amountPlaceholder: 'Amount (TND)',
    saveTransaction: 'Save Transaction',
    saving: 'Saving…',
    sale: 'Sale',
    purchase: 'Purchase',
    expenseKind: 'Expense',
    enterValid: 'Enter a description and a positive amount.',

    searchNameSku: 'Search name or SKU…',
    filters: 'Filters:',
    all: 'All',
    rings: 'Rings',
    necklaces: 'Necklaces',
    bracelets: 'Bracelets',
    earrings: 'Earrings',
    maxPrice: 'Max',
    inStock: 'in stock',
    noPieces: 'No pieces match your filters.',
    totalCaratWeight: 'Total Carat Weight',
    diamondClarity: 'Diamond Clarity',
    diamondColor: 'Diamond Color',
    metalType: 'Metal Type',
    totalWeight: 'Total Weight',
    stockQuantity: 'Stock Quantity',
    sku: 'SKU',
    retailPrice: 'Retail Price',
    specifications: 'Specifications',
    editDetails: 'Edit Details',
    viewHistory: 'View History',
    ct: 'ct',
    pcs: 'pcs',

    totalReserveValue: 'Total Reserve Value',
    liveValuation: 'Live valuation at spot',
    physicalGold: 'Physical Gold',
    physicalSilver: 'Physical Silver',
    spotPricePerGram: 'Spot price per gram',
    liveValuationLabel: 'Live valuation',
    metalConsumption: 'Metal Consumption · Production',
    consumptionDesc: 'Weekly raw metal used for manufacturing',
    goldGram: 'Gold (g)',
    silverGram: 'Silver (g)',
    consumed: 'Consumed',
    kg: 'kg',

    qrScanner: 'QR / SKU Scanner',
    scanOrManual: 'Scan a code or enter it manually',
    cameraOff: 'Camera is off. Start scanning or upload a code image.',
    startCamera: 'Start Camera',
    uploadCode: 'Upload Code',
    manualLookup: 'Manual Lookup',
    enterSku: 'Enter SKU e.g. AUR-RG-001',
    search: 'Search',
    scanResult: 'Scan Result',
    resultDesc: 'Item profile, location & stock',
    scanPrompt: 'Scan or search a code to see the item profile.',
    notFound: 'No item found for that code.',
    location: 'Location',
    stock: 'Stock',
    fullSpecs: 'Full Specs',
    caratWeight: 'Carat Weight',
    clarity: 'Clarity',
    color: 'Color',
    vaultLocation: 'Vault A · Shelf 3',

    navInvoice: 'Invoice Generation',
    navInvoiceDesc: 'Create & print invoices',
    invoiceTitle: 'Invoice Builder',
    invoiceSubtitle: 'Create and print client invoices',
    customerInfo: 'Customer Information',
    customerName: 'Customer Name',
    customerNamePlaceholder: 'Enter customer name…',
    customerPhone: 'Phone Number',
    customerPhonePlaceholder: 'Enter phone number…',
    invoiceDate: 'Date & Time',
    servicesList: 'Services & Items',
    servicesDesc: 'Select from preset services or add custom items',
    addCustomItem: 'Add Custom Item',
    customItemName: 'Item / Service name',
    customItemPrice: 'Price (TND)',
    addItem: 'Add',
    noItemsSelected: 'No items added yet. Select a service above or add a custom item.',
    colService: 'Service / Item',
    colQty: 'Qty',
    colPrice: 'Price',
    colTotal: 'Total',
    removeItem: 'Remove',
    summary: 'Summary',
    subtotal: 'Subtotal',
    discount: 'Discount / Tax',
    discountPlaceholder: '0',
    totalAmount: 'Total Amount',
    printInvoice: 'Print Invoice',
    resetInvoice: 'Reset',
    invoiceId: 'Invoice #',
    invoiceThankYou: 'Thank you for your business!',
    invoicePhone: 'Tel',
    invoiceAddress: 'Tunis, Tunisia',
    variablePrice: 'Variable',
    tnd: 'TND',
    qty: 'Qty',
    price: 'Price',
    print: 'Print',
    scanToVerify: 'Scan to verify invoice',
    mizanTitle: 'الميزان (Contre-poids)',
    mizanGold: 'ميزان ذهب (Gold)',
    mizanSilver: 'ميزان فضة (Silver)',
    mizanWeight: 'Weight (g)',
    mizanRate: 'Rate /g',
    mizanRateHint: 'Auto-filled from live metal rates',
    mizanCalc: 'Calculated total',
    mizanAdd: 'Add to invoice',
    mizanGram: 'g',
  },

  ar: {
    brand: 'جلو جاليري',
    brandTagline: 'مجوهرات الأتيليه',
    searchPlaceholder: 'ابحث عن رمز المنتج، قطعة، معاملة…',
    loadingData: 'جارٍ تحميل بيانات الأتيليه…',
    marketStatus: 'حالة السوق',
    marketLive: 'مباشر · بورصة نيويورك',
    marketNote: 'تغذية أسعار تجريبية للعرض.',
    openNav: 'فتح القائمة',
    closeNav: 'إغلاق القائمة',
    langToggle: 'English',

    loginTitle: 'تسجيل دخول المدير',
    loginSubtitle: 'أدخل بيانات الدخول للوصول إلى لوحة التحكم',
    loginEmail: 'البريد الإلكتروني',
    loginEmailPlaceholder: 'admin@glowgallery.com',
    loginPassword: 'كلمة المرور',
    loginPasswordPlaceholder: 'أدخل كلمة المرور',
    loginButton: 'تسجيل الدخول',
    loginSigningIn: 'جارٍ تسجيل الدخول…',
    loginError: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    logout: 'تسجيل الخروج',
    adminLabel: 'مدير النظام',

    navMetals: 'تحليلات المعادن المباشرة',
    navMetalsDesc: 'أسعار الذهب والفضة الفورية',
    navFinance: 'المالية والتدفق النقدي',
    navFinanceDesc: 'الإيرادات والمصروفات والأرباح',
    navInventory: 'مخزون المجوهرات',
    navInventoryDesc: 'الكتالوج والمواصفات التفصيلية',
    navStock: 'مخزون المعادن الثمينة',
    navStockDesc: 'السبائك والاحتياطيات الخام',
    navScanner: 'ماسح رمز الاستجابة السريعة',
    navScannerDesc: 'بحث سريع برمز المنتج',

    spotPrice: 'السعر الفوري',
    today: 'اليوم',
    dayHigh: 'أعلى سعر اليوم',
    dayLow: 'أدنى سعر اليوم',
    sentiment: 'المؤشر النفسي',
    bullish: 'صاعد',
    bearish: 'هابط',
    ratio: 'نسبة الذهب / الفضة',
    ratioDesc: 'نسبة التبادل بين الذهب والفضة',
    live: 'مباشر',
    goldLabel: 'الذهب (XAU)',
    silverLabel: 'الفضة (XAG)',
    purityLabel: 'العيارة',
    conversionNote: 'التحويل',
    gold24kLabel: 'ذهب عيار 24',
    gold18kLabel: 'ذهب عيار 18',
    pureSilverLabel: 'فضة نقية',

    totalRevenue: 'إجمالي الإيرادات',
    moneyIn: 'دخل نقدي',
    totalExpenses: 'إجمالي المصروفات',
    moneyOut: 'صرف نقدي',
    netProfitMargin: 'صافي هامش الربح',
    cashFlowTrend: 'اتجاه التدفق النقدي',
    cashFlowDesc: 'الإيرادات مقابل المصروفات لآخر 14 عملية',
    income: 'إيرادات',
    expense: 'مصروفات',
    recentTransactions: 'آخر المعاملات',
    records: 'سجل',
    addTransaction: 'إضافة معاملة',
    txId: 'الرقم',
    txDate: 'التاريخ',
    txDescription: 'الوصف',
    txType: 'النوع',
    txAmount: 'المبلغ',
    noTransactions: 'لا توجد معاملات بعد.',
    descPlaceholder: 'الوصف',
    amountPlaceholder: 'المبلغ (د.ت)',
    saveTransaction: 'حفظ المعاملة',
    saving: 'جارٍ الحفظ…',
    sale: 'بيع',
    purchase: 'شراء',
    expenseKind: 'مصروف',
    enterValid: 'أدخل وصفًا ومبلغًا موجبًا.',

    searchNameSku: 'ابحث بالاسم أو رمز المنتج…',
    filters: 'تصفية:',
    all: 'الكل',
    rings: 'خواتم',
    necklaces: 'قلادات',
    bracelets: 'أساور',
    earrings: 'أقراط',
    maxPrice: 'حد أقصى',
    inStock: 'في المخزون',
    noPieces: 'لا توجد قطع تطابق التصفية.',
    totalCaratWeight: 'إجمالي وزن القيراط',
    diamondClarity: 'نقاء الماس',
    diamondColor: 'لون الماس',
    metalType: 'نوع المعدن',
    totalWeight: 'الوزن الإجمالي',
    stockQuantity: 'كمية المخزون',
    sku: 'رمز المنتج',
    retailPrice: 'سعر التجزئة',
    specifications: 'المواصفات',
    editDetails: 'تعديل التفاصيل',
    viewHistory: 'عرض السجل',
    ct: 'قيراط',
    pcs: 'قطعة',

    totalReserveValue: 'إجمالي قيمة الاحتياطي',
    liveValuation: 'تقييم مباشر بالسعر الفوري',
    physicalGold: 'الذهب الفعلي',
    physicalSilver: 'الفضة الفعلية',
    spotPricePerGram: 'السعر الفوري للغرام',
    liveValuationLabel: 'التقييم المباشر',
    metalConsumption: 'استهلاك المعادن · الإنتاج',
    consumptionDesc: 'المعدن الخام الأسبوعي المستخدم في التصنيع',
    goldGram: 'الذهب (جم)',
    silverGram: 'الفضة (جم)',
    consumed: 'مستهلك',
    kg: 'كجم',

    qrScanner: 'ماسح رمز المنتج',
    scanOrManual: 'امسح الرمز أو أدخله يدويًا',
    cameraOff: 'الكاميرا متوقفة. ابدأ المسح أو ارفع صورة الرمز.',
    startCamera: 'تشغيل الكاميرا',
    uploadCode: 'رفع الرمز',
    manualLookup: 'بحث يدوي',
    enterSku: 'أدخل رمز المنتج مثال AUR-RG-001',
    search: 'بحث',
    scanResult: 'نتيجة المسح',
    resultDesc: 'ملف القطعة والموقع والمخزون',
    scanPrompt: 'امسح أو ابحث عن رمز لعرض ملف القطعة.',
    notFound: 'لا يوجد قطعة بهذا الرمز.',
    location: 'الموقع',
    stock: 'المخزون',
    fullSpecs: 'المواصفات الكاملة',
    caratWeight: 'وزن القيراط',
    clarity: 'النقاء',
    color: 'اللون',
    vaultLocation: 'الخزنة أ · رف ٣',

    navInvoice: 'استخراج الفواتير',
    navInvoiceDesc: 'إنشاء وطباعة الفواتير',
    invoiceTitle: 'منشئ الفواتير',
    invoiceSubtitle: 'إنشاء وطباعة فواتير العملاء',
    customerInfo: 'معلومات العميل',
    customerName: 'اسم العميل',
    customerNamePlaceholder: 'أدخل اسم العميل…',
    customerPhone: 'رقم الهاتف',
    customerPhonePlaceholder: 'أدخل رقم الهاتف…',
    invoiceDate: 'التاريخ والوقت',
    servicesList: 'الخدمات والمواد',
    servicesDesc: 'اختر من الخدمات الجاهزة أو أضف مواد مخصصة',
    addCustomItem: 'إضافة مادة مخصصة',
    customItemName: 'اسم المادة / الخدمة',
    customItemPrice: 'السعر (د.ت)',
    addItem: 'إضافة',
    noItemsSelected: 'لم تتم إضافة أي مواد بعد. اختر خدمة بالأعلى أو أضف مادة مخصصة.',
    colService: 'الخدمة / المادة',
    colQty: 'الكمية',
    colPrice: 'السعر',
    colTotal: 'المجموع',
    removeItem: 'حذف',
    summary: 'الملخص',
    subtotal: 'المجموع الفرعي',
    discount: 'تخفيض / ضريبة',
    discountPlaceholder: '0',
    totalAmount: 'المجموع الجملي',
    printInvoice: 'طباعة الفاتورة',
    resetInvoice: 'إعادة تعيين',
    invoiceId: 'فاتورة رقم',
    invoiceThankYou: 'شكرًا لتعاملكم معنا!',
    invoicePhone: 'الهاتف',
    invoiceAddress: 'تونس، تونس',
    variablePrice: 'متغير',
    tnd: 'د.ت',
    qty: 'الكمية',
    price: 'السعر',
    print: 'طباعة',
    scanToVerify: 'امسح للتحقق من الفاتورة',
    mizanTitle: 'الميزان (Contre-poids)',
    mizanGold: 'ميزان ذهب (الذهب)',
    mizanSilver: 'ميزان فضة (الفضة)',
    mizanWeight: 'الوزن (جم)',
    mizanRate: 'السعر/جم',
    mizanRateHint: 'تعبئة تلقائية من الأسعار المباشرة',
    mizanCalc: 'المجموع المحسوب',
    mizanAdd: 'إضافة للفاتورة',
    mizanGram: 'جم',
  },
};

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  dir: 'ltr' | 'rtl';
}

export const LangContext = createContext<LangContextValue>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
  dir: 'ltr',
});

export const useLang = () => useContext(LangContext);
