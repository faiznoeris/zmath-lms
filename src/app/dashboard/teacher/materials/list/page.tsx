"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../../../../../utils/supabase/client";
import styles from "../../../dashboard.module.css";

interface Material {
  id: number;
  title: string;
  type: "video" | "document" | "interactive" | "image";
  content_url: string;
  description?: string;
  lesson_id?: number;
  order_index: number;
  created_at: string;
}

// Supabase API calls
async function fetchMaterialsApi(): Promise<Material[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

async function deleteMaterialApi(id: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("materials")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

async function updateMaterialApi(material: Material) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("materials")
    .update({
      title: material.title,
      type: material.type,
      content_url: material.content_url,
      description: material.description,
      order_index: material.order_index,
    })
    .eq("id", material.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export default function MaterialsListPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Material>>({});

  const { data: materials, isLoading, error, isError } = useQuery({
    queryKey: ["materials"],
    queryFn: fetchMaterialsApi,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMaterialApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      alert("Material deleted successfully!");
    },
    onError: (error: Error) => {
      alert(`Error deleting material: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateMaterialApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      setEditingId(null);
      setEditForm({});
      alert("Material updated successfully!");
    },
    onError: (error: Error) => {
      alert(`Error updating material: ${error.message}`);
    },
  });

  const handleEdit = (material: Material) => {
    setEditingId(material.id);
    setEditForm(material);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = () => {
    if (editingId && editForm) {
      updateMutation.mutate(editForm as Material);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this material?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>Loading materials...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.dashboardContainer}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ color: "#d32f2f", marginBottom: "1rem" }}>
            Error loading materials: {error instanceof Error ? error.message : "Unknown error"}
          </div>
          <button
            className={styles.formButton}
            onClick={() => queryClient.invalidateQueries({ queryKey: ["materials"] })}
            style={{ maxWidth: "200px", margin: "0 auto" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Materials List</h1>
        <p className={styles.subtitle}>View, edit, and manage all materials.</p>
        <button
          className={styles.formButton}
          onClick={() => window.location.href = "/dashboard/admin/materials"}
          style={{ maxWidth: "200px", margin: "1rem auto" }}
        >
          + Add New Material
        </button>
      </header>
      <main className={styles.main}>
        <section className={styles.section}>
          {!materials || materials.length === 0 ? (
            <div style={{ textAlign: "center", color: "#888" }}>
              No materials found. Create your first material!
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Content URL</th>
                    <th>Order</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => (
                    <tr key={material.id}>
                      {editingId === material.id ? (
                        <>
                          <td>{material.id}</td>
                          <td>
                            <input
                              className={styles.formField}
                              value={editForm.title || ""}
                              onChange={(e) =>
                                setEditForm({ ...editForm, title: e.target.value })
                              }
                              style={{ margin: 0, minWidth: "150px" }}
                            />
                          </td>
                          <td>
                            <select
                              className={styles.formField}
                              value={editForm.type || "video"}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  type: e.target.value as Material["type"],
                                })
                              }
                              style={{ margin: 0 }}
                            >
                              <option value="video">Video</option>
                              <option value="document">Document</option>
                              <option value="interactive">Interactive</option>
                              <option value="image">Image</option>
                            </select>
                          </td>
                          <td>
                            <input
                              className={styles.formField}
                              value={editForm.description || ""}
                              onChange={(e) =>
                                setEditForm({ ...editForm, description: e.target.value })
                              }
                              style={{ margin: 0, minWidth: "200px" }}
                            />
                          </td>
                          <td>
                            <input
                              className={styles.formField}
                              value={editForm.content_url || ""}
                              onChange={(e) =>
                                setEditForm({ ...editForm, content_url: e.target.value })
                              }
                              style={{ margin: 0, minWidth: "200px" }}
                            />
                          </td>
                          <td>
                            <input
                              className={styles.formField}
                              type="number"
                              value={editForm.order_index || 0}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  order_index: parseInt(e.target.value),
                                })
                              }
                              style={{ margin: 0, width: "60px" }}
                            />
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                className={styles.formButton}
                                onClick={handleSaveEdit}
                                disabled={updateMutation.isPending}
                                style={{
                                  padding: "0.5rem 1rem",
                                  fontSize: "0.9rem",
                                  margin: 0,
                                }}
                              >
                                Save
                              </button>
                              <button
                                className={styles.formButton}
                                onClick={handleCancelEdit}
                                style={{
                                  padding: "0.5rem 1rem",
                                  fontSize: "0.9rem",
                                  margin: 0,
                                  background: "#757575",
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{material.id}</td>
                          <td>{material.title}</td>
                          <td>
                            <span className={styles.badge} data-type={material.type}>
                              {material.type}
                            </span>
                          </td>
                          <td>{material.description || "-"}</td>
                          <td>
                            <a
                              href={material.content_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#3949ab", textDecoration: "none" }}
                            >
                              View
                            </a>
                          </td>
                          <td>{material.order_index}</td>
                          <td>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                className={styles.formButton}
                                onClick={() => handleEdit(material)}
                                style={{
                                  padding: "0.5rem 1rem",
                                  fontSize: "0.9rem",
                                  margin: 0,
                                  background: "#3949ab",
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className={styles.formButton}
                                onClick={() => handleDelete(material.id)}
                                disabled={deleteMutation.isPending}
                                style={{
                                  padding: "0.5rem 1rem",
                                  fontSize: "0.9rem",
                                  margin: 0,
                                  background: "#d32f2f",
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
