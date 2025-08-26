import { useEffect, useMemo, useState } from "react";

/** @typedef {{ repos: string[] }} Props */

// Simple in-browser cache to avoid hitting the API too often
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    if (!at || Date.now() - at > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {}
}

async function fetchRepo(userRepo) {
  const res = await fetch(`https://api.github.com/repos/${userRepo}`, {
    headers: { "Accept": "application/vnd.github+json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${userRepo} ${res.status}`);
  return res.json();
}

function compact(n) {
  try { return Intl.NumberFormat(undefined, { notation: "compact" }).format(n); }
  catch { return String(n); }
}

/**
 * props.repos = ["unprofessional/spritebot", "unprofessional/soulbot-rpg"]
 */
/** @param {Props} props */
export default function GitHubRepoStats({ repos = [] }) {
  const cacheKey = useMemo(() => `gh:repos:${repos.join(",")}`, [repos]);
  const [items, setItems] = useState(() => readCache(cacheKey));
  const [status, setStatus] = useState(items ? "ready" : "loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          repos.map((r) =>
            fetchRepo(r).then((j) => ({
              id: r,
              name: j.name,
              full_name: j.full_name,
              html_url: j.html_url,
              description: j.description,
              stargazers_count: j.stargazers_count,
              forks_count: j.forks_count,
              open_issues_count: j.open_issues_count,
              pushed_at: j.pushed_at,
              language: j.language,
            }))
          )
        );
        if (!cancelled) {
          setItems(results);
          writeCache(cacheKey, results);
          setStatus("ready");
        }
      } catch (e) {
        if (!cancelled) {
          setError(String(e?.message || e));
          setStatus("error");
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]); // repos rarely change at runtime

  if (status === "loading") return <p>Loading GitHub stats…</p>;
  if (status === "error") {
    return (
      <div>
        <p style={{ color: "#b00" }}>GitHub API error: {error}</p>
        {/* Zero-JS fallback badges (don’t hit rate limits) */}
        <p>Fallback badges:</p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {repos.map((r) => (
            <a key={r} href={`https://github.com/${r}`} target="_blank" rel="noreferrer">
              <img alt={`${r} stars`} src={`https://img.shields.io/github/stars/${r}?style=flat`} />
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "16px",
      }}
    >
      {items?.map((it) => (
        <a
          key={it.full_name}
          href={it.html_url}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "block",
            textDecoration: "none",
            color: "inherit",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            padding: "14px",
            boxShadow: "0 1px 2px rgba(0,0,0,.04)",
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: 6 }}>
            {it.name}
            {it.language ? (
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#666", marginLeft: 8 }}>
                • {it.language}
              </span>
            ) : null}
          </div>
          {it.description ? (
            <div style={{ color: "#555", fontSize: "14px", marginBottom: 10 }}>
              {it.description}
            </div>
          ) : null}
          <div style={{ display: "flex", gap: "12px", fontSize: "13px", color: "#444" }}>
            <span>⭐ {compact(it.stargazers_count)}</span>
            <span>🍴 {compact(it.forks_count)}</span>
            <span>🐛 {compact(it.open_issues_count)}</span>
          </div>
          <div style={{ fontSize: "12px", color: "#777", marginTop: 8 }}>
            Updated {new Date(it.pushed_at).toLocaleDateString()}
          </div>
        </a>
      ))}
    </div>
  );
}
