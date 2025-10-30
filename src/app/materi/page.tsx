"use client";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { createClient } from "../../utils/supabase/client";
import styles from "./materi.module.css";

interface Material {
  id: number;
  title: string;
  type: "video" | "document" | "interactive" | "image";
  content_url: string;
  description?: string;
  order_index: number;
  created_at: string;
}

async function fetchMaterialsApi(materialId?: string): Promise<Material[]> {
  const supabase = createClient();
  let query = supabase
    .from("materials")
    .select("*")
    .order("order_index", { ascending: true });
  
  // If materialId is provided, filter by it
  if (materialId) {
    query = query.eq("id", materialId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export default function MateriPage() {
  const searchParams = useSearchParams();
  const materialId = searchParams.get("id");

  const { data: materials, isLoading, error } = useQuery({
    queryKey: ["materials-public", materialId],
    queryFn: () => fetchMaterialsApi(materialId || undefined),
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return "🎥";
      case "document":
        return "📄";
      case "interactive":
        return "🎮";
      case "image":
        return "🖼️";
      default:
        return "📁";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "video":
        return "Video";
      case "document":
        return "Dokumen";
      case "interactive":
        return "Interaktif";
      case "image":
        return "Gambar";
      default:
        return "File";
    }
  };

  return (
    <>
      {/* Page header */}
      <section className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.pageTitle}>Materi</h1>
          <p className={styles.pageSubtitle}>
            Materi Pembelajaran Matematika
          </p>
        </div>
      </section>

      {/* Page content */}
      <section className={styles.pageContent}>
        <div className="container">
          {isLoading && (
            <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
              Memuat materi...
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <div style={{ color: "#d32f2f", marginBottom: "1rem" }}>
                Error: {error instanceof Error ? error.message : "Gagal memuat materi"}
              </div>
            </div>
          )}

          {materials && materials.length === 0 && !isLoading && (
            <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
              Belum ada materi tersedia.
            </div>
          )}

          {materials && materials.length > 0 && (
            <div className={styles.materialsGrid}>
              {materials.map((material) => (
                <div key={material.id} className={styles.pdfContainer}>
                  <div className={styles.pdfToolbar}>
                    <div className={styles.pdfInfo}>
                      <div className={styles.pdfIcon}>{getTypeIcon(material.type)}</div>
                      <div className={styles.pdfTitle}>
                        {material.title}
                      </div>
                    </div>
                    <div className={styles.pdfActions}>
                      <button 
                        className={styles.pdfBtn}
                        onClick={() => window.open(material.content_url, '_blank')}
                      >
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
                      <button 
                        className={`${styles.pdfBtn} ${styles.primary}`}
                        onClick={() => window.open(material.content_url, '_blank')}
                      >
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
                        Buka {getTypeLabel(material.type)}
                      </button>
                    </div>
                  </div>
                  {material.description && (
                    <div style={{ 
                      marginTop: "1rem", 
                      padding: "1rem", 
                      background: "#f5f5f5", 
                      borderRadius: "8px",
                      color: "#666"
                    }}>
                      {material.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
