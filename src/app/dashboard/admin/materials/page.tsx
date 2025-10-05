"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import styles from "../../dashboard.module.css";

interface MaterialFormInputs {
  title: string;
  type: "video" | "document" | "interactive" | "image";
  content_url: string;
  description?: string;
}

// Simulate API call
async function uploadMaterialApi(data: MaterialFormInputs) {
  await new Promise((res) => setTimeout(res, 1000));
  return { id: Math.random().toString(36).slice(2), ...data };
}

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<MaterialFormInputs[]>([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MaterialFormInputs>({
    defaultValues: { type: "video" },
  });
  const mutation = useMutation({
    mutationFn: uploadMaterialApi,
    onSuccess: (data) => {
      setMaterials((prev) => [...prev, data]);
      reset();
    },
  });

  const onSubmit = (data: MaterialFormInputs) => {
    mutation.mutate(data);
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Manage Materials</h1>
        <p className={styles.subtitle}>Upload new materials or edit existing ones.</p>
      </header>
      <main className={styles.main}>
        <section className={styles.section}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <label className={styles.label}>Title</label>
            <input className={styles.formField} {...register("title", { required: "Title is required" })} />
            {errors.title && <div className={styles.error}>{errors.title.message}</div>}

            <label className={styles.label}>Type</label>
            <select className={styles.formField} {...register("type")}> 
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="interactive">Interactive</option>
              <option value="image">Image</option>
            </select>

            <label className={styles.label}>Content URL</label>
            <input className={styles.formField} {...register("content_url", { required: "Content URL is required" })} />
            {errors.content_url && <div className={styles.error}>{errors.content_url.message}</div>}

            <label className={styles.label}>Description</label>
            <textarea className={styles.formField} {...register("description")} />

            {mutation.isError && mutation.error instanceof Error && (
              <div className={styles.error}>{mutation.error.message}</div>
            )}
            <button className={styles.formButton} type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Uploading..." : "Upload Material"}
            </button>
          </form>
        </section>
        <section className={styles.section}>
          <h3>Uploaded Materials</h3>
          {materials.length === 0 ? (
            <div style={{color: '#888', textAlign: 'center'}}>No materials uploaded yet.</div>
          ) : (
            <ul style={{listStyle: 'none', padding: 0}}>
              {materials.map((mat, idx) => (
                <li key={idx} style={{marginBottom: 18, borderBottom: '1px solid #eee', paddingBottom: 10}}>
                  <div><b>{mat.title}</b> <span style={{color:'#3949ab', fontSize:'0.95em'}}>({mat.type})</span></div>
                  <div style={{fontSize:'0.97em', color:'#555'}}>{mat.description}</div>
                  <div style={{fontSize:'0.95em', color:'#888'}}>URL: <a href={mat.content_url} target="_blank" rel="noopener noreferrer">{mat.content_url}</a></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
