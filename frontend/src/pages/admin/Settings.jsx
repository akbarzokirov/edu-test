import { ShieldCheck } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin sozlamalari"
        description="Administrator akkaunti bo'yicha asosiy ma'lumotlar"
      />

      <Card>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink-900">Akkaunt holati</h2>
            <p className="text-sm text-ink-500 mt-1">
              Siz tizimda administrator sifatida tizimga kirgansiz.
            </p>
            <div className="mt-4 space-y-1.5 text-sm">
              <div>
                <span className="text-ink-500">F.I.Sh:</span>{" "}
                <span className="font-medium text-ink-900">{user?.fullName || "Admin"}</span>
              </div>
              <div>
                <span className="text-ink-500">Email:</span>{" "}
                <span className="font-medium text-ink-900">{user?.email || "—"}</span>
              </div>
              <div>
                <span className="text-ink-500">Rol:</span>{" "}
                <span className="font-medium text-ink-900">{user?.role || "ADMIN"}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
