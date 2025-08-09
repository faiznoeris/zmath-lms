"use client";

import { useState } from "react";
import Header from "../components/Header";
import styles from "./latihan-soal.module.css";

export default function LatihanSoalPage() {
  const [showPreview, setShowPreview] = useState(false);

  const handleStartClick = () => {
    setShowPreview(true);
  };

  const handleBackClick = () => {
    setShowPreview(false);
  };

  const handleStartTest = () => {
    alert('Ujian akan dimulai!');
    // Add logic to start the actual test
  };

  return (
    <>
      <Header />
      
      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>LATIHAN SOAL</h1>
        </div>
        
        <div className={styles.instructionContainer}>
          <div className={styles.instruction}>
            <p>Berdoalah sebelum memulai Latihan soal</p>
          </div>
          <div className={styles.instruction}>
            <p>Siapkan kertas alat tulis lainnya untuk melakukan perhitungan</p>
          </div>
          <div className={styles.instruction}>
            <p>Fokus dan konsentrasi selama mengerjakan soal</p>
          </div>
          <div className={styles.instruction}>
            <p>Kerjakan soal - soal berikut sesuai dengan kemampuan Anda</p>
          </div>
          <div className={styles.instruction}>
            <p>Latihan Soal berbentuk pilihan ganda</p>
          </div>
        </div>
        
        {!showPreview && (
          <>
            <button className={styles.actionButton} onClick={handleStartClick}>
              Mulai Mengerjakan
            </button>
            
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Pengerjaan Ke-</th>
                  <th>Jenis Soal</th>
                  <th>Nilai</th>
                  <th>Waktu yang tersisa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Latihan Soal</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Coba Lagi</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Latihan Soal</td>
                  <td>85</td>
                  <td>5 menit</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>Coba Lagi</td>
                  <td>92</td>
                  <td>3 menit</td>
                </tr>
              </tbody>
            </table>
          </>
        )}
        
        {showPreview && (
          <div className={styles.previewContainer}>
            <div className={styles.previewHeading}>
              <h2>Preview Latihan Soal</h2>
              <p>Waktu: 30 menit</p>
            </div>
            
            <div className={styles.question}>
              <h3>Soal 1</h3>
              <p>Jika x + y = 8 dan xy = 15, berapakah nilai dari x² + y²?</p>
              <div className={styles.options}>
                <label className={styles.option}>
                  <input type="radio" name="q1" value="a" /> a) 34
                </label>
                <label className={styles.option}>
                  <input type="radio" name="q1" value="b" /> b) 49
                </label>
                <label className={styles.option}>
                  <input type="radio" name="q1" value="c" /> c) 64
                </label>
                <label className={styles.option}>
                  <input type="radio" name="q1" value="d" /> d) 94
                </label>
              </div>
            </div>
            
            <div className={styles.question}>
              <h3>Soal 2</h3>
              <p>Sebuah bola dilempar ke atas dengan kecepatan awal 20 m/s. Jika percepatan gravitasi adalah 10 m/s², berapa ketinggian maksimum yang dicapai bola tersebut?</p>
              <div className={styles.options}>
                <label className={styles.option}>
                  <input type="radio" name="q2" value="a" /> a) 10 meter
                </label>
                <label className={styles.option}>
                  <input type="radio" name="q2" value="b" /> b) 20 meter
                </label>
                <label className={styles.option}>
                  <input type="radio" name="q2" value="c" /> c) 30 meter
                </label>
                <label className={styles.option}>
                  <input type="radio" name="q2" value="d" /> d) 40 meter
                </label>
              </div>
            </div>
            
            <div className={styles.controls}>
              <button className={styles.secondaryButton} onClick={handleBackClick}>
                Kembali
              </button>
              <button className={styles.actionButton} onClick={handleStartTest}>
                Mulai Ujian
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
