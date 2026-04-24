import { useEffect, useState, useMemo } from "react";
import {
  Users,
  GraduationCap,
  ArrowRight,
  Search,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/Skeleton";
import {
  mockGroups,
  mockTeachers,
  mockStudents,
  mockTeacherSemesters,
} from "../../utils/mockData";
import { cn } from "../../utils/helpers";

const CURRENT_TEACHER_ID = 1;

const gradients = [
  "from-brand-400 to-brand-700",
  "from-emerald-400 to-emerald-700",
  "from-amber-400 to-amber-700",
  "from-violet-400 to-violet-700",
  "from-pink-400 to-pink-700",
  "from-sky-400 to-sky-700",
];

const Groups = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const myTeacher = useMemo(
    () => mockTeachers.find((t) => t.id === CURRENT_TEACHER_ID),
    [],
  );

  const myGroups = useMemo(() => {
    const ids = myTeacher?.groups || [];
    return mockGroups
      .filter((g) => ids.includes(g.id))
      .map((g) => {
        const studentsInGroup = mockStudents.filter((s) => s.groupId === g.id);
        const semestersForGroup = mockTeacherSemesters.filter(
          (s) => s.teacherId === CURRENT_TEACHER_ID && s.groupId === g.id,
        );
        const activeSem = semestersForGroup.filter(
          (s) => s.status === "active",
        ).length;
        return {
          ...g,
          studentsCount: studentsInGroup.length,
          activeSemesters: activeSem,
        };
      });
  }, [myTeacher]);

  const filtered = myGroups.filter((g) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      g.name.toLowerCase().includes(q) ||
      g.level.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Mening guruhlarim"
        description={`Siz ${myGroups.length} ta guruhga biriktirilgansiz`}
      />

      <Card className="mb-4" padded={false}>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Guruh nomi bo'yicha qidirish..."
              className="input-base pl-10"
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Guruhlar topilmadi"
          description={
            search
              ? "Qidiruvga mos guruh yo'q"
              : "Sizga hali guruh biriktirilmagan. Admin bilan bog'laning."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((g, i) => (
            <GroupCard
              key={g.id}
              group={g}
              gradient={gradients[i % gradients.length]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const GroupCard = ({ group, gradient }) => (
  <Link to={`/teacher/students?groupId=${group.id}`} className="group block">
    <Card
      className="hover:shadow-pop hover:border-ink-300 transition-all overflow-hidden"
      padded={false}
    >
      <div className={cn("h-24 bg-gradient-to-br relative", gradient)}>
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
          {group.level}
        </div>
        <div className="absolute -right-4 -bottom-6 w-20 h-20 rounded-full bg-white/10 blur-2xl" />
        <BookOpen className="absolute right-5 top-5 w-8 h-8 text-white/40" />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-ink-900 text-lg">{group.name}</h3>
          <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-ink-900 group-hover:translate-x-0.5 transition-all" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Stat icon={Users} value={group.studentsCount} label="o'quvchi" />
          <Stat
            icon={GraduationCap}
            value={group.activeSemesters}
            label="faol semestr"
          />
        </div>
      </div>
    </Card>
  </Link>
);

const Stat = ({ icon: Icon, value, label }) => (
  <div className="bg-ink-50 rounded-lg px-3 py-2.5 flex items-center gap-2">
    <Icon className="w-4 h-4 text-ink-500" />
    <div className="leading-tight">
      <div className="text-base font-bold text-ink-900">{value}</div>
      <div className="text-[10px] text-ink-500 uppercase font-semibold tracking-wide">
        {label}
      </div>
    </div>
  </div>
);

export default Groups;
