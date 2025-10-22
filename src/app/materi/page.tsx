import styles from "./materi.module.css";

export default function MateriPage() {
  return (
    <>
      {/* Page header */}
      <section className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.pageTitle}>Materi</h1>
          <p className={styles.pageSubtitle}>
            Barisan dan Deret Aritmatika dan Geometri
          </p>
        </div>
      </section>

      {/* Page content with PDF viewer */}
      <section className={styles.pageContent}>
        <div className="container">
          <div className={styles.pdfContainer}>
            <div className={styles.pdfToolbar}>
              <div className={styles.pdfInfo}>
                <div className={styles.pdfIcon}>PDF</div>
                <div className={styles.pdfTitle}>
                  Modul Barisan dan Deret Geometri.pdf
                </div>
              </div>
              <div className={styles.pdfActions}>
                <button className={styles.pdfBtn}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Unduh
                </button>
                <button className={`${styles.pdfBtn} ${styles.primary}`}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Buka PDF
                </button>
              </div>
            </div>
            <div className={styles.pdfContent}>
              <div className={styles.pdfPage}>
                <h1 className={styles.moduleTitle}>MODUL MATEMATIKA</h1>
                <h2 className={styles.moduleSubtitle}>
                  BARISAN DAN DERET GEOMETRI
                </h2>

                {/* University logo */}
                <svg
                  className={styles.universityLogo}
                  viewBox="0 0 200 200"
                  fill="none"
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke="black"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M100 30C60 30 30 60 30 100C30 140 60 170 100 170C140 170 170 140 170 100C170 60 140 30 100 30Z"
                    stroke="black"
                    strokeWidth="2"
                    fill="none"
                  />
                  <text
                    x="100"
                    y="105"
                    fontSize="12"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    UNIVERSITAS
                  </text>
                  <text
                    x="100"
                    y="120"
                    fontSize="12"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    MUHAMMADIYAH
                  </text>
                  <text
                    x="100"
                    y="135"
                    fontSize="12"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    PURWOKERTO
                  </text>
                  <circle
                    cx="100"
                    cy="80"
                    r="20"
                    stroke="black"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path d="M90 80 L110 80" stroke="black" strokeWidth="2" />
                  <path d="M100 70 L100 90" stroke="black" strokeWidth="2" />
                </svg>

                <div className={styles.authorSection}>
                  <p className={styles.authorLabel}>PENULIS</p>
                  <p>Idhata Nurbaiti, S.Pd</p>
                </div>

                <p className={styles.universityName}>
                  UNIVERSITAS MUHAMMADIYAH PURWOKERTO
                </p>
                <p className={styles.degreeProgram}>
                  MAGISTER PENDIDIKAN MATEMATIKA
                </p>
                <p className={styles.year}>2024</p>

                <div className={styles.contentSection}>
                  <h3 className={styles.sectionTitle}>Barisan Bilangan</h3>
                  <p className={styles.contentParagraph}>
                    Perhatikan ilustrasi di bawah ini
                  </p>

                  <div className={styles.illustrationContainer}>
                    <div className={styles.imageContainer}>
                      <div className={styles.fruitImage}>🍊</div>
                      <div className={styles.fruitImage}>🍊</div>
                      <div className={styles.fruitImage}>🍊</div>
                    </div>

                    <div className={styles.textContainer}>
                      <p>
                        Seorang pedagang buah menata dagangannya secara bersusun
                        menyerupai piramida. Baris paling bawah (pertama) diisi
                        30 jeruk, kemudian baris ke-2 (di atasnya) berisi 28
                        jeruk, baris di atasnya lagi 26 jeruk, begitu
                        seterusnya.
                      </p>
                      <p>
                        Dapatkah kalian menentukan berapa banyak jeruk pada
                        baris ke-15? Untuk lebih jelasnya mari kita belajar
                        tentang Barisan Aritmetika. Agar kita lebih mudah
                        memahami pengertian barisan bilangan, maka perhatikan
                        contoh urutan bilangan berikut:
                      </p>
                    </div>
                  </div>

                  <p>a) 1, 2, 3, 4, 5, ... a) 1, 3, 5, 7, 9, ...</p>
                  <p>b) 2, 5, 8, 11, ... b) 18, 4, 17, 16, 23, ...</p>

                  <p>
                    Pada contoh a) <i>U₁ + U₂ + U₃ + U₄ + ... + Uₙ</i> atau
                    dituliskan dengan <i>aⁿ + aⁿ + aⁿ + aⁿ + ... + aⁿ</i>
                  </p>

                  <p>
                    Contoh a) 1, 2, 3, 5, 8, 11, ... mempunyai aturan tertentuya
                    adalah bilangan 2, 5, 8, 11, ... mempunyai aturan tertentu
                    yaitu Un = Un-1 + 3. Bilangan pada contoh c) dan d) tidak
                    mempunyai aturan tertentu, sehingga bukan merupakan suatu
                    barisan bilangan.
                  </p>

                  <p>Bentuk umum barisan bilangan dapat dinyatakan dengan:</p>
                  <p className={styles.mathFormula}>U₁, U₂, U₃, ..., Uₙ,</p>

                  <div className={styles.formulaContainer}>
                    <div>
                      <p>Dengan: U1 = suku ke - 1</p>
                      <p>U2 = suku ke - 2</p>
                      <p>U3 = suku ke - 3</p>
                      <p style={{ marginTop: "0.5rem" }}>
                        Un = suku ke - n (suku ke-n barisan bilangan)
                      </p>
                    </div>

                    <div className={styles.thinkingIcon}>🤔</div>
                  </div>

                  <h3 className={styles.sectionTitle}>Pola Bilangan</h3>
                  <p className={styles.contentParagraph}>
                    Pola bilangan adalah susunan angka atau bilangan yang
                    mengikuti aturan tertentu. Pola ini bisa berupa penambahan,
                    pengurangan, perkalian, pembagian, atau bentuk lainnya.
                  </p>

                  <table className={styles.exampleTable}>
                    <thead>
                      <tr>
                        <th>Jenis Pola</th>
                        <th>Ciri-ciri</th>
                        <th>Contoh</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Aritmetika</td>
                        <td>Beda tetap (penambahan/pengurangan)</td>
                        <td>2, 4, 6, 8, 10,... (beda = 2)</td>
                      </tr>
                      <tr>
                        <td>Geometri</td>
                        <td>Rasio tetap (perkalian)</td>
                        <td>3, 6, 12, 24,... (rasio = 2)</td>
                      </tr>
                      <tr>
                        <td>Kuadrat</td>
                        <td>Bilangan hasil pangkat dua</td>
                        <td>1, 4, 9, 16, 25,...</td>
                      </tr>
                      <tr>
                        <td>Segitiga</td>
                        <td>Penjumlahan bertingkat</td>
                        <td>1, 3, 6, 10, 15,...</td>
                      </tr>
                      <tr>
                        <td>Ganjil</td>
                        <td>Pola bilangan ganjil</td>
                        <td>1, 3, 5, 7, 9,...</td>
                      </tr>
                      <tr>
                        <td>Genap</td>
                        <td>Pola bilangan genap</td>
                        <td>2, 4, 6, 8, 10,...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.pdfNavigation}>
                <button className={styles.pdfBtn}>◄ Sebelumnya</button>
                <button className={styles.pdfBtn}>Halaman 1 dari 10</button>
                <button className={styles.pdfBtn}>Selanjutnya ►</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
