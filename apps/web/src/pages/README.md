# Pages (route-level components)

One component per route. Build them in sprint order (CLAUDE.md §6) - never before the backend route they depend on is working in Postman.

| Sprint | Pages |
|---|---|
| 1 | `Login`, `RoleSelect`, `SellerOnboarding`, `SellerDashboard`, `ShopProfile`, `AdminPanel` |
| 2 | `Home` (exists), `Catalog`, `Product` |
| 3 | `Checkout`, `MockPayment`, `BuyerOrders`, `SellerOrders` |
| 4 | `CustomOrderRequest`, `SellerCustomOrders`, `BuyerCustomOrders` |
| 5 | `ReportListing`, `AdminIpQueue`, `AdminAnalytics`, `AdminSellers` |
| 6 | `legal/TermsOfService`, `legal/Privacy`, `legal/IpPolicy`, `legal/Refund` |

Each page must ship loading, empty, and error states and work at 375px (see docs/QA_GUIDELINES.md).
