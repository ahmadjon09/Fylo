# Fylo — Йўл Ҳақлари Ҳисоблаш Тизими / Система расчёта доставки / Shipping Cost System

## Ўзбекча (Кирилл) — Асосий

### Формула

```
Бирлик таннархи = (Харид нархи + Халқаро йўл + Ички йўл) / Миқдори
```

**Мисол:**
- Маҳсулот: iPhone 15
- Сони: 10 дона
- Жами харид: $8 000
- Халқаро йўл (Хитойдан Ўзбекистонга): $500 (умумий 10 дона учун)
- Ички йўл (Тошкент ичида): $100 (умумий)

```
Таннарх = (8000 + 500 + 100) / 10 = $860
```

### Дашборддаги янги статистика

1. **Жами халқаро йўл харажатлари** — барча маҳсулотларнинг `totalIntlShipping` йиғиндиси
2. **Жами ички йўл харажатлари** — барча `totalLocalShipping` йиғиндиси
3. **Умумий йўл харажатлари** = халқаро + ички
4. **Жами харид** — фақат маҳсулот нархи, йўлсиз
5. **Ўртача таннарх** — барча маҳсулотларнинг ўртача бирлик таннархи

### Нега муҳим?

- Одатда тадбиркорлар фақат харид нархини ҳисоблайди, йўлни унутади → фойда нотўғри чиқади
- Fylo да ҳар бир маҳсулот учун 2 хил йўл алоҳида киритилади
- Дашбордда умумий йўл харажатларини кўриб, логистикани оптималлаштириш мумкин

### Excel экспорт

Экспортда ҳам кириллча:
- "Жами халқаро йўл харажатлари"
- "Жами ички йўл харажатлари"
- "Умумий йўл харажатлари"

### Кодда қаерда?

- `backend/src/utils/calc.js`: `calcUnitCost({ purchasePrice, intlShipping, localShipping, quantity })`
- `backend/src/modules/dashboard/dashboard.controller.js`: `shippingAgg` aggregate
- `frontend/src/features/dashboard/Dashboard.jsx`: янги StatCard лар
- `frontend/src/features/products/ProductForm.jsx`: 2 та алоҳида NumberInput

---

## Русский — Объяснение

### Формула себестоимости

```
Себестоимость единицы = (Цена закупки + Международная доставка + Локальная доставка) / Количество
```

**Пример:** 10 iPhone, закупка $8000, международная $500, локальная $100 → ($860 себестоимость)

### Новые метрики в дашборде

- **Общая международная доставка** — сумма всех `totalIntlShipping`
- **Общая локальная доставка** — сумма `totalLocalShipping`
- **Общая доставка** = международная + локальная
- Полезно для анализа логистики

---

## English — Explanation

### Unit Cost Formula

```
Unit Cost = (Purchase Price + International Shipping + Local Shipping) / Quantity
```

**Example:** 10 units, $8000 purchase, $500 intl shipping, $100 local → $860 unit cost

### Dashboard new stats

- **Total International Shipping** — sum of all intl shipping
- **Total Local Shipping** — sum of local
- **Total Shipping** = intl + local
- **Total Purchase** — only product cost without shipping
- **Avg Unit Cost** — average

This helps businesses see true shipping overhead, not just product cost.

### Where in code

- `calc.js` — core function
- `dashboard.controller.js` — aggregation `shippingAgg`
- Frontend shows 3 new StatCards in dashboard

---

## Fylo Project

- Project: **Fylo**
- Bot: **@FyloRobot**
- Stack: Node.js, MongoDB, Redis, Socket.IO, React, Tailwind
- Audit logs: 60 days TTL auto-delete
- Messaging: Telegram-like real-time via socket
- Languages: Uzbek Latin, Uzbek Cyrillic, Russian, English — full coverage
