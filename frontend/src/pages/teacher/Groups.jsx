import { useEffect, useState } from "react";
import { UsersRound, Users, FileText } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { teacherApi } from "../../api/teacherApi";
import { cn } from "../../utils/helpers";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherApi.groups()
      .then(({ data }) => setGroups(data.data || []))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Mening guruhlarim"
        description="Sizga biriktirilgan guruhlar. Guruhlarni faqat admin biriktira oladi."
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="Guruh biriktirilmagan"
          description="Admin sizga hali guruh biriktirmagan. Admin bilan bog'laning."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {groups.map((g) => (
            <Card key={g.id} className="hover:shadow-pop hover:border-ink-300 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                  "bg-gradient-to-br from-brand-500 to-brand-700 text-white"
                )}>
                  {g.name.slice(0, 2).toUpperCase()}
                </div>
                <Badge variant="info" dot>Guruh</Badge>
              </div>
              <h3 className="text-lg font-semibold text-ink-900">{g.name}</h3>
              <div className="mt-4 pt-4 border-t border-ink-100 grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-ink-500">
                    <Users className="w-3 h-3" /> O'quvchi
                  </div>
                  <div className="mt-1 text-xl font-bold text-ink-900">{g.studentsCount}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-ink-500">
                    <FileText className="w-3 h-3" /> Faol test
                  </div>
                  <div className="mt-1 text-xl font-bold text-ink-900">{g.activeSemesters}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Groups;
