"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { createClient } from "../../../../utils/supabase/client";
import styles from "../../dashboard.module.css";

interface MaterialFormInputs {
  title: string;
  type: "video" | "document" | "interactive" | "image";
  content_url: string;
  description?: string;
  order_index?: number;
}

async function uploadMaterialApi(data: MaterialFormInputs) {
  const supabase = createClient();
  
  const { data: material, error } = await supabase
    .from("materials")
    .insert([
      {
        title: data.title,
        type: data.type,
        content_url: data.content_url,
        description: data.description,
        order_index: data.order_index || 0,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return material;
}

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<MaterialFormInputs[]>([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MaterialFormInputs>({
    defaultValues: { type: "video", order_index: 0 },
  });
  const mutation = useMutation({
    mutationFn: uploadMaterialApi,
    onSuccess: (data) => {
      setMaterials((prev) => [...prev, data]);
      reset();
      alert("Material uploaded successfully!");
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
        <button
          className={styles.formButton}
          onClick={() => window.location.href = "/dashboard/admin/materials/list"}
          style={{ maxWidth: "200px", margin: "1rem auto" }}
        >
          View All Materials
        </button>
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

            <label className={styles.label}>Order Index</label>
            <input className={styles.formField} type="number" {...register("order_index", { valueAsNumber: true })} />

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
