import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";

const ResultDetail = () => {
  const { id } = useParams();

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/student/results" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-4">
        <ChevronLeft className="w-4 h-4" /> Natijalar
      </Link>
      <PageHeader title="Natija" />
      <Card>
        <p className="text-sm text-ink-600">
          Batafsil natija testni topshirganingizda ko'rsatiladi. ID: {id}
        </p>
        <Link to="/student/results" className="mt-4 inline-block text-brand-600 hover:text-brand-700 font-medium text-sm">
          ← Natijalar ro'yxatiga qaytish
        </Link>
      </Card>
    </div>
  );
};

export default ResultDetail;
