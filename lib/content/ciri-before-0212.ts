import type { CaseStudy, Content, Project } from "./types";

/* Ciri exactly as v0.2.11 and earlier shipped it, before its new site (v0.2.12): the room's title, text, facts,
   screen descriptions and logo (whose last letter was cut off), the Ciri name in the client strip, and the whole
   case study. v0.2.12 replaces each of these only while the database still holds this version, and the update
   files of earlier versions are built from it so they stay byte-for-byte the same. */
export const CIRI_ID = "917b706b-98ac-5382-ac9e-6928f98f53ec";

export const CIRI_PROJECT_BEFORE_0212: Pick<Project, "titleFont" | "titleStyle" | "text" | "facts" | "visuals" | "mascot"> = {
 "titleFont": "cormorant",
 "titleStyle": {
  "size": "xxl",
  "uppercase": true,
  "weight": 500,
  "tracking": 0.02
 },
 "text": {
  "id": "Arah visual dan prototipe toko untuk koleksi perak AG925: huruf grafit, abu perak, tanpa warna aksen, supaya foto produknya yang berkilau. Tiga puluh lima halaman yang bisa diklik, masing-masing dalam versi desktop dan HP, untuk ditinjau klien sebelum dibangun.",
  "en": "Visual direction and a clickable store prototype for an AG925 silver collection: graphite type, silver greys and no accent colour, so the photography brings the shine. Thirty-five clickable pages, each in desktop and phone versions, for the client to review before the build."
 },
 "facts": [
  {
   "value": "13",
   "label": {
    "id": "perhiasan dalam 8 bentuk",
    "en": "pieces in 8 forms"
   }
  },
  {
   "value": "35",
   "label": {
    "id": "halaman, desktop dan HP",
    "en": "pages, desktop and phone"
   }
  },
  {
   "value": "0",
   "label": {
    "id": "warna aksen, perak yang bicara",
    "en": "accent colours, the silver speaks"
   }
  }
 ],
 "visuals": [
  {
   "video": {
    "url": "/media/seed/live/ciri-desk.mp4"
   },
   "role": "desk",
   "image": {
    "url": "/media/seed/live/ciri-desk.webp",
    "width": 1600,
    "height": 1000,
    "alt": {
     "id": "Beranda Ciri: tangan memakai cincin perak, judul Your Personal Mark",
     "en": "Ciri homepage: a hand wearing a silver ring, headline Your Personal Mark"
    }
   }
  },
  {
   "video": {
    "url": "/media/seed/live/ciri-phone.mp4"
   },
   "role": "phone",
   "image": {
    "url": "/media/seed/live/ciri-phone.webp",
    "width": 600,
    "height": 1298,
    "alt": {
     "id": "Beranda Ciri di HP: tangan memakai cincin perak, judul Your Personal Mark",
     "en": "Ciri homepage on phone: a hand wearing a silver ring, headline Your Personal Mark"
    }
   }
  }
 ],
 "mascot": {
  "image": {
   "url": "/media/seed/mascot/ciri.webp",
   "width": 289,
   "height": 166,
   "alt": {
    "id": "Logo Ciri",
    "en": "Ciri logo"
   }
  },
  "motion": "dangle",
  "size": 66,
  "chip": ""
 }
};

export const CIRI_CLIENT_FONT_BEFORE_0212 = "cormorant" as const;

export const CIRI_CASE_BEFORE_0212: CaseStudy = {
 "projectSlug": "ciri",
 "published": true,
 "subtitle": {
  "id": "Arah visual dan prototipe toko online untuk koleksi perhiasan perak AG925, kini dalam review klien.",
  "en": "Visual direction and an online store prototype for an AG925 sterling-silver collection, now in client review."
 },
 "labels": {
  "client": "Ciri",
  "field": {
   "id": "Perhiasan perak",
   "en": "Silver jewellery"
  },
  "role": {
   "id": "Arah visual, desain UI, prototipe",
   "en": "Visual direction, UI design, prototype"
  },
  "year": "2026"
 },
 "cover": {
  "url": "/media/seed/ciri-home.webp",
  "alt": {
   "id": "Beranda Ciri: tangan memakai cincin perak, dengan judul Your Personal Mark",
   "en": "Ciri homepage: a hand wearing a silver ring under the headline Your Personal Mark"
  },
  "width": 1600,
  "height": 1000
 },
 "blocks": [
  {
   "type": "prose",
   "title": {
    "id": "Situasinya",
    "en": "The situation"
   },
   "paragraphs": [
    {
     "id": "Ciri menjual koleksi perhiasan perak sterling AG925: 13 perhiasan dalam 8 bentuk, terdiri dari cincin, anting, dan kalung. Perhiasan perak dijual lewat fotonya, jadi tampilan toko harus memberi ruang untuk kilau logamnya, bukan bersaing dengannya.",
     "en": "Ciri sells an AG925 sterling-silver collection: 13 pieces in 8 forms across rings, earrings and necklaces. Silver jewellery sells through its photos, so the store has to give the metal room to shine, not compete with it."
    },
    {
     "id": "Sebelum toko dibangun, klien perlu melihat dan mencobanya lebih dulu. Saya menyerahkan satu file preview berisi 35 halaman yang bisa diklik, masing-masing dalam versi desktop dan HP. Klien sedang meninjaunya sekarang, dan tokonya belum dibangun.",
     "en": "Before anything gets built, the client needs to see and try the store. I handed over a single preview file with 35 clickable pages, each in a desktop and a phone version. The client is reviewing it now, and the store itself hasn't been built yet."
    }
   ]
  },
  {
   "type": "features",
   "title": {
    "id": "Toko yang bisa diklik",
    "en": "A store you can click through"
   },
   "items": [
    {
     "title": {
      "id": "Arah visual tanpa warna aksen",
      "en": "A visual direction with no accent colour"
     },
     "text": {
      "id": "Huruf grafit dan abu perak, tanpa warna aksen sama sekali, supaya foto perhiasan yang paling menonjol. Judul memakai Cormorant yang klasik, sedangkan teks memakai Inter Tight yang ringkas dan mudah dibaca di HP.",
      "en": "Graphite type and silver greys with no accent colour at all, so the jewellery photos stand out most. Headings use the classic Cormorant, while body text uses the compact Inter Tight, which reads easily on a phone."
     },
     "images": [
      {
       "url": "/media/seed/ciri-hp-home.webp",
       "alt": {
        "id": "Beranda Ciri di HP: cincin perak di jari dengan judul Your Personal Mark dan tombol Shop Now",
        "en": "Ciri homepage on a phone: a silver ring on a finger with the headline Your Personal Mark and a Shop Now button"
       },
       "width": 600,
       "height": 1298
      }
     ]
    },
    {
     "title": {
      "id": "Koleksi dan kategori",
      "en": "Collection and categories"
     },
     "text": {
      "id": "Halaman koleksi menampilkan ketiga belas perhiasan dalam satu grid. Pembeli bisa memilih kategori cincin, kalung, atau anting, menyaring menurut ketersediaan dan bentuk, lalu mengurutkan hasilnya.",
      "en": "The collection page lays out all 13 pieces in one grid. Shoppers can pick rings, necklaces or earrings, filter by availability and form, then sort the results."
     },
     "images": [
      {
       "url": "/media/seed/ciri-katalog.webp",
       "alt": {
        "id": "Halaman koleksi Ciri: pilihan kategori, filter ketersediaan dan bentuk, dan grid cincin perak",
        "en": "Ciri collection page: category choices, availability and form filters, and a grid of silver rings"
       },
       "width": 1600,
       "height": 1000
      }
     ]
    },
    {
     "title": {
      "id": "Halaman produk dan tas belanja",
      "en": "Product pages and the bag"
     },
     "text": {
      "id": "Setiap perhiasan punya halaman sendiri dengan foto, detail produk, dan catatan perawatan perak. Tas belanja terbuka dari samping, jadi pembeli bisa menambah barang tanpa meninggalkan halaman.",
      "en": "Each piece has its own page with photos, product details and silver care notes. The bag slides open from the side, so shoppers can add items without leaving the page."
     },
     "images": [
      {
       "url": "/media/seed/ciri-produk.webp",
       "alt": {
        "id": "Halaman produk Hollow Ring versi desktop",
        "en": "Hollow Ring product page on desktop"
       },
       "width": 1600,
       "height": 1000
      },
      {
       "url": "/media/seed/ciri-hp.webp",
       "alt": {
        "id": "Halaman produk Hollow Ring versi HP",
        "en": "Hollow Ring product page on a phone"
       },
       "width": 600,
       "height": 1298
      }
     ]
    },
    {
     "title": {
      "id": "Journal dan alur belanja lengkap",
      "en": "Journal and the full shopping flow"
     },
     "text": {
      "id": "Delapan artikel journal mengisi sisi editorial toko. Halaman tentang, kontak, bantuan, akun, checkout, dan konfirmasi pesanan juga dirancang, jadi klien bisa mencoba belanja dari beranda sampai pesanan selesai.",
      "en": "Eight journal articles carry the editorial side of the store. The about, contact, help, account, checkout and order confirmation pages are designed too, so the client can try a purchase from the homepage to the final confirmation."
     },
     "images": []
    }
   ]
  },
  {
   "type": "flow",
   "title": {
    "id": "Dari arah visual ke toko",
    "en": "From visual direction to store"
   },
   "steps": [
    {
     "id": "Menetapkan arah visual: grafit, abu perak, tanpa aksen",
     "en": "Set the visual direction: graphite, silver greys, no accent"
    },
    {
     "id": "Merancang 35 halaman dalam versi desktop dan HP",
     "en": "Design 35 pages in desktop and phone versions"
    },
    {
     "id": "Menyatukannya dalam satu file preview yang bisa diklik",
     "en": "Put them together in one clickable preview file"
    },
    {
     "id": "Klien mencoba alur belanja dan memberi catatan",
     "en": "The client clicks through the shopping flow and leaves notes"
    },
    {
     "id": "Toko dibangun setelah desainnya disetujui",
     "en": "The store gets built once the design is approved"
    }
   ]
  },
  {
   "type": "decisions",
   "title": {
    "id": "Keputusan yang melindungi bisnis",
    "en": "Decisions that protect the business"
   },
   "items": [
    {
     "title": {
      "id": "Prototipe sebelum kode",
      "en": "Prototype before code"
     },
     "text": {
      "id": "Klien bisa mengklik seluruh toko sebelum satu baris kode toko ditulis. Mengubah desain di tahap ini jauh lebih murah dan cepat daripada mengubah toko yang sudah jadi.",
      "en": "The client can click through the whole store before a single line of store code is written. Changing a design at this stage is far cheaper and quicker than changing a finished store."
     }
    },
    {
     "title": {
      "id": "Perak yang menjadi warnanya",
      "en": "The silver is the colour"
     },
     "text": {
      "id": "Tanpa warna aksen, tombol dan tautan tidak berebut perhatian dengan produk. Satu-satunya kilau di halaman datang dari foto perak itu sendiri.",
      "en": "With no accent colour, buttons and links don't compete with the products for attention. The only shine on the page comes from the silver in the photos."
     }
    },
    {
     "title": {
      "id": "Setiap halaman punya versi HP",
      "en": "Every page has a phone version"
     },
     "text": {
      "id": "Ke-35 halaman dirancang untuk desktop dan HP sekaligus, jadi klien menilai keduanya sebelum toko dibangun, bukan menemukan masalah tampilan HP setelah tayang.",
      "en": "All 35 pages are designed for desktop and phone together, so the client judges both before the build instead of finding phone layout problems after launch."
     }
    },
    {
     "title": {
      "id": "Catatan perawatan di halaman produk",
      "en": "Care notes on the product page"
     },
     "text": {
      "id": "Perak bisa menghitam jika salah dirawat. Catatan perawatan ditaruh di halaman produk, supaya pembeli tahu cara menjaganya sejak sebelum membeli.",
      "en": "Silver can tarnish if it's cared for the wrong way. Care notes sit on the product page, so shoppers know how to look after a piece before they buy it."
     }
    }
   ]
  },
  {
   "type": "numbers",
   "title": {
    "id": "Dalam angka",
    "en": "By the numbers"
   },
   "facts": [
    {
     "value": "13",
     "label": {
      "id": "perhiasan dalam 8 bentuk",
      "en": "pieces in 8 forms"
     }
    },
    {
     "value": "35",
     "label": {
      "id": "halaman, desktop dan HP",
      "en": "pages, desktop and phone"
     }
    },
    {
     "value": "8",
     "label": {
      "id": "artikel journal",
      "en": "journal articles"
     }
    },
    {
     "value": "0",
     "label": {
      "id": "warna aksen, perak yang bicara",
      "en": "accent colours, the silver speaks"
     }
    }
   ],
   "stack": {
    "id": "Dibangun dengan HTML, CSS, dan JavaScript dalam satu file preview, memakai huruf Cormorant dan Inter Tight.",
    "en": "Built with HTML, CSS and JavaScript as a single preview file, set in Cormorant and Inter Tight."
   }
  }
 ],
 "theme": {
  "wall": "#F6F6F5",
  "ink": "#2F3031",
  "muted": "#5B5F63",
  "accent": "#6B6F73",
  "btnBg": "#2F3031",
  "btnInk": "#F9F9F9"
 }
};

/** The content as v0.2.11 and earlier shipped Ciri; every other project and section is left as it is. */
export function contentBefore0212<C extends Content>(content: C): C {
  const c = structuredClone(content);
  const p = c.projects.find((x) => x.id === CIRI_ID);
  if (p) Object.assign(p, structuredClone(CIRI_PROJECT_BEFORE_0212));
  for (const it of c.sections.hero.clients.items) if (it.projectSlug === "ciri") it.font = CIRI_CLIENT_FONT_BEFORE_0212;
  const i = c.caseStudies.findIndex((x) => x.projectSlug === "ciri");
  if (i >= 0) c.caseStudies[i] = structuredClone(CIRI_CASE_BEFORE_0212);
  return c;
}
