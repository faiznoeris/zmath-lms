"use client";

import { useState } from "react";
import styles from "./Header.module.css";

export default function Header() {
  const [isMateriOpen, setIsMateriOpen] = useState(false);
  const [isLatihanOpen, setIsLatihanOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.headerContent}>
          {/* Logo */}
          <div className={styles.logo}>
            <a href="/" className={styles.logoText}>
              ZMATH
            </a>
          </div>

          {/* Navigation */}
          <nav className={styles.nav}>
            <a href="/" className={styles.navLink}>
              Beranda
            </a>

            <a href="/petunjuk" className={styles.navLink}>
              Petunjuk
            </a>

            <div
              className={styles.dropdown}
              onMouseEnter={() => setIsMateriOpen(true)}
              onMouseLeave={() => setIsMateriOpen(false)}
            >
              <button className={styles.dropdownButton}>
                Materi
                <svg
                  className={styles.chevronDown}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {isMateriOpen && (
                <div className={styles.dropdownContent}>
                  <div className={styles.dropdownContainer}>
                    <div className={styles.dropdownColumn}>
                      <h4 className={styles.dropdownHeader}>Aljabar</h4>
                      <ul className={styles.dropdownItems}>
                        <li>
                          <a href="/materi" className={styles.dropdownItem}>
                            Barisan dan Deret
                          </a>
                        </li>
                        <li>
                          <a href="#" className={styles.dropdownItem}>
                            Persamaan Kuadrat
                          </a>
                        </li>
                        <li>
                          <a href="#" className={styles.dropdownItem}>
                            Fungsi
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className={styles.dropdownColumn}>
                      <h4 className={styles.dropdownHeader}>Geometri</h4>
                      <ul className={styles.dropdownItems}>
                        <li>
                          <a href="#" className={styles.dropdownItem}>
                            Bangun Datar
                          </a>
                        </li>
                        <li>
                          <a href="#" className={styles.dropdownItem}>
                            Bangun Ruang
                          </a>
                        </li>
                        <li>
                          <a href="#" className={styles.dropdownItem}>
                            Trigonometri
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className={styles.dropdownColumn}>
                      <h4 className={styles.dropdownHeader}>Kalkulus</h4>
                      <ul className={styles.dropdownItems}>
                        <li>
                          <a href="#" className={styles.dropdownItem}>
                            Limit Fungsi
                          </a>
                        </li>
                        <li>
                          <a href="#" className={styles.dropdownItem}>
                            Turunan
                          </a>
                        </li>
                        <li>
                          <a href="#" className={styles.dropdownItem}>
                            Integral
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              className={styles.dropdown}
              onMouseEnter={() => setIsLatihanOpen(true)}
              onMouseLeave={() => setIsLatihanOpen(false)}
            >
              <button className={styles.dropdownButton}>
                Latihan Soal
                <svg
                  className={styles.chevronDown}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {isLatihanOpen && (
                <div className={styles.dropdownContent}>
                  <div className={styles.dropdownContainer}>
                    <div className={styles.dropdownColumn}>
                      <h4 className={styles.dropdownHeader}>
                        Berdasarkan Tingkat
                      </h4>
                      <ul className={styles.dropdownItems}>
                        <li>
                          <a href="/latihan-soal" className={styles.dropdownItem}>
                            Soal Mudah
                          </a>
                        </li>
                        <li>
                          <a href="#" className={styles.dropdownItem}>
                            Soal Menengah
                          </a>
                        </li>
                        <li>
                          <a href="#" className={styles.dropdownItem}>
                            Soal Sulit
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className={styles.dropdownColumn}>
                      <h4 className={styles.dropdownHeader}>
                        Berdasarkan Topik
                      </h4>
                      <ul className={styles.dropdownItems}>
                        <li>
                          <a href="#" className={styles.dropdownItem}>
                            Aljabar
                          </a>
                        </li>
                        <li>
                          <a href="#" className={styles.dropdownItem}>
                            Geometri
                          </a>
                        </li>
                        <li>
                          <a href="#" className={styles.dropdownItem}>
                            Kalkulus
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <a href="/evaluasi" className={styles.navLink}>
              Evaluasi
            </a>

            <a href="/referensi" className={styles.navLink}>
              Referensi
            </a>

            <a href="/hubungi-kami" className={styles.navLink}>
              Hubungi Kami
            </a>
          </nav>

          {/* Search */}
          <div className={styles.search}>
            <input
              type="text"
              placeholder="Ketik sesuatu..."
              className={styles.searchInput}
            />
            <button className={styles.searchButton}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
