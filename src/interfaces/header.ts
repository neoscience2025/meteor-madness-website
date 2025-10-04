export type SubItem = { key: string; label: string; to: string; icon?: string };
export interface MenuItem { key: string; label: string; to: string; subitems?: SubItem[] }