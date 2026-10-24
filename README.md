# CAPSÉRA skincare website

Responsive Next.js website for the CAPSÉRA complete 7-step skincare kit.

## Run locally

```powershell
npm install
npm run dev
```

Open http://localhost:3000.

## Pages

- `/` — homepage and links into the seven-step skin routine quiz
- `/shop` — single-kit shop with search
- `/shop/capsera-7-step-skincare-kit` — product details and all seven included steps
- `/quiz` and `/quiz/results` — preference questionnaire and session-specific guidance
- `/cart` — browser-persisted single-product cart with quantity controls
- `/checkout` and `/order-confirmation` — checkout integration boundary and non-success status
- `/signin`, `/signup`, `/forgot-password`, `/reset-password`, `/account`
- `/about`, `/contact`, `/faq`

## Integration required before launch

The site includes a local demo authentication flow for account creation and sign-in, backed by a file in the project `data/` folder for development. For production use, replace it with a trusted identity provider and customer database.

- Set the kit price in `lib/product.ts` before showing totals or accepting orders.
- Connect a trusted payment provider and server-side order persistence before creating real orders or confirmations.
- Replace the local demo account store with a production authentication provider before enabling customer access in a live deployment.
- Connect a contact/email provider before claiming contact messages were delivered.
- Publish verified shipping, returns, ingredient, and product-use information before representing those policies as available.
- Store provider secrets in server-only environment variables; none are currently required by the local demo forms.

The checkout and contact APIs remain setup-only for the storefront demo. The account signup and sign-in flow stores demo accounts locally and does not require external credentials or a `.env` file.
