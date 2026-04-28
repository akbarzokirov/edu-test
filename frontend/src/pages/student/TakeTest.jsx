import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Clock, CheckCircle2, AlertTriangle, Flag, ChevronLeft, ChevronRight,
  Send, Sparkles, Upload, FileText, X, Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { studentApi } from "../../api/studentApi";
import { cn } from "../../utils/helpers";
import MathText from "../../components/ui/MathText";

const TakeTest = () => {
  const { id } = useParams();

  // Semestr info
  const [semester, setSemester] = useState(null);
  const [loadingSem, setLoadingSem] = useState(true);

  // Fayl yuklash
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [starting, setStarting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Test holati
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [detectedLanguage, setDetectedLanguage] = useState(null);

  // Semestr ma'lumotini olish
  useEffect(() => {
    studentApi
      .getSemesterDetail(id)
      .then(({ data }) => setSemester(data.data))
      .catch(() => toast.error("Semestr topilmadi"))
      .finally(() => setLoadingSem(false));
  }, [id]);

  // Timer
  useEffect(() => {
    if (!attemptId || result) return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, timeLeft, result]);

  // Anti-cheat: tab switch
  useEffect(() => {
    if (!attemptId || result) return;
    const handler = () => {
      if (document.hidden) {
        toast.error("Ogohlantirish: Oynani tark etmang!", { duration: 4000 });
        studentApi.saveProgress(attemptId, { tabSwitch: true }).catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [attemptId, result]);

  // Fayl validatsiyasi
  const handleFile = (f) => {
    if (!f) return;
    const ok = /\.(pdf|docx?|txt)$/i.test(f.name);
    if (!ok) {
      toast.error("Faqat PDF, DOCX, DOC yoki TXT fayllar qabul qilinadi");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error("Fayl 20MB dan oshmasligi kerak");
      return;
    }
    setFile(f);
  };

  // ⭐ Testni boshlash: fayl yuklash + AI savol yaratish
  const startTest = async () => {
    if (!file) {
      toast.error("Avval darslik faylini yuklang");
      return;
    }
    setStarting(true);
    setUploadProgress(0);
    try {
      const { data } = await studentApi.startAttempt(id, file, (ev) => {
        if (ev.total) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
      });
      const attempt = data.data;
      setAttemptId(attempt.attemptId);
      setQuestions(attempt.questions);
      setTimeLeft(attempt.duration * 60);
      setDetectedLanguage(attempt.language);
      setCurrent(0);
      setAnswers({});
      setFlagged(new Set());
      toast.success("AI test tayyor — vaqt boshlandi!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Testni boshlab bo'lmadi");
    } finally {
      setStarting(false);
    }
  };

  // Javoblarni avtomatik saqlash (debounced)
  const saveDebounced = useRef(null);
  const scheduleSave = (newAnswers) => {
    if (saveDebounced.current) clearTimeout(saveDebounced.current);
    saveDebounced.current = setTimeout(() => {
      studentApi.saveProgress(attemptId, { answers: newAnswers }).catch(() => {});
    }, 800);
  };

  const handleAnswer = (qId, optionId) => {
    const next = { ...answers, [qId]: optionId };
    setAnswers(next);
    scheduleSave(next);
  };

  const toggleFlag = (qId) => {
    const next = new Set(flagged);
    next.has(qId) ? next.delete(qId) : next.add(qId);
    setFlagged(next);
  };

  const handleSubmit = async (auto = false) => {
    if (submitting) return;
    setShowSubmitModal(false);
    setSubmitting(true);
    try {
      const { data } = await studentApi.submitAttempt(attemptId, { answers });
      setResult(data.data);
      if (auto) toast("Vaqt tugadi — test avtomatik topshirildi");
      else toast.success("Test topshirildi!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Topshirishda xato");
    } finally {
      setSubmitting(false);
    }
  };

  // ============ YUKLANISH ============
  if (loadingSem) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!semester) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <h2 className="text-xl font-semibold text-ink-900">Test topilmadi</h2>
        <Link to="/student/semesters" className="mt-4 inline-block text-brand-600 hover:text-brand-700 font-medium">
          ← Testlar ro'yxatiga qaytish
        </Link>
      </div>
    );
  }

  // ============ INTRO + FAYL YUKLASH ============
  if (!attemptId && !result) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link to="/student/semesters" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-4">
          <ChevronLeft className="w-4 h-4" /> Testlar ro'yxati
        </Link>

        <Card padded={false}>
          {/* Sarlavha */}
          <div className="p-6 border-b border-ink-100">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 text-xs font-semibold mb-3">
              <Sparkles className="w-3 h-3" /> AI test
            </div>
            <h1 className="text-2xl font-bold text-ink-900 tracking-tight">{semester.name}</h1>
            <p className="mt-1 text-sm text-ink-500">
              {semester.subject && `${semester.subject} · `}{semester.teacher}
            </p>
          </div>

          {/* Statistika */}
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <IntroStat label="Savollar" value={semester.questionCount} />
            <IntroStat label="Vaqt" value={`${semester.duration} daq`} />
            <IntroStat label="Urinishlar" value={`${semester.attempts - semester.attemptsUsed}/${semester.attempts}`} />
            <IntroStat label="Baho" value={semester.autoGrade ? "AI" : "Qo'lda"} />
          </div>

          {/* ⭐ FAYL YUKLASH BLOKI */}
          <div className="p-6 border-t border-ink-100">
            <h3 className="text-sm font-semibold text-ink-900 mb-1">
              <Upload className="w-4 h-4 inline mr-1" /> Darslik faylini yuklang
            </h3>
            <p className="text-xs text-ink-500 mb-4">
              PDF, DOCX yoki TXT format. AI shu fayl tilida savol yaratadi.
            </p>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
              onClick={() => !file && fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-6 transition-all text-center",
                !file && "cursor-pointer",
                dragOver ? "border-brand-500 bg-brand-50" :
                file ? "border-success-300 bg-success-50" :
                "border-ink-200 hover:border-ink-300 hover:bg-ink-50"
              )}
            >
              <input
                ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success-100 text-success-700 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-sm font-semibold text-ink-900 truncate">{file.name}</div>
                    <div className="text-xs text-ink-500">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="p-1.5 rounded-lg hover:bg-white text-ink-500"
                    disabled={starting}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-ink-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-ink-900">
                    Faylni tashlang yoki <span className="text-brand-600">tanlash uchun bosing</span>
                  </p>
                  <p className="text-xs text-ink-500 mt-1">PDF, DOCX, DOC, TXT · maks 20MB</p>
                </>
              )}
            </div>
          </div>

          {/* Ogohlantirish */}
          <div className="px-6 pb-6">
            <div className="p-4 rounded-xl bg-warning-50 border border-warning-100">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-warning-700">
                  <div className="font-semibold mb-1">Diqqat!</div>
                  <ul className="space-y-1 text-xs list-disc list-inside">
                    <li>Fayl yuklagandan so'ng AI savol yaratadi (10-30 soniya)</li>
                    <li>Savollar fayl tilida bo'ladi (o'zbek/rus/ingliz)</li>
                    <li>Test boshlangach vaqt avtomatik hisoblanadi</li>
                    <li>Oynani tark etmang — anti-cheat ishlaydi</li>
                    <li>Javoblar avtomatik saqlanadi</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Tugmalar */}
          <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
            <Link to="/student/semesters" className="sm:flex-1">
              <Button variant="secondary" className="w-full">Orqaga</Button>
            </Link>
            <Button
              variant="brand"
              onClick={startTest}
              disabled={!file || starting || !semester.canStart}
              loading={starting}
              className="sm:flex-1"
              icon={starting ? undefined : Sparkles}
            >
              {starting
                ? uploadProgress < 100
                  ? `Yuklanmoqda ${uploadProgress}%...`
                  : "AI savol yaratmoqda..."
                : "Testni boshlash"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ============ NATIJA ============
  if (result) {
    const passed = result.score >= 50;
    return (
      <div className="max-w-xl mx-auto">
        <Card padded={false}>
          <div className={cn(
            "p-8 text-center",
            passed ? "bg-gradient-to-br from-success-50 to-brand-50" : "bg-gradient-to-br from-warning-50 to-danger-50"
          )}>
            <div className={cn(
              "w-20 h-20 rounded-full mx-auto flex items-center justify-center",
              passed ? "bg-success-100" : "bg-warning-100"
            )}>
              {passed
                ? <CheckCircle2 className="w-10 h-10 text-success-600" />
                : <AlertTriangle className="w-10 h-10 text-warning-600" />}
            </div>
            <h2 className="mt-4 text-2xl font-bold text-ink-900">
              {passed ? "Test muvaffaqiyatli topshirildi!" : "Test topshirildi"}
            </h2>
            <p className="mt-2 text-sm text-ink-600">{semester.name}</p>
            <div className="mt-6 flex items-baseline justify-center gap-2">
              <span className={cn(
                "text-6xl font-bold",
                result.score >= 85 ? "text-success-600" :
                result.score >= 70 ? "text-brand-600" :
                result.score >= 50 ? "text-warning-600" : "text-danger-600"
              )}>
                {result.score}
              </span>
              <span className="text-2xl text-ink-500">/100</span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-3 gap-3 border-b border-ink-100">
            <ResStat label="To'g'ri" value={`${result.correct}/${result.total}`} />
            <ResStat label="Vaqt" value={`${result.duration} daq`} />
            <ResStat label="Baho" value={
              result.score >= 85 ? "A'lo" :
              result.score >= 70 ? "Yaxshi" :
              result.score >= 50 ? "Qoniqarli" : "Qoniqarsiz"
            } />
          </div>

          {result.aiFeedback && (
            <div className="p-6 border-b border-ink-100">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-1">
                    AI Maslahati
                  </div>
                  <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">
                    <MathText text={result.aiFeedback} />
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 space-y-2">
            <Link to="/student/semesters">
              <Button variant="brand" className="w-full">Testlar ro'yxatiga qaytish</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // ============ TEST OYNASI ============
  const currentQ = questions[current];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeUrgent = timeLeft <= 60;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="max-w-6xl mx-auto -mt-6 -mx-4 lg:-mx-6">
      <div className="sticky top-16 z-20 bg-canvas/95 backdrop-blur-xl border-b border-ink-100">
        <div className="px-4 lg:px-6 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-ink-900 truncate text-sm lg:text-base">{semester.name}</h1>
              <Badge variant="info" className="hidden sm:inline-flex text-[10px]">
                {current + 1}/{questions.length}
              </Badge>
              {detectedLanguage && (
                <Badge variant="success" className="hidden sm:inline-flex text-[10px]">
                  {detectedLanguage === "uz" ? "O'zbek" : detectedLanguage === "ru" ? "Русский" : detectedLanguage === "en" ? "English" : detectedLanguage}
                </Badge>
              )}
            </div>
            <div className="mt-1.5 h-1 bg-ink-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-semibold text-sm",
            timeUrgent ? "bg-danger-50 text-danger-700 animate-pulse" : "bg-ink-100 text-ink-900"
          )}>
            <Clock className="w-4 h-4" />
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
          <Button variant="brand" size="sm" icon={Send} onClick={() => setShowSubmitModal(true)} className="hidden sm:inline-flex">
            Topshirish
          </Button>
          <Button variant="brand" size="icon-sm" onClick={() => setShowSubmitModal(true)} className="sm:hidden">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 lg:px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div>
          <Card padded={false}>
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
                    Savol {current + 1}
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-ink-900 leading-relaxed">
                    <MathText text={currentQ.text} />
                  </h2>
                </div>
                <button
                  onClick={() => toggleFlag(currentQ.id)}
                  className={cn(
                    "p-2 rounded-lg transition-colors flex-shrink-0",
                    flagged.has(currentQ.id) ? "bg-warning-100 text-warning-700" : "bg-ink-100 text-ink-500 hover:bg-ink-200"
                  )}
                >
                  <Flag className={cn("w-4 h-4", flagged.has(currentQ.id) && "fill-current")} />
                </button>
              </div>

              <div className="mt-6 space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  const letter = ["A", "B", "C", "D"][idx];
                  const selected = answers[currentQ.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswer(currentQ.id, opt.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3",
                        selected ? "border-brand-500 bg-brand-50" :
                        "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0",
                        selected ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-700"
                      )}>
                        {letter}
                      </div>
                      <span className="text-sm text-ink-900 flex-1">
                        <MathText text={opt.text} />
                      </span>
                      {selected && <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-ink-100 bg-ink-50/50 flex items-center justify-between">
              <Button variant="secondary" icon={ChevronLeft}
                onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
                Oldingi
              </Button>
              <span className="text-xs text-ink-500 hidden sm:block">
                {answeredCount} ta javob · {flagged.size} ta belgilangan
              </span>
              {current === questions.length - 1 ? (
                <Button variant="brand" icon={Send} onClick={() => setShowSubmitModal(true)}>Yakunlash</Button>
              ) : (
                <Button variant="brand" iconRight={ChevronRight}
                  onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}>
                  Keyingi
                </Button>
              )}
            </div>
          </Card>
        </div>

        <aside>
          <Card padded={false} className="lg:sticky lg:top-36">
            <div className="p-4 border-b border-ink-100">
              <h3 className="font-semibold text-sm text-ink-900">Savollar xaritasi</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-6 lg:grid-cols-5 gap-1.5">
                {questions.map((q, i) => {
                  const hasAnswer = answers[q.id] != null;
                  const isFlagged = flagged.has(q.id);
                  const isCurrent = i === current;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrent(i)}
                      className={cn(
                        "aspect-square rounded-lg text-xs font-semibold transition-all relative",
                        isCurrent ? "ring-2 ring-brand-500 ring-offset-1" : "",
                        isFlagged ? "bg-warning-100 text-warning-700 hover:bg-warning-200" :
                        hasAnswer ? "bg-brand-500 text-white hover:bg-brand-600" :
                        "bg-ink-100 text-ink-700 hover:bg-ink-200"
                      )}
                    >
                      {i + 1}
                      {isFlagged && <Flag className="w-2.5 h-2.5 absolute top-0.5 right-0.5 fill-current" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-ink-100 bg-ink-50/50">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs text-ink-500">Progress</span>
                <span className="text-sm font-bold text-ink-900">{answeredCount}/{questions.length}</span>
              </div>
              <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </Card>
        </aside>
      </div>

      <Modal
        open={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowSubmitModal(false)} disabled={submitting}>
              Davom etish
            </Button>
            <Button variant="brand" icon={Send} onClick={() => handleSubmit(false)} loading={submitting}>
              Ha, topshirish
            </Button>
          </>
        }
      >
        <div className="flex gap-4">
          <div className="w-11 h-11 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
            <Send className="w-5 h-5 text-brand-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-ink-900">Testni topshirish</h3>
            <p className="mt-1 text-sm text-ink-600">
              <span className="font-semibold text-ink-900">{answeredCount}/{questions.length}</span> ta savolga javob bergansiz.
              {answeredCount < questions.length && (
                <> <span className="text-warning-700">{questions.length - answeredCount} ta bo'sh.</span></>
              )}
            </p>
            <p className="mt-2 text-xs text-ink-500">AI natijangizni baholaydi va shaxsiy maslahat beradi.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const IntroStat = ({ label, value }) => (
  <div className="bg-ink-50 rounded-xl p-3 text-center">
    <div className="text-lg font-bold text-ink-900">{value}</div>
    <div className="text-[11px] text-ink-500 mt-0.5">{label}</div>
  </div>
);

const ResStat = ({ label, value }) => (
  <div className="text-center">
    <div className="text-lg font-bold text-ink-900">{value}</div>
    <div className="text-[11px] text-ink-500 mt-0.5">{label}</div>
  </div>
);

export default TakeTest;
