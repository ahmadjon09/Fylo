import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const en = {
  common: {
    search: 'Search', filter: 'Filter', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', create: 'Create', update: 'Update', loading: 'Loading...', noData: 'No data', actions: 'Actions', confirm: 'Confirm', success: 'Success', error: 'Error', back: 'Back', next: 'Next', prev: 'Previous', page: 'Page', of: 'of', total: 'total', export: 'Export', print: 'Print', all: 'All', status: 'Status', date: 'Date', name: 'Name', close: 'Close', advanced: 'Advanced Settings', showAdvanced: 'Show advanced', hideAdvanced: 'Hide advanced', required: 'Required', optional: 'Optional', copied: 'Copied', copy: 'Copy',
  },
  auth: {
    login: 'Sign in', register: 'Create account', phone: 'Phone Number', password: 'Password', currentPassword: 'Current Password', newPassword: 'New Password', fullName: 'Full Name', logout: 'Sign out', welcome: 'Welcome back', welcomeSub: 'Sign in to your Fylo workspace @FyloRobot', registerTitle: 'Create your workspace', registerSub: 'First account becomes super admin automatically', haveAccount: 'Already have an account?', noAccount: "Don't have an account?", signIn: 'Sign in', signUp: 'Sign up', demoHint: 'Demo: +998 901 234 567 / admin123', phonePlaceholder: 'Enter phone number', passwordPlaceholder: 'Enter password', logoutSuccess: 'Signed out', loginSuccess: 'Welcome back', registerSuccess: 'Account created',
  },
  nav: {
    dashboard: 'Dashboard', products: 'Products', sales: 'Sales', users: 'Users', profile: 'Profile', bulk: 'Bulk Import', newProduct: 'New Product', newSale: 'New Sale', settings: 'Settings', messages: 'Messages', audit: 'Audit Logs', system: 'System Panel',
  },
  product: {
    title: 'Products', name: 'Product Name', quantity: 'Initial Quantity', currentQty: 'In Stock', purchasePrice: 'Purchase Price (total)', intlShipping: 'Intl Shipping (total)', localShipping: 'Local Shipping (total)', unitCost: 'Unit Cost', unitCostLive: 'Live Unit Cost', minPrice: 'Min Selling Price', minPriceHint: 'Cannot be lower than unit cost', status: 'Status', inventoryValue: 'Inventory Value', expectedRevenue: 'Expected Revenue', expectedProfit: 'Expected Profit', sku: 'SKU', description: 'Description', images: 'Images', uploadImages: 'Upload images', create: 'New Product', edit: 'Edit Product', bulkTitle: 'Bulk Entry — Excel Style', bulkTip: 'Tab / Enter to navigate fast — like Excel. Min price must be ≥ unit cost.', inventoryValueCalc: 'Inventory Value', addRow: 'Add Row', saveAll: 'Save All', noProducts: 'No products yet', searchPlaceholder: 'Search products by name or SKU...', filterStatus: 'Status', sortNewest: 'Newest first', sortOldest: 'Oldest first', sortName: 'Name A-Z', sortCostHigh: 'Cost high to low', sortQtyLow: 'Low stock first', profit: 'Profit', revenue: 'Revenue', liveCalc: '(Purchase + Intl + Local) / Qty', totalProducts: 'Total Products',
  },
  sale: {
    title: 'Sales', newSale: 'New Sale', quantity: 'Quantity', sellingPrice: 'Selling Price (per unit)', unitCost: 'Unit Cost', revenue: 'Revenue', profit: 'Profit', cost: 'Cost', product: 'Product', customer: 'Customer', customerName: 'Customer Name', customerPhone: 'Customer Phone', customerAddress: 'Address', comment: 'Comment', soldBy: 'Sold By', date: 'Date', refund: 'Refund', refundConfirm: 'Refund this sale? Stock will be returned.', refundSuccess: 'Sale refunded', soldOut: 'Insufficient stock', selectProduct: 'Select product', currentStock: 'Current stock', minPrice: 'Min price', metrics: 'Profit will calculate live', noSales: 'No sales yet', totalSales: 'Total Sales', invoice: 'Invoice',
  },
  dashboard: {
    title: 'Dashboard', totalProducts: 'Total Products', lowStock: 'Low Stock', outOfStock: 'Out of Stock', inventoryValue: 'Inventory Value', realizedProfit: 'Realized Profit', expectedProfit: 'Expected Profit', realizedRevenue: 'Realized Revenue', expectedRevenue: 'Expected Revenue', onlineUsers: 'Online', totalUsers: 'Total Users', totalQuantity: 'Units in stock', totalQuantitySold: 'Units sold', recentSales: 'Recent Sales', topProducts: 'Top Products', dailySales: 'Daily Sales • Last 30 days', monthlySales: 'Monthly Revenue', lowStockAlert: 'Low Stock Alert', noLowStock: 'All stocks are healthy', units: 'units', salesCount: 'sales', value: 'value', profitOnlySold: 'Only from sold items', ifAllSold: 'If all sold at min price',
  },
  user: {
    title: 'Users', fullName: 'Full Name', phone: 'Phone', role: 'Role', online: 'Online', offline: 'Offline', lastActive: 'Last Active', devices: 'Devices', sessions: 'Sessions & Devices', avatar: 'Avatar', changeAvatar: 'Change', admin: 'Admin', superAdmin: 'Super Admin', worker: 'Worker', newUser: 'New User', editUser: 'Edit User', searchPlaceholder: 'Search by name or phone...', cannotEditAdmin: 'Cannot edit another admin', cannotDeleteAdmin: 'Cannot delete another admin', cannotDeleteSelf: 'Cannot delete yourself', deleteConfirm: 'Delete this user?', roleAdmin: 'Admin — Full access', roleSuperAdmin: 'Super Admin — System', roleWorker: 'Worker — Limited', telegramId: 'Telegram ID', telegramHint: 'User must start bot first. Send /myid to @FyloRobot', defaultPasswordHint: 'Default password: worker123 — user should change after login.', personalInfo: 'Personal Info', changePassword: 'Change Password', profile: 'Profile', noDevices: 'No devices yet', members: 'Members',
  },
  messages: {
    title: 'Messages — Fylo Chat', conversations: 'Conversations', noConversations: 'No conversations yet', selectChat: 'Select a chat — Fylo works like Telegram', typeMessage: 'Type a message... Enter to send', unread: 'new', typing: 'typing...', newChat: 'New Chat', startChat: 'Start Chat', searchUsers: 'Search users...', noUsers: 'No users found', you: 'You',
  },
  audit: {
    title: 'Audit Logs — Fylo', subtitle: 'Stored 2 months, auto-deleted after • Only super admin', search: 'Search logs...', action: 'Action', user: 'User', details: 'Details', ip: 'IP', location: 'Location', time: 'Time', allActions: 'All actions', login: 'Login', productCreate: 'Product create', sale: 'Sale', userCreate: 'User create',
  },
  system: {
    title: 'System — Fylo Super Admin', subtitle: 'Redis, MongoDB, CPU, Memory • @FyloRobot', redis: 'Redis', mongo: 'MongoDB', cpu: 'CPU / Uptime', memory: 'Memory', fyloStats: 'Fylo App Stats', collections: 'Collections', flushRedis: 'Flush Redis', platform: 'Platform', host: 'Host', env: 'Environment', dataSize: 'Data Size', objects: 'Objects', products: 'Products', sales: 'Sales', users: 'Users', audits: 'Audits', mapTitle: 'Audit — Location Map (OpenMap)', mapDesc: 'User locations if permitted are stored in audit logs, super admin can see on map.',
  },
  validation: {
    required: 'This field is required', phoneInvalid: 'Invalid phone number', passwordMin: 'Password must be at least 6 characters', nameMin: 'Name must be at least 2 characters', quantityMin: 'Quantity must be at least 1', priceMin: 'Price cannot be negative', minPriceLow: 'Min price cannot be lower than unit cost', productNameRequired: 'Product name is required',
  },
  toast: {
    created: 'Created successfully', updated: 'Updated successfully', deleted: 'Deleted successfully', saved: 'Saved', error: 'Something went wrong', loginSuccess: 'Signed in', logoutSuccess: 'Signed out', uploadSuccess: 'Uploaded', exportSuccess: 'Export started', copySuccess: 'Copied to clipboard',
  },
  button: {
    save: 'Save changes', saving: 'Saving...', cancel: 'Cancel', delete: 'Delete', deleting: 'Deleting...', create: 'Create', creating: 'Creating...', update: 'Update', updating: 'Updating...', confirm: 'Confirm', close: 'Close', add: 'Add', remove: 'Remove', search: 'Search', filter: 'Filter', export: 'Export', print: 'Print', retry: 'Retry',
  },
  theme: { light: 'Light', dark: 'Dark', system: 'System' },
  offline: { offline: 'You are offline', online: 'Back online', slow: 'Slow connection detected', check: 'Please check your connection' },
  empty: { products: 'No products yet. Create your first product to get started.', sales: 'No sales recorded. Make your first sale.', users: 'No users found.', search: 'No results for your search.' },
};

const ru = {
  common: {
    search: 'Поиск', filter: 'Фильтр', save: 'Сохранить', cancel: 'Отмена', delete: 'Удалить', edit: 'Редактировать', create: 'Создать', update: 'Обновить', loading: 'Загрузка...', noData: 'Нет данных', actions: 'Действия', confirm: 'Подтвердить', success: 'Успех', error: 'Ошибка', back: 'Назад', next: 'Далее', prev: 'Назад', page: 'Страница', of: 'из', total: 'всего', export: 'Экспорт', print: 'Печать', all: 'Все', status: 'Статус', date: 'Дата', name: 'Название', close: 'Закрыть', advanced: 'Расширенные', showAdvanced: 'Показать расширенные', hideAdvanced: 'Скрыть', required: 'Обязательно', optional: 'Необязательно', copied: 'Скопировано', copy: 'Копировать',
  },
  auth: {
    login: 'Вход', register: 'Создать аккаунт', phone: 'Номер телефона', password: 'Пароль', currentPassword: 'Текущий пароль', newPassword: 'Новый пароль', fullName: 'Полное имя', logout: 'Выйти', welcome: 'Добро пожаловать в Fylo', welcomeSub: 'Войдите в Fylo @FyloRobot', registerTitle: 'Создайте рабочее пространство', registerSub: 'Первый аккаунт становится супер админом', haveAccount: 'Уже есть аккаунт?', noAccount: 'Нет аккаунта?', signIn: 'Войти', signUp: 'Регистрация', demoHint: 'Демо: +998 901 234 567 / admin123', phonePlaceholder: 'Телефон', passwordPlaceholder: 'Пароль', logoutSuccess: 'Вы вышли', loginSuccess: 'Вход выполнен', registerSuccess: 'Аккаунт создан',
  },
  nav: {
    dashboard: 'Дашборд', products: 'Товары', sales: 'Продажи', users: 'Пользователи', profile: 'Профиль', bulk: 'Массовый ввод', newProduct: 'Новый товар', newSale: 'Новая продажа', settings: 'Настройки', messages: 'Сообщения', audit: 'Аудит Логи', system: 'Система',
  },
  product: {
    title: 'Товары', name: 'Название товара', quantity: 'Нач. количество', currentQty: 'В наличии', purchasePrice: 'Закупка (всего)', intlShipping: 'Межд. доставка (всего)', localShipping: 'Местная доставка (всего)', unitCost: 'Себестоимость', unitCostLive: 'Себестоимость live', minPrice: 'Мин. цена', minPriceHint: 'Не может быть ниже себестоимости', status: 'Статус', inventoryValue: 'Стоимость склада', expectedRevenue: 'Ожидаемая выручка', expectedProfit: 'Ожидаемая прибыль', sku: 'Артикул', description: 'Описание', images: 'Изображения', uploadImages: 'Загрузить', create: 'Новый товар', edit: 'Редактировать', bulkTitle: 'Массовый ввод — как Excel', bulkTip: 'Tab / Enter для быстрого ввода. Мин цена ≥ себестоимости.', inventoryValueCalc: 'Стоимость', addRow: 'Добавить строку', saveAll: 'Сохранить все', noProducts: 'Товаров нет', searchPlaceholder: 'Поиск по названию или артикулу...', filterStatus: 'Статус', sortNewest: 'Сначала новые', sortOldest: 'Сначала старые', sortName: 'Название A-Я', sortCostHigh: 'Дорогие сначала', sortQtyLow: 'Мало на складе', profit: 'Прибыль', revenue: 'Выручка', liveCalc: '(Закупка + доставки) / Кол-во', totalProducts: 'Всего товаров',
  },
  sale: {
    title: 'Продажи', newSale: 'Новая продажа', quantity: 'Количество', sellingPrice: 'Цена продажи (за шт)', unitCost: 'Себестоимость', revenue: 'Выручка', profit: 'Прибыль', cost: 'Себестоимость', product: 'Товар', customer: 'Клиент', customerName: 'Имя клиента', customerPhone: 'Телефон клиента', customerAddress: 'Адрес', comment: 'Комментарий', soldBy: 'Продавец', date: 'Дата', refund: 'Возврат', refundConfirm: 'Вернуть эту продажу? Товар вернется на склад.', refundSuccess: 'Продажа возвращена', soldOut: 'Недостаточно товара', selectProduct: 'Выберите товар', currentStock: 'Текущий остаток', minPrice: 'Мин цена', metrics: 'Прибыль считается на лету', noSales: 'Продаж нет', totalSales: 'Всего продаж', invoice: 'Чек',
  },
  dashboard: {
    title: 'Дашборд — Fylo', totalProducts: 'Всего товаров', lowStock: 'Мало на складе', outOfStock: 'Нет в наличии', inventoryValue: 'Стоимость склада', realizedProfit: 'Реальная прибыль', expectedProfit: 'Ожидаемая прибыль', realizedRevenue: 'Реальная выручка', expectedRevenue: 'Ожидаемая выручка', onlineUsers: 'Онлайн', totalUsers: 'Всего пользователей', totalQuantity: 'Единиц на складе', totalQuantitySold: 'Единиц продано', recentSales: 'Последние продажи', topProducts: 'Топ товары', dailySales: 'Ежедневные продажи • 30 дней', monthlySales: 'Выручка по месяцам', lowStockAlert: 'Мало на складе', noLowStock: 'Все остатки в норме', units: 'шт', salesCount: 'продаж', value: 'стоимость', profitOnlySold: 'Только с проданных', ifAllSold: 'Если продать все по мин цене',
  },
  user: {
    title: 'Пользователи', fullName: 'Полное имя', phone: 'Телефон', role: 'Роль', online: 'Онлайн', offline: 'Офлайн', lastActive: 'Последняя активность', devices: 'Устройства', sessions: 'Сессии и устройства', avatar: 'Аватар', changeAvatar: 'Изменить', admin: 'Администратор', superAdmin: 'Супер Админ', worker: 'Сотрудник', newUser: 'Новый пользователь', editUser: 'Редактировать пользователя', searchPlaceholder: 'Поиск по имени или телефону...', cannotEditAdmin: 'Нельзя редактировать другого админа', cannotDeleteAdmin: 'Нельзя удалить другого админа', cannotDeleteSelf: 'Нельзя удалить себя', deleteConfirm: 'Удалить пользователя?', roleAdmin: 'Админ — полный доступ', roleSuperAdmin: 'Супер Админ — система', roleWorker: 'Сотрудник — ограниченный', telegramId: 'Telegram ID', telegramHint: 'Пользователь должен сначала запустить @FyloRobot бот. /myid', defaultPasswordHint: 'Пароль по умолчанию: worker123 — смените после входа.', personalInfo: 'Личная информация', changePassword: 'Сменить пароль', profile: 'Профиль', noDevices: 'Устройств нет', members: 'Участники',
  },
  messages: {
    title: 'Сообщения — Fylo Чат', conversations: 'Чаты', noConversations: 'Пока нет чатов', selectChat: 'Выберите чат — как в Telegram', typeMessage: 'Напишите сообщение... Enter для отправки', unread: 'новых', typing: 'печатает...', newChat: 'Новый чат', startChat: 'Начать чат', searchUsers: 'Поиск пользователей...', noUsers: 'Пользователей не найдено', you: 'Вы',
  },
  audit: {
    title: 'Аудит Логи — Fylo', subtitle: 'Хранятся 2 месяца, авто-удаление • Только супер админ', search: 'Поиск логов...', action: 'Действие', user: 'Пользователь', details: 'Детали', ip: 'IP', location: 'Местоположение', time: 'Время', allActions: 'Все действия', login: 'Вход', productCreate: 'Создание товара', sale: 'Продажа', userCreate: 'Создание пользователя',
  },
  system: {
    title: 'Система — Fylo Супер Админ', subtitle: 'Redis, MongoDB, CPU, Memory • @FyloRobot', redis: 'Redis', mongo: 'MongoDB', cpu: 'CPU / Аптайм', memory: 'Память', fyloStats: 'Статистика Fylo', collections: 'Коллекции', flushRedis: 'Очистить Redis', platform: 'Платформа', host: 'Хост', env: 'Окружение', dataSize: 'Размер данных', objects: 'Объекты', products: 'Товары', sales: 'Продажи', users: 'Пользователи', audits: 'Аудиты', mapTitle: 'Аудит — Карта местоположений', mapDesc: 'Местоположения пользователей сохраняются в аудит логах',
  },
  validation: {
    required: 'Обязательное поле', phoneInvalid: 'Неверный номер телефона', passwordMin: 'Пароль минимум 6 символов', nameMin: 'Имя минимум 2 символа', quantityMin: 'Количество минимум 1', priceMin: 'Цена не может быть отрицательной', minPriceLow: 'Мин цена не может быть ниже себестоимости', productNameRequired: 'Название товара обязательно',
  },
  toast: {
    created: 'Успешно создано', updated: 'Успешно обновлено', deleted: 'Успешно удалено', saved: 'Сохранено', error: 'Что-то пошло не так', loginSuccess: 'Вы вошли', logoutSuccess: 'Вы вышли', uploadSuccess: 'Загружено', exportSuccess: 'Экспорт начат', copySuccess: 'Скопировано',
  },
  button: {
    save: 'Сохранить', saving: 'Сохранение...', cancel: 'Отмена', delete: 'Удалить', deleting: 'Удаление...', create: 'Создать', creating: 'Создание...', update: 'Обновить', updating: 'Обновление...', confirm: 'Подтвердить', close: 'Закрыть', add: 'Добавить', remove: 'Удалить', search: 'Поиск', filter: 'Фильтр', export: 'Экспорт', print: 'Печать', retry: 'Повторить',
  },
  theme: { light: 'Светлая', dark: 'Темная', system: 'Система' },
  offline: { offline: 'Вы офлайн', online: 'Снова онлайн', slow: 'Медленное соединение', check: 'Проверьте интернет' },
  empty: { products: 'Товаров нет. Создайте первый товар.', sales: 'Продаж нет. Сделайте первую продажу.', users: 'Пользователей нет.', search: 'Ничего не найдено.' },
};

const uz = {
  common: {
    search: 'Qidirish', filter: 'Filtr', save: 'Saqlash', cancel: 'Bekor qilish', delete: "O'chirish", edit: 'Tahrirlash', create: 'Yaratish', update: 'Yangilash', loading: 'Yuklanmoqda...', noData: "Ma'lumot yo'q", actions: 'Amallar', confirm: 'Tasdiqlash', success: 'Muvaffaqiyat', error: 'Xatolik', back: 'Orqaga', next: 'Keyingi', prev: 'Oldingi', page: 'Sahifa', of: 'dan', total: 'jami', export: 'Eksport', print: 'Chop etish', all: 'Hammasi', status: 'Holati', date: 'Sana', name: 'Nomi', close: 'Yopish', advanced: 'Kengaytirilgan', showAdvanced: "Qo'shimchalarni ko'rsatish", hideAdvanced: "Yashirish", required: 'Majburiy', optional: 'Ixtiyoriy', copied: 'Nusxalandi', copy: 'Nusxalash',
  },
  auth: {
    login: 'Kirish', register: 'Akkaunt yaratish', phone: 'Telefon raqami', password: 'Parol', currentPassword: 'Hozirgi parol', newPassword: 'Yangi parol', fullName: "To'liq ism", logout: 'Chiqish', welcome: 'Xush kelibsiz Fylo ga', welcomeSub: 'Fylo ish joyingizga kiring @FyloRobot', registerTitle: 'Ish joyingizni yarating', registerSub: 'Birinchi akkaunt super admin bo‘ladi', haveAccount: 'Akkauntingiz bormi?', noAccount: 'Akkauntingiz yo‘qmi?', signIn: 'Kirish', signUp: "Ro'yxatdan o'tish", demoHint: 'Demo: +998 901 234 567 / admin123', phonePlaceholder: 'Telefon raqamingizni kiriting', passwordPlaceholder: 'Parolingizni kiriting', logoutSuccess: 'Chiqdingiz', loginSuccess: 'Xush kelibsiz', registerSuccess: 'Akkaunt yaratildi',
  },
  nav: {
    dashboard: 'Boshqaruv', products: 'Mahsulotlar', sales: 'Sotuvlar', users: 'Foydalanuvchilar', profile: 'Profil', bulk: "Ko'p kiritish", newProduct: 'Yangi mahsulot', newSale: 'Yangi sotuv', settings: 'Sozlamalar', messages: 'Xabarlar', audit: 'Audit Loglar', system: 'Tizim Paneli',
  },
  product: {
    title: 'Mahsulotlar', name: 'Mahsulot nomi', quantity: 'Boshlang‘ich miqdor', currentQty: 'Omborda', purchasePrice: 'Xarid narxi (jami)', intlShipping: 'Xalqaro yetkazib (jami)', localShipping: 'Mahalliy yetkazib (jami)', unitCost: 'Birlik tannarxi', unitCostLive: 'Jonli tannarx', minPrice: 'Min sotuv narxi', minPriceHint: 'Tannarxdan past bo‘lishi mumkin emas', status: 'Holati', inventoryValue: 'Ombor qiymati', expectedRevenue: 'Kutilayotgan tushum', expectedProfit: 'Kutilayotgan foyda', sku: 'SKU', description: 'Tavsif', images: 'Rasmlar', uploadImages: 'Rasm yuklash', create: 'Yangi mahsulot', edit: 'Mahsulotni tahrirlash', bulkTitle: 'Ko‘p kiritish — Excel uslubi', bulkTip: 'Tez kiritish uchun Tab / Enter — Excel kabi. Min narx ≥ tannarx.', inventoryValueCalc: 'Ombor qiymati', addRow: 'Qator qo‘shish', saveAll: 'Barchasini saqlash', noProducts: 'Mahsulotlar yo‘q', searchPlaceholder: 'Nomi yoki SKU bo‘yicha qidirish...', filterStatus: 'Holati', sortNewest: 'Yangi birinchi', sortOldest: 'Eski birinchi', sortName: 'Nomi A-Z', sortCostHigh: 'Qimmat birinchi', sortQtyLow: 'Kam qolgan birinchi', profit: 'Foyda', revenue: 'Tushum', liveCalc: '(Xarid + Yetkazib) / Miqdor', totalProducts: 'Jami mahsulotlar',
  },
  sale: {
    title: 'Sotuvlar', newSale: 'Yangi sotuv', quantity: 'Miqdori', sellingPrice: 'Sotuv narxi (dona)', unitCost: 'Tannarx', revenue: 'Tushum', profit: 'Foyda', cost: 'Tannarx', product: 'Mahsulot', customer: 'Mijoz', customerName: 'Mijoz ismi', customerPhone: 'Mijoz telefoni', customerAddress: 'Manzil', comment: 'Izoh', soldBy: 'Sotuvchi', date: 'Sana', refund: 'Qaytarish', refundConfirm: 'Bu sotuvni qaytarasizmi? Mahsulot omborga qaytadi.', refundSuccess: 'Sotuv qaytarildi', soldOut: 'Omborda yetarli emas', selectProduct: 'Mahsulot tanlang', currentStock: 'Hozirgi qoldiq', minPrice: 'Min narx', metrics: 'Foyda jonli hisoblanadi', noSales: 'Sotuvlar yo‘q', totalSales: 'Jami sotuvlar', invoice: 'Chek',
  },
  dashboard: {
    title: 'Boshqaruv — Fylo', totalProducts: 'Jami mahsulotlar', lowStock: 'Kam qolgan', outOfStock: 'Tugagan', inventoryValue: 'Ombor qiymati', realizedProfit: 'Real foyda', expectedProfit: 'Kutilayotgan foyda', realizedRevenue: 'Real tushum', expectedRevenue: 'Kutilayotgan tushum', onlineUsers: 'Onlayn', totalUsers: 'Jami foydalanuvchilar', totalQuantity: 'Ombordagi birliklar', totalQuantitySold: 'Sotilgan birliklar', recentSales: "So'nggi sotuvlar", topProducts: 'Top mahsulotlar', dailySales: 'Kunlik sotuvlar • 30 kun', monthlySales: 'Oylik tushum', lowStockAlert: 'Kam qolganlar', noLowStock: 'Barcha qoldiqlar yaxshi', units: 'dona', salesCount: 'sotuv', value: 'qiymat', profitOnlySold: 'Faqat sotilganlardan', ifAllSold: 'Hammasi min narxda sotilsa',
  },
  user: {
    title: 'Foydalanuvchilar', fullName: "To'liq ism", phone: 'Telefon', role: 'Rol', online: 'Onlayn', offline: 'Oflayn', lastActive: 'Oxirgi faollik', devices: 'Qurilmalar', sessions: 'Sessiyalar va qurilmalar', avatar: 'Avatar', changeAvatar: "O'zgartirish", admin: 'Admin', superAdmin: 'Super Admin', worker: 'Ishchi', newUser: 'Yangi foydalanuvchi', editUser: 'Foydalanuvchini tahrirlash', searchPlaceholder: 'Ism yoki telefon bo‘yicha qidirish...', cannotEditAdmin: 'Boshqa adminni tahrirlab bo‘lmaydi', cannotDeleteAdmin: 'Boshqa adminni o‘chirib bo‘lmaydi', cannotDeleteSelf: "O'zingizni o'chira olmaysiz", deleteConfirm: 'Bu foydalanuvchini o‘chirasizmi?', roleAdmin: 'Admin — To‘liq huquq', roleSuperAdmin: 'Super Admin — Tizim', roleWorker: 'Ishchi — Cheklangan', telegramId: 'Telegram ID', telegramHint: 'Foydalanuvchi avval @FyloRobot botni ishga tushirishi kerak.', defaultPasswordHint: 'Standart parol: worker123 — foydalanuvchi kirgandan keyin o‘zgartirishi kerak.', personalInfo: 'Shaxsiy ma’lumot', changePassword: 'Parolni o‘zgartirish', profile: 'Profil', noDevices: 'Qurilmalar yo‘q', members: "A'zolar",
  },
  messages: {
    title: 'Xabarlar — Fylo Chat', conversations: 'Suhbatlar', noConversations: 'Hali suhbatlar yo‘q', selectChat: 'Chatni tanlang — Telegram kabi', typeMessage: 'Xabar yozing... Enter yuborish', unread: 'yangi', typing: 'yozyapti...', newChat: 'Yangi chat', startChat: 'Chat boshlash', searchUsers: 'Foydalanuvchilarni qidirish...', noUsers: 'Foydalanuvchi topilmadi', you: 'Siz',
  },
  audit: {
    title: 'Audit Loglar — Fylo', subtitle: '2 oy saqlanadi, keyin auto o‘chiriladi • Faqat super admin', search: 'Loglarni qidirish...', action: 'Harakat', user: 'Foydalanuvchi', details: 'Tafsilot', ip: 'IP', location: 'Joy', time: 'Vaqt', allActions: 'Barcha harakatlar', login: 'Kirish', productCreate: 'Mahsulot yaratish', sale: 'Sotuv', userCreate: 'Foydalanuvchi yaratish',
  },
  system: {
    title: 'Tizim — Fylo Super Admin', subtitle: 'Redis, MongoDB, CPU, Memory • @FyloRobot', redis: 'Redis', mongo: 'MongoDB', cpu: 'CPU / Uptime', memory: 'Xotira', fyloStats: 'Fylo Statistikasi', collections: 'Kolleksiyalar', flushRedis: 'Redis tozalash', platform: 'Platforma', host: 'Host', env: 'Muhit', dataSize: 'Ma’lumot hajmi', objects: 'Obyektlar', products: 'Mahsulotlar', sales: 'Sotuvlar', users: 'Foydalanuvchilar', audits: 'Auditlar', mapTitle: 'Audit — Joylashuv Xaritasi', mapDesc: 'Foydalanuvchilar joylashuvi audit loglarda saqlanadi',
  },
  validation: {
    required: 'Majburiy maydon', phoneInvalid: 'Telefon raqami noto‘g‘ri', passwordMin: 'Parol kamida 6 belgidan iborat bo‘lishi kerak', nameMin: 'Ism kamida 2 belgidan iborat', quantityMin: 'Miqdor kamida 1 bo‘lishi kerak', priceMin: 'Narx manfiy bo‘lishi mumkin emas', minPriceLow: 'Min narx tannarxdan past bo‘lishi mumkin emas', productNameRequired: 'Mahsulot nomi majburiy',
  },
  toast: {
    created: 'Muvaffaqiyatli yaratildi', updated: 'Muvaffaqiyatli yangilandi', deleted: 'Muvaffaqiyatli o‘chirildi', saved: 'Saqlangan', error: 'Xatolik yuz berdi', loginSuccess: 'Tizimga kirdingiz', logoutSuccess: 'Tizimdan chiqdingiz', uploadSuccess: 'Yuklandi', exportSuccess: 'Eksport boshlandi', copySuccess: 'Nusxalandi',
  },
  button: {
    save: 'Saqlash', saving: 'Saqlanmoqda...', cancel: 'Bekor qilish', delete: "O'chirish", deleting: "O'chirilmoqda...", create: 'Yaratish', creating: 'Yaratilmoqda...', update: 'Yangilash', updating: 'Yangilanmoqda...', confirm: 'Tasdiqlash', close: 'Yopish', add: "Qo'shish", remove: "O'chirish", search: 'Qidirish', filter: 'Filtr', export: 'Eksport', print: 'Chop etish', retry: 'Qayta urinish',
  },
  theme: { light: 'Yorug‘', dark: 'Qorong‘i', system: 'Tizim' },
  offline: { offline: 'Oflaynsiz', online: 'Online qaytdingiz', slow: 'Sekin internet', check: 'Internetni tekshiring' },
  empty: { products: 'Mahsulotlar yo‘q. Birinchi mahsulotingizni yarating.', sales: 'Sotuvlar yo‘q. Birinchi sotuvni qiling.', users: 'Foydalanuvchilar topilmadi.', search: 'Qidiruv bo‘yicha natija yo‘q.' },
};

const uzCyrl = {
  common: {
    search: 'Қидириш', filter: 'Фильтр', save: 'Сақлаш', cancel: 'Бекор қилиш', delete: 'Ўчириш', edit: 'Таҳрирлаш', create: 'Яратиш', update: 'Янгилаш', loading: 'Юкланмоқда...', noData: 'Маълумот йўқ', actions: 'Амаллар', confirm: 'Тасдиқлаш', success: 'Муваффақият', error: 'Хатолик', back: 'Орқага', next: 'Кейинги', prev: 'Олдинги', page: 'Саҳифа', of: 'дан', total: 'жами', export: 'Экспорт', print: 'Чоп этиш', all: 'Ҳаммаси', status: 'Ҳолати', date: 'Сана', name: 'Номи', close: 'Ёпиш', advanced: 'Кенгайтирилган созламалар', showAdvanced: 'Қўшимчаларни кўрсатиш', hideAdvanced: 'Қўшимчаларни яшириш', required: 'Мажбурий', optional: 'Ихтиёрий', copied: 'Нусхаланди', copy: 'Нусхалаш',
  },
  auth: {
    login: 'Кириш', register: 'Аккаунт яратиш', phone: 'Телефон рақами', password: 'Парол', currentPassword: 'Ҳозирги парол', newPassword: 'Янги парол', fullName: 'Тўлиқ исм', logout: 'Чиқиш', welcome: 'Хуш келибсиз', welcomeSub: 'Fylo иш жойингизга киринг @FyloRobot', registerTitle: 'Иш жойингизни яратинг', registerSub: 'Биринчи аккаунт автоматик супер админ бўлади', haveAccount: 'Аккаунтингиз борми?', noAccount: 'Аккаунтингиз йўқми?', signIn: 'Кириш', signUp: 'Рўйхатдан ўтиш', demoHint: 'Демо: +998 901 234 567 / admin123', phonePlaceholder: 'Телефон рақамингизни киритинг', passwordPlaceholder: 'Паролингизни киритинг', logoutSuccess: 'Тизимдан чиқдингиз', loginSuccess: 'Хуш келибсиз', registerSuccess: 'Аккаунт яратилди',
  },
  nav: {
    dashboard: 'Бошқарув', products: 'Маҳсулотлар', sales: 'Сотувлар', users: 'Фойдаланувчилар', profile: 'Профиль', bulk: 'Кўп киритиш', newProduct: 'Янги маҳсулот', newSale: 'Янги сотув', settings: 'Созламалар', messages: 'Хабарлар', audit: 'Аудит Логлар', system: 'Тизим Панели',
  },
  product: {
    title: 'Маҳсулотлар', name: 'Маҳсулот номи', quantity: 'Бошланғич миқдор', currentQty: 'Омборда', purchasePrice: 'Харид нархи (жами)', intlShipping: 'Халқаро етказиб (жами)', localShipping: 'Маҳаллий етказиб (жами)', unitCost: 'Бирлик таннархи', unitCostLive: 'Жонли таннарх', minPrice: 'Мин сотув нархи', minPriceHint: 'Таннархдан паст бўлиши мумкин эмас', status: 'Ҳолати', inventoryValue: 'Омбор қиймати', expectedRevenue: 'Кутилаётган тушум', expectedProfit: 'Кутилаётган фойда', sku: 'SKU', description: 'Тавсиф', images: 'Расмлар', uploadImages: 'Расм юклаш', create: 'Янги маҳсулот', edit: 'Маҳсулотни таҳрирлаш', bulkTitle: 'Кўп киритиш — Excel услуби', bulkTip: 'Тез киритиш учун Tab / Enter — Excel каби. Мин нарх ≥ таннарх.', inventoryValueCalc: 'Омбор қиймати', addRow: 'Қатор қўшиш', saveAll: 'Барчасини сақлаш', noProducts: 'Маҳсулотлар йўқ', searchPlaceholder: 'Номи ёки SKU бўйича қидириш...', filterStatus: 'Ҳолати', sortNewest: 'Янги биринчи', sortOldest: 'Эски биринчи', sortName: 'Номи A-Z', sortCostHigh: 'Қиммат биринчи', sortQtyLow: 'Кам қолган биринчи', profit: 'Фойда', revenue: 'Тушум', liveCalc: '(Харид + Етказиб) / Миқдор', totalProducts: 'Жами маҳсулотлар',
  },
  sale: {
    title: 'Сотувлар', newSale: 'Янги сотув', quantity: 'Миқдори', sellingPrice: 'Сотув нархи (дона)', unitCost: 'Таннарх', revenue: 'Тушум', profit: 'Фойда', cost: 'Таннарх', product: 'Маҳсулот', customer: 'Мижоз', customerName: 'Мижоз исми', customerPhone: 'Мижоз телефони', customerAddress: 'Манзил', comment: 'Изоҳ', soldBy: 'Сотувчи', date: 'Сана', refund: 'Қайтариш', refundConfirm: 'Бу сотувни қайтарасизми? Маҳсулот омборга қайтади.', refundSuccess: 'Сотув қайтарилди', soldOut: 'Омборда етарли эмас', selectProduct: 'Маҳсулот танланг', currentStock: 'Ҳозирги қолдиқ', minPrice: 'Мин нарх', metrics: 'Фойда жонли ҳисобланади', noSales: 'Сотувлар йўқ', totalSales: 'Жами сотувлар', invoice: 'Чек',
  },
  dashboard: {
    title: 'Бошқарув — Fylo', totalProducts: 'Жами маҳсулотлар', lowStock: 'Кам қолган', outOfStock: 'Тугаган', inventoryValue: 'Омбор қиймати', realizedProfit: 'Реал фойда', expectedProfit: 'Кутилаётган фойда', realizedRevenue: 'Реал тушум', expectedRevenue: 'Кутилаётган тушум', onlineUsers: 'Онлайн', totalUsers: 'Жами фойдаланувчилар', totalQuantity: 'Омбордаги бирликлар', totalQuantitySold: 'Сотилган бирликлар', recentSales: 'Сўнгги сотувлар', topProducts: 'Топ маҳсулотлар', dailySales: 'Кунлик сотувлар • 30 кун', monthlySales: 'Ойлик тушум', lowStockAlert: 'Кам қолганлар', noLowStock: 'Барча қолдиқлар яхши', units: 'дона', salesCount: 'сотув', value: 'қиймат', profitOnlySold: 'Фақат сотилганлардан', ifAllSold: 'Ҳаммаси мин нархда сотилса',
  },
  user: {
    title: 'Фойдаланувчилар', fullName: 'Тўлиқ исм', phone: 'Телефон', role: 'Рол', online: 'Онлайн', offline: 'Офлайн', lastActive: 'Охирги фаоллик', devices: 'Қурилмалар', sessions: 'Сессиялар ва қурилмалар', avatar: 'Аватар', changeAvatar: 'Ўзгартириш', admin: 'Админ', superAdmin: 'Супер Админ', worker: 'Ишчи', newUser: 'Янги фойдаланувчи', editUser: 'Фойдаланувчини таҳрирлаш', searchPlaceholder: 'Исм ёки телефон бўйича қидириш...', cannotEditAdmin: 'Бошқа админни таҳрирлаб бўлмайди', cannotDeleteAdmin: 'Бошқа админни ўчириб бўлмайди', cannotDeleteSelf: 'Ўзингизни ўчира олмайсиз', deleteConfirm: 'Бу фойдаланувчини ўчирасизми?', roleAdmin: 'Админ — Тўлиқ ҳуқуқ', roleSuperAdmin: 'Супер Админ — Тизим', roleWorker: 'Ишчи — Чекланган', telegramId: 'Telegram ID', telegramHint: 'Фойдаланувчи аввал @FyloRobot ботни ишга тушириши керак. /myid юборинг.', defaultPasswordHint: 'Стандарт парол: worker123 — фойдаланувчи киргандан кейин ўзгартириши керак.', personalInfo: 'Шахсий маълумот', changePassword: 'Паролни ўзгартириш', profile: 'Профиль', noDevices: 'Қурилмалар йўқ', members: 'Аъзолар',
  },
  messages: {
    title: 'Хабарлар — Fylo Чат', conversations: 'Ёзишмалар', noConversations: 'Ҳали ёзишмалар йўқ', selectChat: 'Чатни танланг — Telegram каби', typeMessage: 'Хабар ёзинг... Enter юбориш', unread: 'янги', typing: 'ёзяпти...', newChat: 'Янги чат', startChat: 'Чат бошлаш', searchUsers: 'Фойдаланувчиларни қидириш...', noUsers: 'Фойдаланувчи топилмади', you: 'Сиз',
  },
  audit: {
    title: 'Аудит Логлар — Fylo', subtitle: '2 ой сақланади, кейин авто ўчирилади • Фақат супер админ', search: 'Қидириш...', action: 'Ҳаракат', user: 'Фойдаланувчи', details: 'Тафсилот', ip: 'IP', location: 'Жой', time: 'Вақт', allActions: 'Барча ҳаракатлар', login: 'Кириш', productCreate: 'Маҳсулот яратиш', sale: 'Сотув', userCreate: 'Фойдаланувчи яратиш',
  },
  system: {
    title: 'Тизим — Fylo Супер Админ', subtitle: 'Redis, MongoDB, CPU, Memory • @FyloRobot', redis: 'Redis', mongo: 'MongoDB', cpu: 'CPU / Uptime', memory: 'Хотира', fyloStats: 'Fylo Статистика', collections: 'Коллекциялар', flushRedis: 'Redis тозалаш', platform: 'Платформа', host: 'Хост', env: 'Муҳит', dataSize: 'Маълумот ҳажми', objects: 'Объектлар', products: 'Маҳсулотлар', sales: 'Сотувлар', users: 'Фойдаланувчилар', audits: 'Аудитлар', mapTitle: 'Аудит — Жойлашув Харитаси', mapDesc: 'Фойдаланувчилар жойлашуви аудит логларда сақланади',
  },
  validation: {
    required: 'Мажбурий майдон', phoneInvalid: 'Телефон рақами нотўғри', passwordMin: 'Парол камида 6 белгидан иборат бўлиши керак', nameMin: 'Исм камида 2 белгидан иборат', quantityMin: 'Миқдор камида 1 бўлиши керак', priceMin: 'Нарх манфий бўлиши мумкин эмас', minPriceLow: 'Мин нарх таннархдан паст бўлиши мумкин эмас', productNameRequired: 'Маҳсулот номи мажбурий',
  },
  toast: {
    created: 'Муваффақиятли яратилди', updated: 'Муваффақиятли янгиланди', deleted: 'Муваффақиятли ўчирилди', saved: 'Сақланган', error: 'Хатолик юз берди', loginSuccess: 'Тизимга кирдингиз', logoutSuccess: 'Тизимдан чиқдингиз', uploadSuccess: 'Юкланди', exportSuccess: 'Экспорт бошланди', copySuccess: 'Нусхаланди',
  },
  button: {
    save: 'Сақлаш', saving: 'Сақланмоқда...', cancel: 'Бекор қилиш', delete: 'Ўчириш', deleting: 'Ўчирилмоқда...', create: 'Яратиш', creating: 'Яратилмоқда...', update: 'Янгилаш', updating: 'Янгиланмоқда...', confirm: 'Тасдиқлаш', close: 'Ёпиш', add: 'Қўшиш', remove: 'Ўчириш', search: 'Қидириш', filter: 'Фильтр', export: 'Экспорт', print: 'Чоп этиш', retry: 'Қайта уриниш',
  },
  theme: { light: 'Ёруғ', dark: 'Қоронғи', system: 'Тизим' },
  offline: { offline: 'Офлайнсиз', online: 'Онлайн қайтдингиз', slow: 'Секин интернет', check: 'Интернетни текширинг' },
  empty: { products: 'Маҳсулотлар йўқ. Биринчи маҳсулотингизни яратинг.', sales: 'Сотувлар йўқ. Биринчи сотувни қилинг.', users: 'Фойдаланувчилар топилмади.', search: 'Қидирув бўйича натижа йўқ.' },
};

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  uz: { translation: uz },
  'uz-Cyrl': { translation: uzCyrl },
};

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: 'uz-Cyrl',
  supportedLngs: ['en', 'ru', 'uz', 'uz-Cyrl'],
  interpolation: { escapeValue: false },
  detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
});

export default i18n;
