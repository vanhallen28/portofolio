"use client";
import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import type { L } from "@/lib/content/types";

/* Small, consistent form controls for the CMS. Every text a visitor reads is bilingual:
   LField shows Indonesian and English side by side so both get written together. */

export function Hint({ children }: { children?: ReactNode }) {
  return children ? <span className="adm-hint">{children}</span> : null;
}

function Counter({ value, max }: { value: string; max?: number }) {
  if (!max) return null;
  return <span className={`adm-count${value.length > max ? " is-over" : ""}`}>{value.length}/{max}</span>;
}

export function LField({
  label, value, onChange, multiline, rows = 3, hint, max, placeholder,
}: {
  label: string; value: L; onChange: (v: L) => void; multiline?: boolean; rows?: number; hint?: ReactNode; max?: number; placeholder?: L;
}) {
  const id = useId();
  const input = (lang: "id" | "en") => {
    const common = {
      id: `${id}-${lang}`, value: value[lang], lang,
      placeholder: placeholder?.[lang],
      "aria-label": `${label} (${lang === "id" ? "Indonesia" : "English"})`,
      "aria-invalid": max && value[lang].length > max ? true : undefined,
    };
    return multiline ? (
      <textarea className="adm-textarea" rows={rows} {...common} onChange={(e) => onChange({ ...value, [lang]: e.target.value })} />
    ) : (
      <input className="adm-input" type="text" {...common} onChange={(e) => onChange({ ...value, [lang]: e.target.value })} />
    );
  };
  return (
    <div className="adm-field" role="group" aria-labelledby={`${id}-label`}>
      <span className="adm-label" id={`${id}-label`}>{label}</span>
      <div className="adm-l">
        <div className="adm-l-col"><span className="adm-l-tag">ID</span>{input("id")}<Counter value={value.id} max={max} /></div>
        <div className="adm-l-col"><span className="adm-l-tag">EN</span>{input("en")}<Counter value={value.en} max={max} /></div>
      </div>
      <Hint>{hint}</Hint>
    </div>
  );
}

export function TextField({
  label, value, onChange, hint, type = "text", max, placeholder, invalid, mono, list,
}: {
  label: string; value: string; onChange: (v: string) => void; hint?: ReactNode; type?: string; max?: number; placeholder?: string; invalid?: boolean; mono?: boolean; list?: string;
}) {
  const id = useId();
  return (
    <div className="adm-field">
      <label className="adm-label" htmlFor={id}>{label}{max ? <Counter value={value} max={max} /> : null}</label>
      <input
        id={id} className="adm-input" type={type} value={value} placeholder={placeholder} list={list}
        aria-invalid={invalid || (max ? value.length > max : false) || undefined}
        style={mono ? { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" } : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      <Hint>{hint}</Hint>
    </div>
  );
}

export function NumberField({ label, value, onChange, min, max, step = 1, hint }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; hint?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="adm-field">
      <label className="adm-label" htmlFor={id}>{label}</label>
      <input id={id} className="adm-input" type="number" value={Number.isFinite(value) ? value : 0} min={min} max={max} step={step}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} />
      <Hint>{hint}</Hint>
    </div>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: ReactNode }) {
  return (
    <label className="adm-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="sw" aria-hidden="true"></span>
      <span><b>{label}</b>{hint ? <small>{hint}</small> : null}</span>
    </label>
  );
}

export function Select<T extends string | number>({ label, value, options, onChange, hint }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; hint?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="adm-field">
      <label className="adm-label" htmlFor={id}>{label}</label>
      <select id={id} className="adm-select" value={String(value)}
        onChange={(e) => {
          const o = options.find((x) => String(x.value) === e.target.value);
          if (o) onChange(o.value);
        }}>
        {options.map((o) => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
      </select>
      <Hint>{hint}</Hint>
    </div>
  );
}

const HEX = /^#[0-9a-fA-F]{6}$/;

export function ColorField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: ReactNode }) {
  const id = useId();
  return (
    <div className="adm-field">
      <label className="adm-label" htmlFor={id}>{label}</label>
      <div className="adm-color">
        <input type="color" aria-label={`${label}, pemilih warna`} value={HEX.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value.toUpperCase())} />
        <input id={id} className="adm-input" type="text" value={value} maxLength={7} spellCheck={false} aria-invalid={!HEX.test(value) || undefined}
          onChange={(e) => {
            let v = e.target.value.trim();
            if (v && !v.startsWith("#")) v = `#${v}`;
            onChange(v.toUpperCase());
          }} />
      </div>
      <Hint>{hint}</Hint>
    </div>
  );
}

export function Checks<T extends string>({ label, values, options, onChange, hint, min = 0 }: {
  label: string; values: T[]; options: { value: T; label: ReactNode }[]; onChange: (v: T[]) => void; hint?: ReactNode; min?: number;
}) {
  const id = useId();
  return (
    <div className="adm-field" role="group" aria-labelledby={id}>
      <span className="adm-label" id={id}>{label}</span>
      <div className="adm-checks">
        {options.map((o) => {
          const on = values.includes(o.value);
          return (
            <label key={o.value} className="adm-check">
              <input type="checkbox" checked={on} disabled={on && values.length <= min}
                onChange={(e) => onChange(e.target.checked ? [...values, o.value] : values.filter((v) => v !== o.value))} />
              {o.label}
            </label>
          );
        })}
      </div>
      <Hint>{hint}</Hint>
    </div>
  );
}

/** Ordered list with add / move / remove. `render` edits one item. */
export function ListField<T>({
  label, items, onChange, render, create, max, addLabel = "Tambah", itemTitle, hint, emptyText = "Belum ada isi.",
}: {
  label: string; items: T[]; onChange: (v: T[]) => void; render: (item: T, set: (v: T) => void, index: number) => ReactNode;
  create: () => T; max?: number; addLabel?: string; itemTitle?: (item: T, i: number) => string; hint?: ReactNode; emptyText?: string;
}) {
  // Item edits can arrive late (an image upload finishing); apply them to the newest list.
  const latest = useRef(items);
  useEffect(() => { latest.current = items; });
  const putAt = useCallback((i: number, v: T) => onChange(latest.current.map((x, k) => (k === i ? v : x))), [onChange]);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="adm-field">
      <span className="adm-label">{label}{max ? <small>{items.length}/{max}</small> : null}</span>
      <Hint>{hint}</Hint>
      <div className="adm-list">
        {items.length === 0 ? <p className="adm-empty">{emptyText}</p> : null}
        {/* putAt reads a ref, but only when an item is edited (events, finished uploads), never while rendering. */}
        {/* eslint-disable-next-line react-hooks/refs */}
        {items.map((item, i) => (
          <div className="adm-item" key={i}>
            <div className="adm-item-head">
              <strong>{itemTitle ? itemTitle(item, i) : `#${i + 1}`}</strong>
              <div className="adm-item-tools">
                <button type="button" className="adm-btn adm-btn-ghost adm-btn-small adm-btn-icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Naikkan">↑</button>
                <button type="button" className="adm-btn adm-btn-ghost adm-btn-small adm-btn-icon" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Turunkan">↓</button>
                <button type="button" className="adm-btn adm-btn-ghost adm-btn-small adm-btn-icon" onClick={() => onChange(items.filter((_, k) => k !== i))} aria-label="Hapus">✕</button>
              </div>
            </div>
            {render(item, (v) => putAt(i, v), i)}
          </div>
        ))}
      </div>
      {!max || items.length < max ? (
        <div><button type="button" className="adm-btn adm-btn-small" onClick={() => onChange([...items, create()])}>+ {addLabel}</button></div>
      ) : null}
    </div>
  );
}

export function Card({ title, description, children, aside }: { title: string; description?: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="adm-card">
      <div className="adm-card-head">
        <div><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>
        {aside}
      </div>
      <div className="adm-grid">{children}</div>
    </section>
  );
}

export const emptyL = (): L => ({ id: "", en: "" });
/** Optional bilingual text: both sides empty means "not shown". */
export const orNull = (v: L): L | null => (v.id.trim() || v.en.trim() ? v : null);
