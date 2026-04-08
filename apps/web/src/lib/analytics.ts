declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(event: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', event, params);
}

export function trackProductView(productName: string, productId: string, category?: string) {
  gtag('view_item', { item_name: productName, item_id: productId, item_category: category ?? '' });
}

export function trackComparison(productNames: string[]) {
  gtag('compare_products', { products: productNames.join(' vs '), product_count: productNames.length });
}

export function trackAIAssistant(productNames: string[]) {
  gtag('use_ai_assistant', { products: productNames.join(' vs ') });
}

export function trackNewsRead(title: string, slug: string) {
  gtag('read_news', { news_title: title.slice(0, 100), news_slug: slug });
}

export function trackNewsletterSubscribe() {
  gtag('newsletter_subscribe');
}

export function trackSearch(query: string, resultCount: number) {
  gtag('search', { search_term: query, result_count: resultCount });
}
