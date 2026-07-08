// Lightweight event tracking (CLAUDE.md Sprint 6). Swap the sink for GA later.
// Events: page_view, add_to_cart, checkout_started, order_completed.
export function track(event, props = {}) {
  console.log('[analytics]', event, props);
  // TODO (Sprint 6): forward to Google Analytics or an event-log endpoint.
}
