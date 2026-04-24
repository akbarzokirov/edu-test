import { useState } from "react";
import {
  User,
  Lock,
  Bell,
  Camera,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/helpers";

const tabs = [
  { id: "profile", label: "Profil", icon: User },
  { id: "password", label: "Parol", icon: Lock },
  { id: "notifications", label: "Bildirishnomalar", icon: Bell },
];

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={cn(
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
      checked ? "bg-brand-600" : "bg-ink-200",
    )}
  >
    <span
      className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow",
        checked ? "translate-x-6" : "translate-x-1",
      )}
    />
  </button>
);

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState({
    fullName: user?.fullName || "O'qituvchi",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const [notifs, setNotifs] = useState({
    newSubmissions: true,
    deadlineReminder: true,
    aiReady: true,
    weeklyReport: false,
  });

  const saveProfile = () => {
    if (!profile.fullName.trim() || !profile.email.trim()) {
      toast.error("Ism va emailni kiriting");
      return;
    }
    updateUser(profile);
    toast.success("Profil yangilandi");
  };

  const changePassword = () => {
    if (!pwd.current || !pwd.next || !pwd.confirm) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }
    if (pwd.next.length < 6) {
      toast.error("Yangi parol kamida 6 ta belgi bo'lishi kerak");
      return;
    }
    if (pwd.next !== pwd.confirm) {
      toast.error("Parollar mos kelmadi");
      return;
    }
    setPwd({ current: "", next: "", confirm: "" });
    toast.success("Parol yangilandi");
  };

  return (
    <div>
      <PageHeader
        title="Sozlamalar"
        description="Hisob va bildirishnoma sozlamalari"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
        <Card padded={false}>
          <div className="p-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  activeTab === t.id
                    ? "bg-ink-900 text-white"
                    : "text-ink-700 hover:bg-ink-100",
                )}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </Card>

        <div>
          {activeTab === "profile" && (
            <Card>
              <h2 className="text-lg font-semibold text-ink-900">
                Shaxsiy ma'lumotlar
              </h2>
              <p className="text-sm text-ink-500 mt-1">
                Profil ma'lumotlarini yangilang
              </p>

              <div className="mt-6 flex items-center gap-4">
                <div className="relative">
                  <Avatar name={profile.fullName} size="2xl" />
                  <button className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-ink-900 text-white flex items-center justify-center shadow-soft hover:bg-ink-700">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <div className="font-semibold text-ink-900">
                    {profile.fullName}
                  </div>
                  <div className="text-sm text-ink-500">O'qituvchi</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="To'liq ism"
                  icon={User}
                  value={profile.fullName}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, fullName: e.target.value }))
                  }
                />
                <Input
                  label="Email"
                  icon={Mail}
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, email: e.target.value }))
                  }
                />
                <Input
                  label="Telefon"
                  icon={Phone}
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+998 90 123 45 67"
                />
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="brand" icon={Save} onClick={saveProfile}>
                  Saqlash
                </Button>
              </div>
            </Card>
          )}

          {activeTab === "password" && (
            <Card>
              <h2 className="text-lg font-semibold text-ink-900">
                Parolni o'zgartirish
              </h2>
              <p className="text-sm text-ink-500 mt-1">Xavfsiz parol tanlang</p>

              <div className="mt-6 space-y-4 max-w-md">
                {[
                  { key: "current", label: "Joriy parol" },
                  { key: "next", label: "Yangi parol" },
                  { key: "confirm", label: "Yangi parolni tasdiqlang" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">
                      {f.label}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                      <input
                        type={showPwd[f.key] ? "text" : "password"}
                        value={pwd[f.key]}
                        onChange={(e) =>
                          setPwd((p) => ({ ...p, [f.key]: e.target.value }))
                        }
                        className="input-base pl-10 pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPwd((s) => ({ ...s, [f.key]: !s[f.key] }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                      >
                        {showPwd[f.key] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="brand" icon={Save} onClick={changePassword}>
                  Parolni yangilash
                </Button>
              </div>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <h2 className="text-lg font-semibold text-ink-900">
                Bildirishnomalar
              </h2>
              <p className="text-sm text-ink-500 mt-1">
                Qanday voqealar haqida xabardor bo'lishni xohlaysiz
              </p>

              <div className="mt-6 divide-y divide-ink-100">
                <NotifRow
                  title="Yangi topshiriqlar"
                  desc="O'quvchi test topshirganda xabar oling"
                  checked={notifs.newSubmissions}
                  onChange={(v) =>
                    setNotifs((n) => ({ ...n, newSubmissions: v }))
                  }
                />
                <NotifRow
                  title="Deadline eslatmalari"
                  desc="Semestr tugashidan 3 kun oldin ogohlantirish"
                  checked={notifs.deadlineReminder}
                  onChange={(v) =>
                    setNotifs((n) => ({ ...n, deadlineReminder: v }))
                  }
                />
                <NotifRow
                  title="AI test tayyor"
                  desc="AI test yaratib bo'lgach bildirishnoma keladi"
                  checked={notifs.aiReady}
                  onChange={(v) => setNotifs((n) => ({ ...n, aiReady: v }))}
                />
                <NotifRow
                  title="Haftalik hisobot"
                  desc="Har dushanba guruhlar statistikasi keladi"
                  checked={notifs.weeklyReport}
                  onChange={(v) =>
                    setNotifs((n) => ({ ...n, weeklyReport: v }))
                  }
                />
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="brand"
                  icon={Save}
                  onClick={() => toast.success("Sozlamalar saqlandi")}
                >
                  Saqlash
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const NotifRow = ({ title, desc, checked, onChange }) => (
  <div className="flex items-start justify-between py-4 gap-4">
    <div>
      <div className="font-medium text-ink-900 text-sm">{title}</div>
      <div className="text-xs text-ink-500 mt-0.5">{desc}</div>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

export default Settings;
