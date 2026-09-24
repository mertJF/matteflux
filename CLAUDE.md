# MATTEFLUX — PROJE TALİMATLARI

## 1. PROJE ÖZETİ
Matteflux (matteflux.com), web siteleri için video arka planlı, kullanıma
hazır HERO ve FOOTER bileşenleri satan bağımsız (indie) bir marka.
Satılan şey stok video değil; web tasarımcısının birkaç dakikada sitesine
koyabileceği, videosu gömülü, tasarımı ve kodu hazır bileşenler.
Temel fikir EŞLEŞEN SETLER: her set aynı görsel aileden bir hero ve bir
footer içerir. Hero daha belirgin (sayfanın ilk izlenimi), footer daha sakin
(sayfanın kapanışı). Set olarak veya tek tek satılabilir.
Slogan önerisi: "Ambient motion for heroes & footers." (kesinleşmedi)

Hedef kitle: web tasarımcıları, freelancer'lar, küçük ajanslar, Framer ve
Webflow kullanıcıları, kendi sitesini yapan geliştiriciler.

## 2. ÇALIŞMA KURALLARI
- Benimle Türkçe konuş. Ürüne ve siteye giren her şey İngilizce: site
  metinleri, ürün açıklamaları, kod ve yorumlar, dokümantasyon, pazarlama.
- Her oturum tek bir işe odaklanır (ör. "Set 2 üretimi", "Lisans metni").
- Emin olmadığın fiyat, rakam veya iddiaları uydurma; [PLACEHOLDER] bırak
  veya araştır.
- Commit'ten önce: `cd site && node build.mjs && node tools/test.mjs`
  geçmeli. Commit mesajları İngilizce, kısa ve ne değiştiğini söyleyen.
- Push'tan önce bana ne gönderileceğini özetle ve onay al.

## 3. ZİYARETÇİ DENEYİMİ — matteflux.com
Amaç: ziyaretçi siteye girdiği an ürünü "yaşar". Site ürünün kendisini
kullanır: hero'da da footer'da da Matteflux videoları oynar.

### 3.1 Ana sayfa (yukarıdan aşağıya)
1. HERO: Tam ekran Matteflux hero videosu. Üstünde büyük başlık, kısa bir
   alt başlık ve iki buton: "Browse sets" ve "Get a free set".
2. CANLI SET DEĞİŞTİRİCİ (ana "wow" anı): Ziyaretçi küçük set
   önizlemelerine tıkladıkça sayfanın hero'su VE footer'ı birlikte o sete
   geçer. Masaüstü/mobil görünüm anahtarı ve overlay (karartma) kaydırıcısı
   olur. Ziyaretçi ürünü kendi gözüyle, gerçek bir sayfada test eder.
3. HOW IT WORKS: 3 adım — Pick a set → Download → Paste the code.
4. SET GALERİSİ: Tüm setler kart olarak; üzerine gelince video önizlemesi
   oynar. Her kart set detay sayfasına gider.
5. WHY MATTEFLUX: Kusursuz döngü; çok küçük dosyalar; sayfa hızı için
   hazır (poster görseli, lazy load, prefers-reduced-motion); yapay zekâ
   bozulması yok (prosedürel üretim); metin okunabilirliği test edilmiş
   overlay değerleri; masaüstü ve mobil için ayrı kompozisyonlar.
6. PLATFORMLAR: HTML/CSS, Framer, Webflow logoları/ifadeleriyle "works
   with" bölümü.
7. FİYATLANDIRMA özeti (bkz. 3.3).
8. ÜCRETSİZ SET: E-posta karşılığında 1 set. Kısa form.
9. SSS (FAQ).
10. FOOTER: Kendisi bir Matteflux footer'ı. Linkler: Sets, Pricing, Docs,
    License, FAQ, iletişim, sosyal medya, yasal sayfalar.

### 3.2 Diğer sayfalar
- /sets: Katalog. Filtre: renk tonu, hareket tipi, hero/footer.
- /sets/[set-adı]: Set detay sayfası:
  - Gerçek bir örnek site içinde hero + footer'ın canlı önizlemesi
  - Masaüstü/mobil anahtarı, overlay kaydırıcısı
  - Teknik bilgiler: formatlar, çözünürlükler, dosya boyutları, süre
  - Paket içeriği listesi
  - Kurulum kodundan kısa bir önizleme
  - Fiyat ve satın alma butonu (Polar checkout)
- /pricing: Paketler ve lisans karşılaştırması.
- /docs: Kurulum rehberleri (HTML/CSS, Framer, Webflow), performans
  ipuçları, overlay ayarı, sık yapılan hatalar.
- /license: Lisans şartları, sade İngilizceyle.
- /faq
- Yasal: Terms, Privacy, Refund policy.

### 3.3 Fiyatlandırma ve lisans (yapı; rakamlar araştırılıp test edilecek)
- Tek set (hero + footer): [FİYAT]
- Paket (ör. 6 set): [FİYAT]
- All-access (tüm setler + gelecek setler): [FİYAT]
Lisans seviyeleri:
- Personal / Single project: tek bir site
- Commercial / Unlimited: sınırsız proje, müşteri işleri dahil
Rakip ürünlerin fiyatları araştırılarak başlangıç fiyatları belirlenecek.

### 3.4 Satın alma akışı
Ziyaretçi "Buy" → Polar.sh checkout → ödeme → e-posta ile indirme linki
ve lisans. Satın alınan setlerin güncellemeleri ücretsiz.

## 4. ÜRÜN — BİR SETİN İÇERİĞİ
İndirme paketi (ZIP) klasör yapısı:
  /hero      → desktop (2560x1440, 16:9) + mobile (1080x1920) videoları
  /footer    → desktop (2560x854, 3:1) + mobile (1080x1350) videoları
  /posters   → her video için poster görseli
  /code      → html-css/, framer/, webflow/ kurulum dosyaları
  README     → hızlı kurulum, önerilen overlay değerleri, lisans özeti
Video özellikleri:
- 8–10 sn, sessiz, kusursuz döngü
- MP4 + WebM, olabildiğince küçük (footer lazy load; hero'da performans
  kritik: anında görünen poster, prefers-reduced-motion desteği)
- Her format kendi kompozisyonuyla ayrı render edilir (kırpma yok)
- Hero'da başlığın geleceği bölge sakin kalır

## 5. VİDEO ÜRETİMİ
Yapay zekâ video modeli değil, Python (numpy + ffmpeg) ile prosedürel
üretim. Avantajlar: garantili kusursuz döngü, küçük dosya, filigran/lisans
derdi yok, aynı kodla eşleşen hero/footer varyasyonları.
Prototip tekniği: periyodik sinüs dalgaları + domain warp, faz = 2π·kare/
toplam kare. Düşük çözünürlükte hesaplanıp büyütülür, Gaussian blur
uygulanır. Örnek renk rampası: #0A0B0E → #0E181E → #163A40 → #966034 →
#E8AA68, kenarlarda vinyet.

İlk koleksiyon "Dark Ambient" (6 set):
1. Amber-turkuaz aurora bandı (footer prototipi mevcut)
2. Yavaş akan gece sisi
3. Derin mavi su yüzeyi yansıması
4. Uzakta süzülen partiküller
5. Mor-lacivert akışkan gradyan
6. İnce çizgili topografik dalga

## 6. MARKA
- İsim: Matteflux. Domain: matteflux.com
- Ton: sakin, sofistike, minimal. Referanslar: Aesop, Kinfolk (zarafet) +
  Linear, Vercel (sadelik, netlik).
- Varsayılan tema koyu; videolar sahnenin yıldızı, arayüz geri planda.
- Tipografi: zarif bir serif başlık fontu + sade bir sans gövde fontu.
- "Flux" kelimesi yapay zekâ modeli Flux'ı çağrıştırabilir; sitede
  "procedurally crafted, not AI-generated" mesajı net verilecek.

## 7. TEKNİK ALTYAPI
- Hızlı, statik bir site (düz HTML/CSS/JS veya Astro).
- Ücretsiz katmanı olan bir statik hosting (Cloudflare Pages, Netlify vb.)
- Videolar bir CDN üzerinden, sayfa hızı öncelikli.
- Ödeme: Polar.sh (Türkiye destekli, Türk bankasına TL ödeme).
  Stripe, PayPal, Gumroad, Lemon Squeezy, Paddle kullanılmayacak.
- E-posta listesi: ücretsiz set formu için basit bir e-posta servisi.

## 7.1 SATIŞ VE PAZARLAMA
- Ana kanal: matteflux.com (Polar). Yan kanal: Envato vb. pazar yerleri
  (ödeme Payoneer ile), yükle-unut.
- Trafik: Dribbble/Behance/X'te ekran kayıtları, Framer ve Webflow
  toplulukları, Reddit web tasarım toplulukları, ücretsiz set ile e-posta
  listesi, hazır olunca Product Hunt lansmanı.
- Bireysel satıcı, şirket yok.

## 8. ÇALIŞMA SIRASI
Faz 1 — Deneyim tasarımı ✅
Faz 2 — Üretim: Set 1 ✅. Set 2–6 lansman öncesi üretilecek (bkz. durum).
Faz 3 — Site ✅
Faz 4 — Satış altyapısı: Polar ürünleri, lisans metni, yasal sayfalar,
  ücretsiz set akışı.  ← SIRADAKİ
Faz 5 — Lansman: Tanıtım içerikleri, topluluk paylaşımları, Product Hunt.

---

# MEVCUT DURUM (Eylül 2026)

## Repo yapısı
```
site/         matteflux.com (statik, bağımlılıksız Node derleme)
production/   render + paketleme araçları, set kod şablonları
CLAUDE.md     bu dosya
```

## Site (`site/`)
- Astro yerine bağımsız Node derleme (`build.mjs`): şablonlar
  `src/pages/*.mjs`, veri `src/data/sets.json` ve `faq.json`, ayarlar
  `src/config.mjs`. Ayrıntılar: `site/README.md`.
- Komutlar: `node build.mjs` (dist/'e derler ve açık yer tutucuları
  listeler), `node serve.mjs` (localhost:4321, Range destekli),
  `node tools/test.mjs` (Playwright; masaüstü + mobil, video oynatma,
  set değiştirici, filtreler, form, reduced-motion).
- Site ürünün kendisini kullanır: `src/assets/mf/matteflux.css|js`,
  `production/templates/code/html-css/` ile AYNI olmalı.
- Tasarım: koyu tema, Instrument Serif (başlık) + Geist (gövde) + Geist
  Mono (etiket), zemin #0C0C0B, metin #EDE8DE, tek vurgu #E8AA68.
- Hosting planı: Cloudflare Pages, kök `site`, build `node build.mjs`,
  çıktı `dist`. `public/_headers` önbellek ayarlarını içerir.

## Setler
- 01 Ember Aurora: FİNAL. 10 sn, 24 fps, 4 format × (MP4 + WebM).
  Hero desktop WebM 217 KB / MP4 746 KB. Döngü dikişi ölçüldü, görünmez.
- 02–06: Faz 1 önizlemeleri (960 px atlas kesimleri), sitede "Preview /
  Coming soon". Final için `matteflux_render.py` içindeki `SETS`'e her set
  için bir fonksiyon eklenecek; görsel referans `generate_preview_atlas.py`.
- Overlay: metin alanındaki piksellerin %99.5'inde beyaz metin 4.5:1
  kontrasta ulaşan en düşük değer ölçülür. Önerilen = ölçülen + %5,
  taban hero %20, footer %25 (derleme sırasında hesaplanır).

## Açık işler
- Yer tutucular: fiyatlar, para birimi, 6 Polar linki, e-posta form adresi,
  iletişim e-postası, sosyal linkler, lisans + Terms/Privacy/Refund
  metinleri (hepsi `site/src/config.mjs` ve `src/pages/content.mjs`).
- Lansman öncesi: Set 2–6 final render; fontları self-host et (Google
  Fonts yerine); iPhone Safari'de ve MP4 yolunda gerçek cihaz testi
  (test tarayıcısı Chromium, H.264 oynatmıyor).
- Ücretsiz set hangisi olacak: karar verilmedi.
- Videolar büyüyünce `config.mjs` → `mediaBase` ile R2/CDN'e taşı.

## Dikkat
- Aynı formatı iki render işiyle aynı anda üretme: dosya bozulur.
- Tam çözünürlükte kareleri belleğe toplu yükleme; ölçümü küçültülmüş
  karelerde yap (`site/tools/build_site_media.py` örneği).
