import { useEffect, useState } from "react";
import { hitViews } from "@/lib/api";

// from obsidianui, uses abacus instead of an api route
let once: Promise<number> | null = null; // strict mode runs effects twice; only count the visit once

export function useVisitorCount() {
  const [state, setState] = useState({ count: 0, loading: true, error: null as string | null });

  useEffect(() => {
    let alive = true;
    (once ||= hitViews())
      .then(count => alive && setState({ count, loading: false, error: null }))
      .catch(() => alive && setState({ count: 0, loading: false, error: "Visitor count is temporarily unavailable" }));
    return () => { alive = false; };
  }, []);

  return state;
}
