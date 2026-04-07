export interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: 'trend' | 'otomotiv' | 'telefon' | 'teknoloji' | 'genel';
  lang: 'tr' | 'en';
}

export const FEED_SOURCES: FeedSource[] = [
  // Trend
  {
    id: 'google-trends-tr',
    name: 'Google Trends TR',
    url: 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=TR',
    category: 'trend',
    lang: 'tr',
  },
  // Türkçe Teknoloji
  {
    id: 'shiftdelete',
    name: 'Shiftdelete',
    url: 'https://shiftdelete.net/feed',
    category: 'teknoloji',
    lang: 'tr',
  },
  {
    id: 'webtekno',
    name: 'Webtekno',
    url: 'https://www.webtekno.com/rss.xml',
    category: 'teknoloji',
    lang: 'tr',
  },
  {
    id: 'donanimhaber',
    name: 'Donanım Haber',
    url: 'https://www.donanimhaber.com/rss/',
    category: 'teknoloji',
    lang: 'tr',
  },
  {
    id: 'webrazzi',
    name: 'Webrazzi',
    url: 'https://webrazzi.com/feed/',
    category: 'teknoloji',
    lang: 'tr',
  },
  // Uluslararası Teknoloji
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'teknoloji',
    lang: 'en',
  },
  {
    id: 'theverge',
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'teknoloji',
    lang: 'en',
  },
  {
    id: 'engadget',
    name: 'Engadget',
    url: 'https://www.engadget.com/rss.xml',
    category: 'teknoloji',
    lang: 'en',
  },
  // Telefon
  {
    id: 'gsmarena',
    name: 'GSMArena',
    url: 'https://www.gsmarena.com/rss-news-reviews.php3',
    category: 'telefon',
    lang: 'en',
  },
  {
    id: '91mobiles',
    name: '91Mobiles',
    url: 'https://www.91mobiles.com/hub/feed/',
    category: 'telefon',
    lang: 'en',
  },
  // Otomotiv
  {
    id: 'autoevolution',
    name: 'AutoEvolution',
    url: 'https://www.autoevolution.com/rss/news.xml',
    category: 'otomotiv',
    lang: 'en',
  },
  {
    id: 'caranddriver',
    name: 'Car and Driver',
    url: 'https://www.caranddriver.com/rss/all.xml/',
    category: 'otomotiv',
    lang: 'en',
  },
  {
    id: 'topgear',
    name: 'Top Gear',
    url: 'https://www.topgear.com/rss.xml',
    category: 'otomotiv',
    lang: 'en',
  },
  {
    id: 'autoblog',
    name: 'Autoblog',
    url: 'https://www.autoblog.com/rss.xml',
    category: 'otomotiv',
    lang: 'en',
  },
];

export const CATEGORY_META: Record<FeedSource['category'], { label: string; color: string; icon: string }> = {
  trend:     { label: 'Trend',      color: '#C49A3C', icon: '▲' },
  otomotiv:  { label: 'Otomotiv',   color: '#00fff7', icon: '◈' },
  telefon:   { label: 'Telefon',    color: '#8B9BAC', icon: '◆' },
  teknoloji: { label: 'Teknoloji',  color: '#b724ff', icon: '⬡' },
  genel:     { label: 'Genel',      color: '#6b7280', icon: '◇' },
};
