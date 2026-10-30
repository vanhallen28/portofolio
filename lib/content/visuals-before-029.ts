import type { Img, Project } from "./types";

/** Each seed project's room screens exactly as v0.2.8 shipped them. v0.2.9 swaps a screen for its live version
    (new still + video) only while the database still shows this image, so screens the owner replaced stay. */
export const VISUALS_BEFORE_029: Record<string, { role: "desk" | "phone" | "back"; image: Img }[]> = {
 "73b8623d-c113-5ea0-ab63-d3aac3dee57e": [
  {
   "role": "desk",
   "image": {
    "url": "/media/seed/aliya-admin.webp",
    "width": 1600,
    "height": 911,
    "alt": {
     "id": "Panel admin Aliya Syifaa: pesanan baru, kunjungan aktif, pendapatan, dan keluhan terbanyak",
     "en": "Aliya Syifaa admin panel: new bookings, active visits, revenue and top complaints"
    }
   }
  },
  {
   "role": "phone",
   "image": {
    "url": "/media/seed/aliya-hp-beranda.webp",
    "width": 390,
    "height": 844,
    "alt": {
     "id": "Aplikasi pasien: kunjungan berikutnya dan daftar layanan",
     "en": "Patient app: next visit and list of services"
    }
   }
  }
 ],
 "adb2f26d-61cb-549f-894d-957fd98ee546": [
  {
   "role": "back",
   "image": {
    "url": "/media/seed/hris-heatmap.webp",
    "width": 1600,
    "height": 887,
    "alt": {
     "id": "Timesheet heatmap kehadiran harian per karyawan",
     "en": "Daily attendance timesheet heatmap per employee"
    }
   }
  },
  {
   "role": "desk",
   "image": {
    "url": "/media/seed/hris-dasbor.webp",
    "width": 1600,
    "height": 903,
    "alt": {
     "id": "Dasbor HR: jumlah hadir, terlambat, WFH, log absensi live",
     "en": "HR dashboard: present, late, WFH counts and live attendance log"
    }
   }
  }
 ],
 "5a58e7d3-0970-5cba-8abd-ffb43dc286b5": [
  {
   "role": "desk",
   "image": {
    "url": "/media/seed/biansa-beranda.webp",
    "width": 1600,
    "height": 1000,
    "alt": {
     "id": "Beranda Biansa: model memakai outer karamel dalam bingkai lengkung, judul Nyaman itu tidak harus mahal",
     "en": "Biansa homepage: a model in a caramel outer inside an arched frame, headline Nyaman itu tidak harus mahal"
    }
   }
  },
  {
   "role": "phone",
   "image": {
    "url": "/media/seed/biansa-hp-produk.webp",
    "width": 600,
    "height": 1300,
    "alt": {
     "id": "Halaman produk Outer Piping Espresso versi HP: foto utama dan deretan thumbnail galeri",
     "en": "Outer Piping Espresso product page on phone: main photo and the gallery thumbnails"
    }
   }
  }
 ],
 "f93ddd77-c3ef-5bfd-8c21-1c671327edc5": [
  {
   "role": "phone",
   "image": {
    "url": "/media/seed/portal-top.webp",
    "width": 640,
    "height": 1023,
    "alt": {
     "id": "Beranda portal klien: status proyek dan kartu proyek",
     "en": "Client portal home: project status and project card"
    }
   }
  },
  {
   "role": "phone",
   "image": {
    "url": "/media/seed/portal-progres.webp",
    "width": 640,
    "height": 1015,
    "alt": {
     "id": "Progres tahapan, batas feedback 48 jam, sisa revisi",
     "en": "Stage progress, 48-hour feedback window, revisions left"
    }
   }
  }
 ],
 "917b706b-98ac-5382-ac9e-6928f98f53ec": [
  {
   "role": "desk",
   "image": {
    "url": "/media/seed/ciri-home.webp",
    "width": 1600,
    "height": 1000,
    "alt": {
     "id": "Beranda Ciri: tangan memakai cincin perak, judul Your Personal Mark",
     "en": "Ciri homepage: a hand wearing a silver ring, headline Your Personal Mark"
    }
   }
  },
  {
   "role": "phone",
   "image": {
    "url": "/media/seed/ciri-hp.webp",
    "width": 600,
    "height": 1298,
    "alt": {
     "id": "Halaman produk Hollow Ring versi HP",
     "en": "Hollow Ring product page on phone"
    }
   }
  }
 ],
 "5ea9fd41-1964-5919-b1f3-b5405a6c86dc": [
  {
   "role": "desk",
   "image": {
    "url": "/media/seed/web-contact.webp",
    "width": 1600,
    "height": 1000,
    "alt": {
     "id": "Halaman kontak Invisual Studio versi Bahasa Indonesia, mode gelap",
     "en": "Invisual Studio contact page in Indonesian, dark mode"
    }
   }
  },
  {
   "role": "phone",
   "image": {
    "url": "/media/seed/web-hp.webp",
    "width": 600,
    "height": 1298,
    "alt": {
     "id": "Halaman kontak di HP",
     "en": "Contact page on phone"
    }
   }
  }
 ],
 "36416adb-ba98-597e-8c59-4fef26390a55": [
  {
   "role": "desk",
   "image": {
    "url": "/media/seed/intbdg-paket.webp",
    "width": 1600,
    "height": 1000,
    "alt": {
     "id": "Pilihan paket internet dengan tab 1, 6, dan 12 bulan",
     "en": "Internet plans with 1, 6 and 12-month tabs"
    }
   }
  },
  {
   "role": "phone",
   "image": {
    "url": "/media/seed/intbdg-hp.webp",
    "width": 600,
    "height": 1298,
    "alt": {
     "id": "Paket internet di HP dengan tombol WhatsApp",
     "en": "Internet plans on phone with a WhatsApp button"
    }
   }
  }
 ],
 "4c7b3202-46ba-55fe-aed8-7695aac2189b": [
  {
   "role": "desk",
   "image": {
    "url": "/media/seed/point-kasir.webp",
    "width": 1600,
    "height": 1000,
    "alt": {
     "id": "Layar kasir POINT: menu kopi, pesanan berisi varian dan add-on, pajak PB1, dan pilihan bayar",
     "en": "POINT till screen: coffee menu, order with variants and add-ons, PB1 tax and payment options"
    }
   }
  },
  {
   "role": "phone",
   "image": {
    "url": "/media/seed/point-hp.webp",
    "width": 600,
    "height": 1298,
    "alt": {
     "id": "Katalog menu POINT di HP",
     "en": "POINT menu catalogue on phone"
    }
   }
  }
 ],
 "b3e12ca6-5f31-564b-bb02-2067017def95": [
  {
   "role": "desk",
   "image": {
    "url": "/media/seed/vale-peta.webp",
    "width": 1600,
    "height": 1000,
    "alt": {
     "id": "Beranda VALE: peta kerajaan bergaya cetak dengan enam landmark, kompas, dan daftar Legend of the Realm",
     "en": "VALE homepage: a printed-style map of the realm with six landmarks, a compass and the Legend of the Realm list"
    }
   }
  },
  {
   "role": "phone",
   "image": {
    "url": "/media/seed/vale-hp.webp",
    "width": 600,
    "height": 1298,
    "alt": {
     "id": "Bab I di HP: Every golfer becomes a knight, dengan ilustrasi ksatria",
     "en": "Chapter I on phone: Every golfer becomes a knight, with a knight illustration"
    }
   }
  }
 ],
 "042b1844-a06f-5a50-8149-8032ea9936c4": [
  {
   "role": "desk",
   "image": {
    "url": "/media/seed/loma-hero.webp",
    "width": 1600,
    "height": 1000,
    "alt": {
     "id": "Beranda Loma: lampu dinding hangat di ruang makan gelap, wordmark Loma besar di bawah",
     "en": "Loma homepage: a warm wall lamp in a dark dining room, the large Loma wordmark below"
    }
   }
  },
  {
   "role": "phone",
   "image": {
    "url": "/media/seed/loma-hp.webp",
    "width": 600,
    "height": 1298,
    "alt": {
     "id": "Tujuh menu signature Loma di HP, masing-masing dengan fotonya",
     "en": "Loma's seven signature plates on phone, each with its photo"
    }
   }
  }
 ],
 "ea7d720a-1d02-5600-b3b3-175d3728dc65": [
  {
   "role": "desk",
   "image": {
    "url": "/media/seed/rua-hero.webp",
    "width": 1600,
    "height": 1000,
    "alt": {
     "id": "Beranda RUA: wordmark merah besar di latar kuning, maskot kura-kura memegang menu dan menyapa Xin chào",
     "en": "RUA homepage: a large red wordmark on yellow, the turtle mascot holding a menu and saying Xin chào"
    }
   }
  },
  {
   "role": "phone",
   "image": {
    "url": "/media/seed/rua-hp.webp",
    "width": 600,
    "height": 1298,
    "alt": {
     "id": "Come, we eat di HP: judul kuning di latar merah dan tiga kura-kura pelayan",
     "en": "Come, we eat on phone: a yellow headline on red and three turtle servers"
    }
   }
  }
 ]
};

/** A seed project as v0.2.8 shipped it: the still screens above (no video) and no mascot. */
export function projectBefore029(p: Project): Project {
  const before = VISUALS_BEFORE_029[p.id];
  return { ...p, mascot: null, visuals: before ? before.map((v) => ({ ...v, video: null })) : p.visuals };
}
