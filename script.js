// Seluruh kode dibungkus $(function () { ... });
// artinya: jalankan setelah halaman HTML selesai dimuat (pengganti DOMContentLoaded).
$(function () {

  // ============================================================
  // DATA BANGUN RUANG (sama seperti proyek sebelumnya)
  // ============================================================
  const bangunRuang = {
    kubus: {
      nama: "Kubus",
      rumus: "V = s³   |   L = 6 × s²",
      input: [{ id: "sisi", label: "Panjang sisi (s)" }],
      hitung: (n) => ({ volume: Math.pow(n.sisi, 3), luas: 6 * n.sisi * n.sisi }),
    },
    balok: {
      nama: "Balok",
      rumus: "V = p × l × t   |   L = 2 × (pl + pt + lt)",
      input: [
        { id: "p", label: "Panjang (p)" },
        { id: "l", label: "Lebar (l)" },
        { id: "t", label: "Tinggi (t)" },
      ],
      hitung: (n) => ({
        volume: n.p * n.l * n.t,
        luas: 2 * (n.p * n.l + n.p * n.t + n.l * n.t),
      }),
    },
    tabung: {
      nama: "Tabung",
      rumus: "V = π × r² × t   |   L = 2πr × (r + t)",
      input: [
        { id: "r", label: "Jari-jari (r)" },
        { id: "t", label: "Tinggi (t)" },
      ],
      hitung: (n) => ({
        volume: Math.PI * n.r * n.r * n.t,
        luas: 2 * Math.PI * n.r * (n.r + n.t),
      }),
    },
    kerucut: {
      nama: "Kerucut",
      rumus: "V = ⅓ × π × r² × t   |   L = πr × (r + s), s = √(r² + t²)",
      input: [
        { id: "r", label: "Jari-jari (r)" },
        { id: "t", label: "Tinggi (t)" },
      ],
      hitung: (n) => {
        const s = Math.sqrt(n.r * n.r + n.t * n.t); // garis pelukis
        return {
          volume: (1 / 3) * Math.PI * n.r * n.r * n.t,
          luas: Math.PI * n.r * (n.r + s),
        };
      },
    },
    bola: {
      nama: "Bola",
      rumus: "V = 4/3 × π × r³   |   L = 4 × π × r²",
      input: [{ id: "r", label: "Jari-jari (r)" }],
      hitung: (n) => ({
        volume: (4 / 3) * Math.PI * Math.pow(n.r, 3),
        luas: 4 * Math.PI * n.r * n.r,
      }),
    },
    prismaSegitiga: {
      nama: "Prisma Segitiga",
      rumus: "Alas segitiga siku-siku.  V = ½ × a × b × t   |   L = (a × b) + (a + b + c) × t, c = √(a² + b²)",
      input: [
        { id: "a", label: "Alas segitiga (a)" },
        { id: "b", label: "Tinggi segitiga (b)" },
        { id: "t", label: "Tinggi prisma (t)" },
      ],
      hitung: (n) => {
        const c = Math.sqrt(n.a * n.a + n.b * n.b); // sisi miring
        return { volume: 0.5 * n.a * n.b * n.t, luas: n.a * n.b + (n.a + n.b + c) * n.t };
      },
    },
    limasSegiempat: {
      nama: "Limas Segi Empat",
      rumus: "Alas persegi panjang.  V = ⅓ × p × l × t   |   L = luas alas + 4 sisi tegak segitiga",
      input: [
        { id: "p", label: "Panjang alas (p)" },
        { id: "l", label: "Lebar alas (l)" },
        { id: "t", label: "Tinggi limas (t)" },
      ],
      hitung: (n) => {
        const tinggiSisiP = Math.sqrt(Math.pow(n.l / 2, 2) + n.t * n.t);
        const tinggiSisiL = Math.sqrt(Math.pow(n.p / 2, 2) + n.t * n.t);
        return {
          volume: (1 / 3) * n.p * n.l * n.t,
          luas: n.p * n.l + n.p * tinggiSisiP + n.l * tinggiSisiL,
        };
      },
    },
    belahanBola: {
      nama: "Setengah Bola",
      rumus: "V = ⅔ × π × r³   |   L = 3 × π × r²",
      input: [{ id: "r", label: "Jari-jari (r)" }],
      hitung: (n) => ({
        volume: (2 / 3) * Math.PI * Math.pow(n.r, 3),
        luas: 3 * Math.PI * n.r * n.r,
      }),
    },
  };

  // ============================================================
  // AMBIL ELEMEN DENGAN SELECTOR jQuery  ( $("#id") )
  // ============================================================
  const $daftarBangun = $("#daftarBangun");
  const $kartuForm = $("#kartuForm");
  const $kolomInput = $("#kolomInput");
  const $tombolHitung = $("#tombolHitung");
  const $angkaVolume = $("#angkaVolume");
  const $angkaLuas = $("#angkaLuas");
  const $teksHasil = $("#teksHasil");

  let kunciAktif = "kubus";
  let hasilTerakhir = null; // menyimpan hasil agar animasi angka mulai dari nilai sebelumnya
  let pesanAlert = "";

  // ============================================================
  // FUNGSI BANTU
  // ============================================================
  function formatAngka(angka) {
    return angka.toLocaleString("id-ID", { maximumFractionDigits: 2 });
  }

  // Animasi angka naik/turun pelan ke nilai baru
  function animasiAngka($elemen, dari, ke) {
    const sebelumnya = $elemen.data("anim");
    if (sebelumnya) sebelumnya.stop(true); // hentikan animasi lama jika masih jalan

    const objek = $({ nilai: dari });
    $elemen.data("anim", objek);
    objek.animate({ nilai: ke }, {
      duration: 400,
      step: function (sekarang) { $elemen.text(formatAngka(sekarang)); },
      complete: function () { $elemen.text(formatAngka(ke)); },
    });
  }

  // Efek getar horizontal (untuk tanda form belum benar)
  function getar($elemen) {
    $elemen.css("position", "relative")
      .animate({ left: -8 }, 50).animate({ left: 8 }, 50)
      .animate({ left: -5 }, 50).animate({ left: 0 }, 50);
  }

  // ============================================================
  // VALIDASI OTOMATIS
  // Memeriksa satu kolom. Mengembalikan angkanya jika valid, atau null jika tidak.
  // tampilkanPesan = true  -> beri tanda merah + pesan (slideDown)
  // tampilkanPesan = false -> hanya cek diam-diam
  // ============================================================
  function cekKolom($input, tampilkanPesan) {
    const teks = $.trim($input.val());
    const angka = parseFloat(teks);
    const $pesan = $input.siblings(".pesan-field");
    const label = $input.siblings("label").text();
    let error = "";

    if (teks === "") error = label + " belum diisi.";
    else if (isNaN(angka) || angka <= 0) error = label + " harus berupa angka lebih dari 0.";

    if (tampilkanPesan) {
      $input.toggleClass("salah", error !== "").toggleClass("benar", error === "");
      if (error) $pesan.text(error).slideDown(150);
      else $pesan.slideUp(150);
    }
    return error ? null : angka;
  }

  // ============================================================
  // HASIL REAL-TIME
  // Dipanggil setiap kali ada perubahan input.
  // ============================================================
  function perbarui() {
    const bangun = bangunRuang[kunciAktif];
    const nilai = {};
    let semuaValid = true;

    $.each(bangun.input, function (i, item) {
      const angka = cekKolom($("#" + item.id), false);
      if (angka === null) semuaValid = false;
      else nilai[item.id] = angka;
    });

    // Tombol hanya aktif jika semua kolom valid
    $tombolHitung.prop("disabled", !semuaValid);

    if (!semuaValid) {
      hasilTerakhir = null;
      $angkaVolume.stop(true).text("–");
      $angkaLuas.stop(true).text("–");
      $teksHasil.text("Isi semua ukuran dengan angka lebih dari 0 untuk melihat hasil.");
      pesanAlert = "";
      return;
    }

    const hasil = bangun.hitung(nilai);
    animasiAngka($angkaVolume, hasilTerakhir ? hasilTerakhir.volume : 0, hasil.volume);
    animasiAngka($angkaLuas, hasilTerakhir ? hasilTerakhir.luas : 0, hasil.luas);
    hasilTerakhir = hasil;

    // Teks hasil di halaman, sekaligus bahan untuk alert
    const ukuran = bangun.input
      .map((item) => item.label + " = " + formatAngka(nilai[item.id]))
      .join("\n");
    pesanAlert =
      "Bangun ruang: " + bangun.nama + "\n" + ukuran + "\n\n" +
      "Volume = " + formatAngka(hasil.volume) + " satuan³\n" +
      "Luas permukaan = " + formatAngka(hasil.luas) + " satuan²";
    $teksHasil.text(pesanAlert);
  }

  // ============================================================
  // TAMPILAN FORM
  // ============================================================
  function isiForm(kunci) {
    kunciAktif = kunci;
    hasilTerakhir = null;
    const bangun = bangunRuang[kunci];

    $("#judulBangun").text(bangun.nama);
    $("#rumusBangun").text(bangun.rumus);

    // Buat kolom input dengan jQuery
    $kolomInput.empty();
    $.each(bangun.input, function (i, item) {
      const $wadah = $("<div>", { class: "field" });
      $("<label>", { for: item.id, text: item.label }).appendTo($wadah);
      $("<input>", {
        type: "number", id: item.id, min: 0, step: "any",
        inputmode: "decimal", placeholder: "contoh: 10",
      }).appendTo($wadah);
      $("<p>", { class: "pesan-field" }).appendTo($wadah);
      $wadah.appendTo($kolomInput);
    });

    $daftarBangun.find("button").each(function () {
      $(this).toggleClass("aktif", $(this).data("kunci") === kunci);
    });
    perbarui();
  }

  // Ganti bangun dengan animasi: form memudar, isi diganti, lalu muncul lagi
  function pilihBangun(kunci) {
    if (kunci === kunciAktif) return;
    $kartuForm.fadeOut(150, function () {
      isiForm(kunci);
      $kartuForm.fadeIn(250, function () { $kolomInput.find("input").first().focus(); });
    });
  }

  // ============================================================
  // EVENT HANDLER (semua memakai jQuery)
  // ============================================================

  // Tombol pilihan bangun dibuat dari data, lalu diberi event click
  $.each(bangunRuang, function (kunci, bangun) {
    $("<button>", { type: "button", text: bangun.nama }).data("kunci", kunci).appendTo($daftarBangun);
  });
  $daftarBangun.on("click", "button", function () { pilihBangun($(this).data("kunci")); });

  // Event delegation: input dibuat dinamis, jadi event dipasang pada induknya
  $kolomInput.on("input", "input", function () {
    cekKolom($(this), true); // validasi kolom yang sedang diketik
    perbarui();              // hitung ulang real-time
  });
  $kolomInput.on("blur", "input", function () { cekKolom($(this), true); });

  // Tombol "Tampilkan di alert" (juga aktif lewat tombol Enter)
  $("#formHitung").on("submit", function (e) {
    e.preventDefault();
    let adaError = false;
    $kolomInput.find("input").each(function () {
      if (cekKolom($(this), true) === null) adaError = true;
    });
    if (adaError) { getar($kartuForm); return; }

    perbarui();
    $("#areaHasil").fadeTo(120, 0.4).fadeTo(300, 1); // kedip singkat tanda hasil diperbarui
    alert(pesanAlert);
  });

  $("#tombolReset").on("click", function () {
    $("#formHitung")[0].reset();
    $kolomInput.find("input").removeClass("salah benar");
    $kolomInput.find(".pesan-field").slideUp(150);
    perbarui();
    $kolomInput.find("input").first().focus();
  });

  // ============================================================
  // JALANKAN APLIKASI
  // ============================================================
  isiForm(kunciAktif);
  $(".app").hide().fadeIn(500); // satu animasi masuk saat halaman dibuka
});
