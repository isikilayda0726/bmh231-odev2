document.addEventListener('DOMContentLoaded', () => {
  const etkinlikKapsayici = document.getElementById('etkinlikKapsayici');
  const aramaKutusu = document.getElementById('aramaKutusu');
  const turButonlari = document.querySelectorAll('.tur-btn');
  const yukleniyor = document.getElementById('yukleniyor');
  const oneriFormu = document.getElementById('oneriFormu');
  const formMesaj = document.getElementById('formMesaj');

  let aktifTur = '';

  async function etkinlikleriGetir(tur = '') {
    try {
      yukleniyor.classList.remove('gizli');
      etkinlikKapsayici.innerHTML = '';

      let url = '/api/etkinlikler';
      if (tur) {
        url += `?tur=${encodeURIComponent(tur)}`;
      }

      const yanıt = await fetch(url);
      if (!yanıt.ok) throw new Error('Veriler yüklenirken hata oluştu.');

      const etkinlikler = await yanıt.json();
      kartlariOlustur(etkinlikler);
    } catch (hata) {
      console.error(hata);
      etkinlikKapsayici.innerHTML = '<p class="hata">Etkinlikler yüklenemedi.</p>';
    } finally {
      yukleniyor.classList.add('gizli');
    }
  }

  function kartlariOlustur(etkinlikler) {
    etkinlikKapsayici.innerHTML = '';
    if (etkinlikler.length === 0) {
      etkinlikKapsayici.innerHTML = '<p>Bu kategoride etkinlik bulunamadı.</p>';
      return;
    }

    etkinlikler.forEach(etkinlik => {
      const kart = document.createElement('div');
      kart.className = 'kart';

      const baslik = document.createElement('h3');
      baslik.textContent = etkinlik.baslik;

      const tarih = document.createElement('p');
      tarih.textContent = `Tarih: ${etkinlik.tarih}`;

      const aciklama = document.createElement('p');
      aciklama.textContent = etkinlik.aciklama;

      kart.appendChild(baslik);
      kart.appendChild(tarih);
      kart.appendChild(aciklama);

      etkinlikKapsayici.appendChild(kart);
    });
  }

  turButonlari.forEach(buton => {
    buton.addEventListener('click', (e) => {
      turButonlari.forEach(b => b.classList.remove('secili'));
      e.target.classList.add('secili');

      aktifTur = e.target.getAttribute('data-tur');
      etkinlikleriGetir(aktifTur);
    });
  });

  if (aramaKutusu) {
    aramaKutusu.addEventListener('input', async (e) => {
      const aramaMetni = e.target.value.toLowerCase();
      try {
        const yanıt = await fetch('/api/etkinlikler');
        const etkinlikler = await yanıt.json();
        
        const filtrelenmis = etkinlikler.filter(e => 
          e.baslik.toLowerCase().includes(aramaMetni) || 
          e.aciklama.toLowerCase().includes(aramaMetni)
        );
        kartlariOlustur(filtrelenmis);
      } catch (hata) {
        console.error('Arama hatası:', hata);
      }
    });
  }

  if (oneriFormu) {
    oneriFormu.addEventListener('submit', (e) => {
      e.preventDefault();
      const baslik = document.getElementById('baslikInput').value.trim();
      const tarih = document.getElementById('tarihInput').value.trim();
      const eposta = document.getElementById('epostaInput').value.trim();

      if (!baslik || !tarih || !eposta) {
        formMesaj.textContent = 'Lütfen tüm alanları doldurun.';
        formMesaj.className = 'hata';
        return;
      }

      formMesaj.textContent = 'Öneriniz başarıyla alındı. Teşekkürler!';
      formMesaj.className = 'basarili';
      oneriFormu.reset();
    });
  }

  etkinlikleriGetir();
});