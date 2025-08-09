import Header from "../components/Header";
import styles from "./evaluasi.module.css";

export default function EvaluasiPage() {
  return (
    <>
      <Header />
      
      {/* Page header */}
      <section className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.pageTitle}>Evaluasi</h1>
          <p className={styles.pageSubtitle}>Tes Evaluasi Pembelajaran Barisan dan Deret Aritmatika dan Geometri</p>
        </div>
      </section>
      
      {/* Page content with evaluation viewer */}
      <section className={styles.pageContent}>
        <div className="container">
          <div className={styles.evaluationContainer}>
            <div className={styles.evaluationToolbar}>
              <div className={styles.evaluationInfo}>
                <div className={styles.evaluationIcon}>TEST</div>
                <div className={styles.evaluationTitle}>Evaluasi Akhir - Barisan dan Deret.pdf</div>
              </div>
              <div className={styles.evaluationActions}>
                <button className={styles.evaluationBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Unduh
                </button>
                <button className={`${styles.evaluationBtn} ${styles.primary}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4"></path>
                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                  </svg>
                  Mulai Evaluasi
                </button>
              </div>
            </div>
            <div className={styles.evaluationContent}>
              <div className={styles.evaluationPage}>
                <h1 className={styles.moduleTitle}>EVALUASI PEMBELAJARAN</h1>
                <h2 className={styles.moduleSubtitle}>BARISAN DAN DERET ARITMATIKA DAN GEOMETRI</h2>
                
                {/* University logo */}
                <svg className={styles.universityLogo} viewBox="0 0 200 200" fill="none">
                  <circle cx="100" cy="100" r="90" stroke="black" strokeWidth="2" fill="none"/>
                  <path d="M100 30C60 30 30 60 30 100C30 140 60 170 100 170C140 170 170 140 170 100C170 60 140 30 100 30Z" stroke="black" strokeWidth="2" fill="none"/>
                  <text x="100" y="105" fontSize="12" textAnchor="middle" fontWeight="bold">UNIVERSITAS</text>
                  <text x="100" y="120" fontSize="12" textAnchor="middle" fontWeight="bold">MUHAMMADIYAH</text>
                  <text x="100" y="135" fontSize="12" textAnchor="middle" fontWeight="bold">PURWOKERTO</text>
                  <circle cx="100" cy="80" r="20" stroke="black" strokeWidth="2" fill="none"/>
                  <path d="M90 80 L110 80" stroke="black" strokeWidth="2"/>
                  <path d="M100 70 L100 90" stroke="black" strokeWidth="2"/>
                </svg>
                
                <div className={styles.authorSection}>
                  <p className={styles.authorLabel}>PENYUSUN</p>
                  <p>Idhata Nurbaiti, S.Pd</p>
                </div>
                
                <p className={styles.universityName}>UNIVERSITAS MUHAMMADIYAH PURWOKERTO</p>
                <p className={styles.degreeProgram}>MAGISTER PENDIDIKAN MATEMATIKA</p>
                <p className={styles.year}>2024</p>
                
                <div className={styles.contentSection}>
                  <h3 className={styles.sectionTitle}>Petunjuk Pengerjaan</h3>
                  <div className={styles.instructionContainer}>
                    <div className={styles.instructionItem}>
                      <span className={styles.instructionNumber}>1</span>
                      <p>Bacalah setiap soal dengan teliti sebelum menjawab</p>
                    </div>
                    <div className={styles.instructionItem}>
                      <span className={styles.instructionNumber}>2</span>
                      <p>Pilih jawaban yang paling tepat untuk setiap soal</p>
                    </div>
                    <div className={styles.instructionItem}>
                      <span className={styles.instructionNumber}>3</span>
                      <p>Waktu pengerjaan: 90 menit</p>
                    </div>
                    <div className={styles.instructionItem}>
                      <span className={styles.instructionNumber}>4</span>
                      <p>Jumlah soal: 25 soal pilihan ganda</p>
                    </div>
                  </div>
                  
                  <h3 className={styles.sectionTitle}>Informasi Evaluasi</h3>
                  <div className={styles.evaluationInfo}>
                    <div className={styles.infoCard}>
                      <div className={styles.infoIcon}>⏱️</div>
                      <div className={styles.infoContent}>
                        <h4>Durasi</h4>
                        <p>90 Menit</p>
                      </div>
                    </div>
                    <div className={styles.infoCard}>
                      <div className={styles.infoIcon}>📝</div>
                      <div className={styles.infoContent}>
                        <h4>Jumlah Soal</h4>
                        <p>25 Soal</p>
                      </div>
                    </div>
                    <div className={styles.infoCard}>
                      <div className={styles.infoIcon}>🎯</div>
                      <div className={styles.infoContent}>
                        <h4>Passing Grade</h4>
                        <p>70 Poin</p>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className={styles.sectionTitle}>Materi yang Akan Diujikan</h3>
                  <div className={styles.topicsList}>
                    <div className={styles.topicItem}>
                      <span className={styles.topicBadge}>Aljabar</span>
                      <p>Barisan dan Deret Aritmatika</p>
                    </div>
                    <div className={styles.topicItem}>
                      <span className={styles.topicBadge}>Aljabar</span>
                      <p>Barisan dan Deret Geometri</p>
                    </div>
                    <div className={styles.topicItem}>
                      <span className={styles.topicBadge}>Pola</span>
                      <p>Pola Bilangan dan Rumus Umum</p>
                    </div>
                    <div className={styles.topicItem}>
                      <span className={styles.topicBadge}>Aplikasi</span>
                      <p>Penerapan dalam Kehidupan Sehari-hari</p>
                    </div>
                  </div>
                  
                  <div className={styles.warningBox}>
                    <div className={styles.warningIcon}>⚠️</div>
                    <div className={styles.warningContent}>
                      <h4>Perhatian!</h4>
                      <p>Pastikan koneksi internet stabil selama mengerjakan evaluasi. Jawaban akan tersimpan otomatis setiap 30 detik.</p>
                    </div>
                  </div>
                  
                  <div className={styles.startSection}>
                    <h3 className={styles.sectionTitle}>Siap Memulai?</h3>
                    <p className={styles.startDescription}>
                      Setelah membaca semua petunjuk di atas, klik tombol &quot;Mulai Evaluasi&quot; untuk memulai tes. 
                      Pastikan Anda sudah mempersiapkan diri dengan baik.
                    </p>
                    <button className={styles.startButton}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      Mulai Evaluasi Sekarang
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={styles.evaluationNavigation}>
                <button className={styles.evaluationBtn}>◄ Sebelumnya</button>
                <button className={styles.evaluationBtn}>Halaman 1 dari 3</button>
                <button className={styles.evaluationBtn}>Selanjutnya ►</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
