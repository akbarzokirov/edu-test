import { useEffect, useState } from "react";
import { BookOpen, RefreshCw, UsersRound } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { groupsApi } from "../../api/adminApi";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGroups = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await groupsApi.list();
      if (res.data.success) setGroups(res.data.data || []);
    } catch (error) {
      toast.error("Guruhlarni yuklashda xatolik");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guruhlar"
        description="Barcha guruhlar va ularning o'qituvchi/ta'lim oluvchilar holati"
        action={
          <Button
            variant="secondary"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => fetchGroups({ silent: true })}
          >
            Yangilash
          </Button>
        }
      />

      {loading ? (
        <SkeletonTable rows={6} />
      ) : groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="Guruhlar topilmadi"
            description="Hozircha tizimda birorta guruh mavjud emas."
          />
        </Card>
      ) : (
        <Card padded={false} className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50 border-b border-ink-100 text-left">
                <th className="px-6 py-4 font-semibold text-ink-600">Guruh</th>
                <th className="px-6 py-4 font-semibold text-ink-600">O'qituvchi</th>
                <th className="px-6 py-4 font-semibold text-ink-600 text-center">Talabalar</th>
                <th className="px-6 py-4 font-semibold text-ink-600">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {groups.map((g) => {
                const studentsCount = g.students?.length || 0;
                return (
                  <tr key={g.id} className="hover:bg-ink-50/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-ink-900">{g.name}</td>
                    <td className="px-6 py-4 text-ink-700">
                      {g.teacher?.fullName || "Biriktirilmagan"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 text-ink-700">
                        <UsersRound className="w-4 h-4 text-ink-400" />
                        {studentsCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={g.teacher ? "success" : "warning"} dot>
                        {g.teacher ? "Faol" : "O'qituvchi yo'q"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default Groups;
