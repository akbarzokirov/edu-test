import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft, CheckCircle2, XCircle, Clock, Calendar,
  Award, FileText, Target, Flag,
} from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { mockStudentResults, mockTestQuestions } from "../../utils/mockData";
import { formatDateTime, cn } from "../../utils/helpers";

const ResultDetail = () => {
  const { id } = useParams();
  const result = useMemo(
    () => mockStudentResults.find((r) => r.id === parseInt(id)),
    [id]
  );

  if (!result) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <h2 className="text-xl font-semibold text-ink-900">Natija topilmadi</h2>
        <Link to="/student/results" className="mt-4 inline-block text-brand-600 hover:text-brand-700 font-medium">
          ← Natijalar ro'yxatiga qaytish
        </Link>
      </div>
    );
  }

  // Demo: har bir savolga random natija berish (real backendda bu maydon bo'ladi)
  const questionsWithAnswers = mockTestQuestions.map((q, idx) => {
    // Student result'idagi `correct` soniga mos ravishda birinchi N tasini to'g'ri qilamiz
    const wasCorrect = idx < result.correct;
    const selectedOption = wasCorrect
      ? q.correctOption
      : q.options.find((o) => o.id !== q.correctOption)?.id;
    return { ...q, selectedOption, wasCorrect };
  });

  const scoreColor =
    result.score >= 85 ? "success" :
    result.score >= 70 ? "brand" :
    result.score >= 50 ? "warning" : "danger";

  const scoreLabel =
    result.score >= 85 ? "A'lo" :
    result.score >= 70 ? "Yaxshi" :
    result.score >= 50 ? "Qoniqarli" : "Qoniqarsiz";

  return (
    <div>
      <Link
        to="/student/results"
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> Natijalar
      </Link>

      <PageHeader
        title={result.semesterName}
        description={`${result.subject} · ${result.teacher}`}
      />

      {/* Score hero */}
      <Card className={cn(
        "mb-6 border-0 overflow-hidden relative",
        scoreColor === "success" && "bg-gradient-to-br from-success-50 to-brand-50",
        scoreColor === "brand" && "bg-gradient-to-br from-brand-50 to-violet-50",
        scoreColor === "warning" && "bg-gradient-to-br from-warning-50 to-amber-50",
        scoreColor === "danger" && "bg-gradient-to-br from-danger-50 to-warning-50"
      )} padded={false}>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-center">
          <div className={cn(
            "w-32 h-32 rounded-full flex flex-col items-center justify-center mx-auto lg:mx-0",
            scoreColor === "success" && "bg-success-100",
            scoreColor === "brand" && "bg-brand-100",
            scoreColor === "warning" && "bg-warning-100",
            scoreColor === "danger" && "bg-danger-100"
          )}>
            <div className={cn(
              "text-5xl font-bold leading-none",
              scoreColor === "success" && "text-success-700",
              scoreColor === "brand" && "text-brand-700",
              scoreColor === "warning" && "text-warning-700",
              scoreColor === "danger" && "text-danger-700"
            )}>
              {result.score}
            </div>
            <div className="text-xs font-medium text-ink-700 mt-1">/100</div>
          </div>

          <div className="text-center lg:text-left">
            <Badge variant={scoreColor === "brand" ? "info" : scoreColor} dot>
              {scoreLabel}
            </Badge>
            <h2 className="mt-3 text-2xl font-bold text-ink-900">
              {result.correct}/{result.total} to'g'ri javob
            </h2>
            <p className="mt-1 text-sm text-ink-600">
              {result.correct === result.total
                ? "Ajoyib! Barcha savollarga to'g'ri javob berdingiz 🎉"
                : `${result.total - result.correct} ta savolda xato qilindi`}
            </p>
            <div className="mt-4 flex flex-wrap justify-center lg:justify-start gap-3 text-xs text-ink-700">
              <InfoChip icon={Clock} label={`${result.duration} daqiqa`} />
              <InfoChip icon={Target} label={`${result.attemptNumber}-urinish`} />
              <InfoChip icon={Calendar} label={formatDateTime(result.submittedAt)} />
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MiniStat
          icon={CheckCircle2}
          label="To'g'ri"
          value={result.correct}
          color="bg-success-50 text-success-600"
        />
        <MiniStat
          icon={XCircle}
          label="Xato"
          value={result.total - result.correct}
          color="bg-danger-50 text-danger-600"
        />
        <MiniStat
          icon={Award}
          label="Aniqlik"
          value={`${Math.round((result.correct / result.total) * 100)}%`}
          color="bg-brand-50 text-brand-600"
        />
        <MiniStat
          icon={Clock}
          label="O'rt. savol vaqti"
          value={`${Math.round((result.duration * 60) / result.total)}s`}
          color="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Questions review */}
      <Card padded={false}>
        <div className="p-5 border-b border-ink-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-ink-900">Savollar tahlili</h3>
            <p className="text-xs text-ink-500 mt-0.5">Har bir savol va javobingiz</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-success-600">
              <CheckCircle2 className="w-3.5 h-3.5" /> To'g'ri
            </span>
            <span className="inline-flex items-center gap-1 text-danger-600">
              <XCircle className="w-3.5 h-3.5" /> Xato
            </span>
          </div>
        </div>

        <div className="divide-y divide-ink-100">
          {questionsWithAnswers.map((q, idx) => (
            <QuestionReview key={q.id} question={q} index={idx} />
          ))}
        </div>
      </Card>
    </div>
  );
};

const QuestionReview = ({ question, index }) => {
  return (
    <div className="p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0",
          question.wasCorrect ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"
        )}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {question.wasCorrect ? (
              <Badge variant="success" dot>To'g'ri</Badge>
            ) : (
              <Badge variant="danger" dot>Xato</Badge>
            )}
          </div>
          <h4 className="text-sm font-medium text-ink-900 leading-relaxed">{question.text}</h4>
        </div>
      </div>

      <div className="ml-12 space-y-2">
        {question.options.map((opt, idx) => {
          const letter = ["A", "B", "C", "D"][idx];
          const isCorrect = opt.id === question.correctOption;
          const isSelected = opt.id === question.selectedOption;
          const showCorrect = isCorrect;
          const showWrong = isSelected && !isCorrect;

          return (
            <div
              key={opt.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                showCorrect && "border-success-300 bg-success-50",
                showWrong && "border-danger-300 bg-danger-50",
                !showCorrect && !showWrong && "border-ink-200 bg-white"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center font-semibold text-xs flex-shrink-0",
                showCorrect ? "bg-success-600 text-white" :
                showWrong ? "bg-danger-600 text-white" :
                "bg-ink-100 text-ink-700"
              )}>
                {letter}
              </div>
              <span className={cn(
                "text-sm flex-1",
                showCorrect ? "text-success-900 font-medium" :
                showWrong ? "text-danger-900" : "text-ink-700"
              )}>
                {opt.text}
              </span>
              {showCorrect && <CheckCircle2 className="w-4 h-4 text-success-600 flex-shrink-0" />}
              {showWrong && <XCircle className="w-4 h-4 text-danger-600 flex-shrink-0" />}
              {isSelected && !showWrong && !isCorrect && (
                <span className="text-[10px] text-ink-500 font-semibold flex-shrink-0">SIZNING</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Explanation (agar bo'lsa) */}
      {question.explanation && (
        <div className="ml-12 mt-3 p-3 rounded-lg bg-brand-50 border border-brand-100">
          <div className="text-xs font-semibold text-brand-700 mb-1">💡 Tushuntirish</div>
          <p className="text-xs text-brand-900 leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

const MiniStat = ({ icon: Icon, label, value, color }) => (
  <Card className="flex items-center gap-3">
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <div className="text-xl font-bold text-ink-900 leading-tight">{value}</div>
      <div className="text-xs text-ink-500">{label}</div>
    </div>
  </Card>
);

const InfoChip = ({ icon: Icon, label }) => (
  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/50 backdrop-blur-sm">
    <Icon className="w-3.5 h-3.5" />
    <span>{label}</span>
  </div>
);

export default ResultDetail;