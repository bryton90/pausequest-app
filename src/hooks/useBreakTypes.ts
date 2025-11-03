import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'pausequest.breakTypes';

export type BreakType = {
  id: string;
  label: string;
  emoji?: string;
};

const DEFAULT_BREAK_TYPES: BreakType[] = [
  { id: 'lunch', label: 'Lunch', emoji: '🍽️' },
  { id: 'snack', label: 'Snack', emoji: '🍎' },
  { id: 'water', label: 'Water', emoji: '💧' },
  { id: 'stretch', label: 'Stretch', emoji: '🤸‍♂️' },
];

function readStored(): BreakType[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((t) => typeof t?.id === 'string' && typeof t?.label === 'string');
  } catch {
    return null;
  }
}

export function useBreakTypes() {
  const [breakTypes, setBreakTypes] = useState<BreakType[]>(() => readStored() ?? DEFAULT_BREAK_TYPES);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(breakTypes));
    } catch {}
  }, [breakTypes]);

  const addType = useCallback((label: string, emoji?: string) => {
    const id = label.trim().toLowerCase().replace(/\s+/g, '-');
    if (!id) return;
    setBreakTypes((prev) => {
      if (prev.some((t) => t.id === id)) return prev;
      return [...prev, { id, label: label.trim(), emoji }];
    });
  }, []);

  const removeType = useCallback((id: string) => {
    setBreakTypes((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const resetDefaults = useCallback(() => {
    setBreakTypes(DEFAULT_BREAK_TYPES);
  }, []);

  const options = useMemo(() => breakTypes.map((t) => ({ value: t.id, label: `${t.label}${t.emoji ? ` ${t.emoji}` : ''}` })), [breakTypes]);

  return { breakTypes, options, addType, removeType, resetDefaults };
}

export function getDefaultBreakTypeId(): string {
  return DEFAULT_BREAK_TYPES[0].id;
}


