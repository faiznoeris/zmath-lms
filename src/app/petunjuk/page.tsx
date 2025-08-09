import Header from "../components/Header";
import styles from "./petunjuk.module.css";

export default function PetunjukPage() {
  return (
    <>
      <Header />
      
      {/* Page header */}
      <section className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.pageTitle}>PETUNJUK</h1>
          <p className={styles.pageSubtitle}>Petunjuk Penggunaan Website</p>
        </div>
      </section>
      
      {/* Page content */}
      <section className={styles.pageContent}>
        <div className="container">
          <div className={styles.instructionsContainer}>
            <div className={styles.welcomeSection}>
              <p className={styles.welcomeText}>
                Jika Anda masih bingung dalam menggunakan website ini, silahkan klik tombol berikut untuk melihat panduan penggunaan website ini
              </p>
              <a href="#panduan-lengkap" className={styles.btn}>
                Lihat Panduan Lengkap
              </a>
            </div>
            
            <h2 className={styles.instructionsHeader}>
              Selamat datang di ZMATH. Berikut adalah petunjuk penggunaan untuk setiap menu
            </h2>
            <p className={styles.instructionsIntro}>
              Panduan ini akan membantu Anda memaksimalkan pengalaman belajar di ZMATH. Silakan pelajari setiap bagian untuk memahami fitur-fitur yang tersedia.
            </p>
            
            <div className={styles.instructionsList} id="panduan-lengkap">
              <div className={styles.instructionItem}>
                <div className={styles.instructionIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                <div className={styles.instructionContent}>
                  <h3 className={styles.instructionTitle}>Beranda</h3>
                  <p className={styles.instructionDescription}>
                    Kunjungi halaman ini untuk mendapatkan ringkasan terbaru, berita, dan akses cepat ke fitur-fitur utama.
                  </p>
                </div>
              </div>
              
              <div className={styles.instructionItem}>
                <div className={styles.instructionIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <div className={styles.instructionContent}>
                  <h3 className={styles.instructionTitle}>Petunjuk</h3>
                  <p className={styles.instructionDescription}>
                    Di menu ini, kamu akan menemukan panduan lengkap tentang cara menggunakan website ini dan memanfaatkan semua fitur yang tersedia.
                  </p>
                </div>
              </div>
              
              <div className={styles.instructionItem}>
                <div className={styles.instructionIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <div className={styles.instructionContent}>
                  <h3 className={styles.instructionTitle}>Materi</h3>
                  <p className={styles.instructionDescription}>
                    Kamu dapat mengakses materi pelajaran matematika yang terstruktur dan kontekstual untuk menuju konten yang lebih spesifik.
                  </p>
                </div>
              </div>
              
              <div className={styles.instructionItem}>
                <div className={styles.instructionIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <div className={styles.instructionContent}>
                  <h3 className={styles.instructionTitle}>Latihan Soal</h3>
                  <p className={styles.instructionDescription}>
                    Uji kemampuan kamu dengan berbagai latihan soal. Kamu dapat memilih soal berdasarkan tingkat kesulitan.
                  </p>
                </div>
              </div>
              
              <div className={styles.instructionItem}>
                <div className={styles.instructionIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div className={styles.instructionContent}>
                  <h3 className={styles.instructionTitle}>Evaluasi</h3>
                  <p className={styles.instructionDescription}>
                    Setelah belajar kamu akan melakukan evaluasi untuk mengukur kemajuan kamu. Halaman ini menyediakan tes yang sesuai dengan materi yang telah dipelajari.
                  </p>
                </div>
              </div>
              
              <div className={styles.instructionItem}>
                <div className={styles.instructionIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div className={styles.instructionContent}>
                  <h3 className={styles.instructionTitle}>Referensi</h3>
                  <p className={styles.instructionDescription}>
                    Temukan sumber tambahan dan materi pendukung yang dapat membantu memperdalam pemahaman kamu tentang topik tertentu.
                  </p>
                </div>
              </div>
              
              <div className={styles.instructionItem}>
                <div className={styles.instructionIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </div>
                <div className={styles.instructionContent}>
                  <h3 className={styles.instructionTitle}>Hubungi Kami</h3>
                  <p className={styles.instructionDescription}>
                    Jika kamu memiliki pertanyaan atau membutuhkan bantuan, silahkan kunjungi halaman ini untuk menghubungi TIM dukungan kami.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
