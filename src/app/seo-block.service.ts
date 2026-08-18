// // src/app/services/seo-block.service.ts
// import { Injectable } from '@angular/core';
// import { Meta } from '@angular/platform-browser';

// @Injectable({
//   providedIn: 'root'
// })
// export class SeoBlockService {
//   constructor(private meta: Meta) {}

//   blockSearchEngines() {
//     this.meta.addTags([
//       { name: 'robots', content: 'noindex, nofollow' },
//       { name: 'googlebot', content: 'noindex, nofollow' },
//       { name: 'bingbot', content: 'noindex, nofollow' }
//     ]);
//   }
// }