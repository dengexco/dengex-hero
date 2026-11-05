# dengeX Hero

Vite 6 giriş bileşeninin sinyal akışı tasarımından uyarlanan bağımsız dengeX hero bölümü. HTML, CSS, JavaScript ve logo dahildir; derleme veya bağımlılık gerektirmez.

```sh
python3 -m http.server 4173
```

Tarayıcıda http://localhost:4173 adresini açın.

Mavi giriş / gümüş çıkış ışıkları, merkez logo animasyonu, on hizmet önizlemesi, duraklatma, mobil görünüm ve azaltılmış hareket desteği içerir. Projenin detay ekranları bu depoya dahil değildir.

## Entegrasyon

`hero.css`, `services.js`, `hero.js` ve `assets/` dosyalarını birlikte kullanın. Hizmet veya eylem seçildiğinde `#intro-scene` üzerinden `hero-select` olayı yayılır:

```js
document.addEventListener('hero-select', ({ detail: { id, present } }) => {
  console.log(id, present); // Kendi hizmet sayfanıza veya sunumunuza bağlayın.
});
```

## Tasarım referansı

Hero, [Vite](https://vite.dev/) 6 giriş bileşenindeki sinyal akışı yaklaşımından dengeX marka kimliğine uyarlanmıştır. dengeX logosu ve içerikleri dengeX'e aittir.
