/* وظائف بحثية مستقلة قابلة للاختبار دون اتصال أو خادم. */
(function (root, factory) {
  const tools = factory();
  if (typeof module === 'object' && module.exports) module.exports = tools;
  if (root) root.MannanResearch = tools;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function normalizeArabic(value) {
    return String(value ?? '').normalize('NFD')
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
      .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي')
      .normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();
  }
  function parsePageHash(hash, books) {
    const value = String(hash || '').replace(/^#/, '');
    const args = new URLSearchParams(value);
    const book = books.find(item => item.id === args.get('book'));
    const rawPage = args.get('page');
    if (!book || !rawPage || !/^[1-9]\d*$/.test(rawPage)) return null;
    const page = Number(rawPage);
    if (!Number.isSafeInteger(page) || page > book.pageCount) return null;
    return { bookId: book.id, page, pageIndex: page - 1 };
  }
  function buildPageUrl(baseHref, bookId, page) {
    const url = new URL(baseHref);
    url.hash = new URLSearchParams({ book: bookId, page: String(page) }).toString();
    return url.toString();
  }
  function collectSurahs(books, indexByBook) {
    const rows = [];
    for (const book of books) {
      const data = indexByBook[book.id];
      if (!data || !Array.isArray(data.all_headings)) continue;
      for (const heading of data.all_headings) {
        const page = Number(heading.page);
        if (heading.kind !== 'سورة' || typeof heading.title !== 'string' ||
            !Number.isInteger(page) || page < 1 || page > book.pageCount) continue;
        rows.push({ bookId: book.id, part: book.part, title: heading.title,
          page, pageEnd: Number.isInteger(Number(heading.page_end)) &&
          Number(heading.page_end) >= page && Number(heading.page_end) <= book.pageCount
            ? Number(heading.page_end) : null });
      }
    }
    return rows;
  }
  function filterSurahs(surahs, query) {
    const q = normalizeArabic(query);
    return q ? surahs.filter(item => normalizeArabic(item.title).includes(q)) : surahs;
  }
  function makeCitation(text, book, page, pageUrl) {
    const excerpt = String(text ?? '').trim();
    if (!excerpt || !book || !Number.isInteger(page) || page < 1 || page > book.pageCount)
      return '';
    return `«${excerpt}»\n— ${book.title}، الجزء ${book.part}، ص ${page}.\n${pageUrl}`;
  }
  return Object.freeze({ normalizeArabic, parsePageHash, buildPageUrl,
    collectSurahs, filterSurahs, makeCitation });
});