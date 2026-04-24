export const cn = (...c) => c.filter(Boolean).join(" ");

export const formatDate = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  const m = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatDateTime = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return `${formatDate(s)}, ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
};

export const timeAgo = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  const sec = Math.floor((Date.now() - d) / 1000);
  if (sec < 60) return "hozirgina";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} daqiqa oldin`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} soat oldin`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} kun oldin`;
  return formatDate(s);
};

export const getInitials = (name) => {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).map(w => w[0]).slice(0,2).join("").toUpperCase();
};

const AVATAR_COLORS = [
  { bg: "bg-brand-100", text: "text-brand-700" },
  { bg: "bg-success-100", text: "text-success-700" },
  { bg: "bg-warning-100", text: "text-warning-600" },
  { bg: "bg-danger-100", text: "text-danger-700" },
  { bg: "bg-sky-100", text: "text-sky-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
];

export const getAvatarColor = (str) => {
  if (!str) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const generatePassword = (len = 10) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let r = "";
  for (let i = 0; i < len; i++) r += chars[Math.floor(Math.random() * chars.length)];
  return r;
};

export const generateUsername = (fullName) => {
  if (!fullName) return "";
  const parts = fullName.trim().toLowerCase().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].replace(/[^a-z0-9]/g, "");
  return `${parts[0][0]}.${parts[1]}`.replace(/[^a-z0-9.]/g, "");
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const formatNumber = (n) => {
  if (n == null) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
};
