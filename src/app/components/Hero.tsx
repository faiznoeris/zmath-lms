import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Selamat Datang di{" "}
            <span className={styles.highlight}>Zona Matematika</span>
          </h1>
          <p className={styles.subtitle}>
            Pelajari Barisan dan Deret Aritmatika dan Geometri dengan mudah dan
            menyenangkan
          </p>
          <div className={styles.cta}>
            <button className={styles.primaryButton}>Mulai Belajar</button>
            <button className={styles.secondaryButton}>Lihat Materi</button>
          </div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.placeholder}>📚 Matematika</div>
        </div>
      </div>
    </section>
  );
}
