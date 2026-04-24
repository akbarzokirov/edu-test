import { useEffect, useState } from "react";
import { Calendar, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { semestersApi } from "../../api/adminApi";
import { formatDate } from "../../utils/helpers";

const Semesters = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSemesters = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await semestersApi.list();
      if (res.data.success) setItems(res.data.data || []);
    } catch (error) {
      toast.error("Semestrlarni yuklashda xatolik");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Semestrlar"
        description="Tizimdagi barcha semestrlar ro'yxati"
        action={
          <Button
            variant="secondary"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => fetchSemesters({ silent: true })}
          >
            Yangilash
          </Button>
        }
      />

      {loading ? (
        <SkeletonTable rows={6} />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Calendar}
            title="Semestrlar topilmadi"
            description="Hozircha semestr ma'lumotlari mavjud emas."
          />
        </Card>
      ) : (
        <Card padded={false} className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50 border-b border-ink-100 text-left">
                <th className="px-6 py-4 font-semibold text-ink-600">Nomi</th>
                <th className="px-6 py-4 font-semibold text-ink-600">Yaratilgan sana</th>
                <th className="px-6 py-4 font-semibold text-ink-600">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {items.map((s) => (
                <tr key={s.id} className="hover:bg-ink-50/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-ink-900">{s.name || `Semestr #${s.id}`}</td>
                  <td className="px-6 py-4 text-ink-700">{formatDate(s.createdAt)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={s.isActive === false ? "gray" : "success"} dot>
                      {s.isActive === false ? "Yopiq" : "Faol"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default Semesters;
