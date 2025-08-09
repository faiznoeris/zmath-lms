import Image from "next/image";
import Header from "../components/Header";
import styles from "./referensi.module.css";

export default function ReferensiPage() {
  const books = [
    {
      id: 1,
      title: "Matematika Dasar untuk SMA",
      author: "Prof. Dr. Ahmad Wijaya",
      description: "Buku ini mencakup semua materi matematika dasar yang diperlukan untuk siswa SMA. Dengan contoh dan latihan soal yang komprehensif.",
      image: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FsY3VsdXMlMjBib29rfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60"
    },
    {
      id: 2,
      title: "Aljabar Linier & Matriks",
      author: "Dr. Siti Rahayu",
      description: "Membahas konsep-konsep aljabar linier dan matriks dengan pendekatan yang mudah dipahami untuk siswa SMA dan mahasiswa tingkat awal.",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWF0aHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60"
    },
    {
      id: 3,
      title: "Geometri dan Trigonometri",
      author: "Dr. Budi Santoso",
      description: "Panduan lengkap untuk memahami konsep geometri dan trigonometri dengan ilustrasi visual yang jelas dan contoh aplikasi dalam kehidupan nyata.",
      image: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z2VvbWV0cnl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60"
    },
    {
      id: 4,
      title: "Kalkulus Dasar & Lanjutan",
      author: "Prof. Hendra Wijaya, Ph.D",
      description: "Buku ini menjelaskan konsep dasar hingga lanjutan dalam kalkulus diferensial dan integral dengan pendekatan yang sistematis dan mudah dipahami.",
      image: "https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FsY3VsdXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60"
    },
    {
      id: 5,
      title: "Statistika dan Probabilitas",
      author: "Dr. Maya Indrawati",
      description: "Membahas konsep dasar statistika dan probabilitas dengan aplikasi praktis dalam kehidupan sehari-hari dan penelitian.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60"
    },
    {
      id: 6,
      title: "Matematika Diskrit",
      author: "Prof. Dr. Eko Prasetyo",
      description: "Pengantar komprehensif tentang matematika diskrit, termasuk teori graf, kombinatorik, dan logika matematika.",
      image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60"
    }
  ];

  return (
    <>
      <Header />
      
      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>Referensi</h1>
        </div>
        
        <div className={styles.referencesGrid}>
          {books.map((book) => (
            <div key={book.id} className={styles.referenceCard}>
              <div className={styles.bookCover}>
                <Image 
                  src={book.image} 
                  alt={book.title}
                  width={600}
                  height={300}
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>{book.title}</h3>
                <p className={styles.bookAuthor}>oleh {book.author}</p>
                <p className={styles.bookDescription}>{book.description}</p>
                <a href="#" className={styles.viewButton}>Lihat Buku</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
