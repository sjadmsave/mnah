'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const tools = require('../research-tools.js');
const root = path.join(__dirname, '..');
const books = [595,363,340,397,427].map((pageCount, i) => ({
  id:'book'+(i+1),part:i+1,pageCount,title:'منة المنان — الجزء '+(i+1)
}));
assert.equal(tools.parsePageHash('#book=book2&page=49',books).pageIndex,48);
for(const hash of ['', '#book=book0&page=1','#book=book1&page=0',
 '#book=book2&page=364','#book=book3&page=1.5','#book=book3&page=-1',
 '#book=book2&page=%3Cscript%3E','#book=book1&page=9999999999999999999999']){
 assert.equal(tools.parsePageHash(hash,books),null,hash);
}
const link=tools.buildPageUrl('https://sjadmsave.github.io/mnah/index.html','book4',146);
assert.equal(link,'https://sjadmsave.github.io/mnah/index.html#book=book4&page=146');
assert.equal(tools.parsePageHash(new URL(link).hash,books).pageIndex,145);
assert.equal(tools.normalizeArabic('إِلَىٰ السُّورَةِ'),'الي السورة');
const byBook=Object.fromEntries(books.map(book=>[book.id,
 JSON.parse(fs.readFileSync(path.join(root,'fahrst',book.part+'.json'),'utf8'))]));
const surahs=tools.collectSurahs(books,byBook);
assert.equal(surahs.length,35);
assert.equal(tools.filterSurahs(surahs,'التَّكْوِير').length,1);
assert.equal(tools.filterSurahs(surahs,'غير موجود').length,0);
assert(surahs.every(s=>s.page>=1&&s.page<=books[s.part-1].pageCount));
assert.match(tools.makeCitation('نص',books[0],46,link),/الجزء 1، ص 46/);
assert.equal(tools.makeCitation('',books[0],46,link),'');
console.log('Research tools tests passed');
