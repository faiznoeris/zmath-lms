"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./hubungi-kami.module.css";
import Header from "../components/Header";

const HubungiKamiPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (formData.name && formData.email && formData.message) {
      alert("Terima kasih! Pesan Anda telah terkirim.");
      setFormData({ name: "", email: "", message: "" });
    } else {
      alert("Mohon lengkapi semua field.");
    }
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>Hubungi Kami</h1>
        </div>

        <div className={styles.contentGrid}>
          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <h2>Profil Pengembangan</h2>
            </div>
            <div className={styles.profileContent}>
              <div className={styles.profilePhoto}>
                <Image
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
                  alt="Foto Idhata Nurbaiti"
                  width={150}
                  height={180}
                  className={styles.profileImage}
                />
              </div>
              <div className={styles.profileInfo}>
                <h3 className={styles.profileName}>Idhata Nurbaiti</h3>
                <div className={styles.profileDetails}>
                  <p className={styles.detailItem}>
                    Lahir: Banyumas, 1 Juni 1993
                  </p>
                  <p className={styles.detailItem}>Pendidikan:</p>
                  <ul className={styles.educationList}>
                    <li className={styles.eduItem}>
                      1. TK <span>Diponogoro 49 Purwokerto</span>
                    </li>
                    <li className={styles.eduItem}>
                      2. SD Negeri 1 <span>Karang Klesem</span>
                    </li>
                    <li className={styles.eduItem}>
                      3. SMP Negeri 5 <span>Purwokerto</span>
                    </li>
                    <li className={styles.eduItem}>
                      4. SMA Negeri 1 Patikraja
                    </li>
                    <li className={styles.eduItem}>
                      5. Universitas Muh. <span>Purwoekrto</span>
                    </li>
                  </ul>

                  <div className={styles.mentorSection}>
                    <p className={styles.mentorTitle}>Dosen Pembimbing:</p>
                    <p>
                      <span className={styles.mentorName}>
                        Dr. Akhamd Jazuli M.Si
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <div className={styles.contactCard}>
            <div className={styles.contactHeader}>
              <h2>Hubungi Kami</h2>
            </div>
            <div className={styles.contactContent}>
              <div className={styles.contactOptions}>
                <Link href="#map" className={styles.contactOption}>
                  <i className="fas fa-map-marker-alt"></i>
                  <span className={styles.optionTitle}>Lihat Lokasi</span>
                  <span>Kunjungi kami</span>
                </Link>
                <Link href="#pesan" className={styles.contactOption}>
                  <i className="fas fa-envelope"></i>
                  <span className={styles.optionTitle}>Kirim Pesan</span>
                  <span>Hubungi via formulir</span>
                </Link>
                <Link
                  href="mailto:contact@zmath.id"
                  className={styles.contactOption}
                >
                  <i className="fas fa-at"></i>
                  <span className={styles.optionTitle}>Kirim Surel</span>
                  <span>contact@zmath.id</span>
                </Link>
                <Link href="#" className={styles.contactOption}>
                  <i className="fas fa-user-circle"></i>
                  <span className={styles.optionTitle}>Lihat Akun</span>
                  <span>Profil media sosial</span>
                </Link>
              </div>

              <div className={styles.contactForm} id="pesan">
                <form onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.formLabel}>
                      Nama
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={styles.formControl}
                      placeholder="Masukkan nama Anda"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.formLabel}>
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={styles.formControl}
                      placeholder="Masukkan email Anda"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="message" className={styles.formLabel}>
                      Pesan
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className={`${styles.formControl} ${styles.textarea}`}
                      placeholder="Tuliskan pesan Anda di sini..."
                    />
                  </div>
                  <button type="submit" className={styles.submitButton}>
                    Kirim Pesan
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className={styles.mapContainer} id="map">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.2738344603237!2d109.23596731477673!3d-7.431419594634039!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e655ea49d9f9885%3A0x62be0b6159700ec9!2sUniversitas%20Muhammadiyah%20Purwokerto!5e0!3m2!1sen!2sid!4v1633586919038!5m2!1sen!2sid"
            allowFullScreen
            loading="lazy"
            className={styles.mapIframe}
          />
        </div>

        {/* Social Media Icons */}
        <div className={styles.socialIcons}>
          <Link href="#" className={styles.socialIcon}>
            <i className="fab fa-facebook-f"></i>
          </Link>
          <Link href="#" className={styles.socialIcon}>
            <i className="fab fa-twitter"></i>
          </Link>
          <Link href="#" className={styles.socialIcon}>
            <i className="fab fa-instagram"></i>
          </Link>
          <Link href="#" className={styles.socialIcon}>
            <i className="fab fa-youtube"></i>
          </Link>
          <Link href="#" className={styles.socialIcon}>
            <i className="fab fa-linkedin-in"></i>
          </Link>
        </div>
      </div>
    </>
  );
};

export default HubungiKamiPage;
