# SebastianClothes – demo sklepu (Next.js + Tailwind)

To jest gotowy minimalny projekt frontu sklepu z koszykiem. Bez backendu i płatności (demo).

## Szybki start lokalnie

```bash
npm install
npm run dev
# otwórz http://localhost:3000
```

## Deploy na Vercel

1. Zaloguj się na https://vercel.com (konto darmowe).
2. Utwórz nowy projekt z tego repo/zipa.
3. Build Command: `npm run build`, Output: `.next`
4. Po deployu dostaniesz URL.

## Co dalej (opcjonalnie)

- Podpięcie płatności (Stripe/Przelewy24) – dodamy endpoint `/api/checkout` i webhook Stripe/Przelewy24.
- Baza (Postgres) + zapisy zamówień – Prisma.
- Panel admina – lista zamówień, zmiana statusów.
