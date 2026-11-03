/* The official snippets for the codes set in admin → Kode iklan. IDs are validated by SettingsSchema
   (digits only / ca-pub- + digits), so they are safe to place inside the code. */

export type AdCodes = { metaPixelId: string; adsenseClient: string };

/** Meta Pixel base code; skipped in a browser where the owner switched counting off. */
export function pixelCode(id: string): string {
  return `(function(){try{if(localStorage.getItem('porto:notrack')==='1')return}catch(e){}`
      + `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};`
      + `if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;`
      + `s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');`
      + `fbq('init','${id}');fbq('track','PageView');})();`;
}

export const pixelNoscript = (id: string) => `https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`;

export const adsenseSrc = (client: string) => `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;

/** One line of /ads.txt for an AdSense publisher (f08c47fec0942fa0 is Google's certification ID). */
export const adsTxtLine = (client: string) => `google.com, ${client.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0`;

/** What the admin shows as "installed code", exactly as it goes into each page's <head>. */
export function installedCode(a: AdCodes): string {
  const parts: string[] = [];
  if (a.adsenseClient) {
    parts.push(`<!-- Google AdSense -->\n<meta name="google-adsense-account" content="${a.adsenseClient}">\n<script async src="${adsenseSrc(a.adsenseClient)}" crossorigin="anonymous"></script>`);
  }
  if (a.metaPixelId) {
    parts.push(`<!-- Meta Pixel -->\n<script>\n!function(f,b,e,v,n,t,s){…}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');\nfbq('init', '${a.metaPixelId}');\nfbq('track', 'PageView');\n</script>\n<noscript><img height="1" width="1" style="display:none" src="${pixelNoscript(a.metaPixelId)}"/></noscript>`);
  }
  return parts.join("\n\n");
}
