import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
    <div className="text-center max-w-md">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-50 border border-brand-100 mb-6">
        <span className="text-4xl font-bold text-brand-600">404</span>
      </div>
      <h1 className="text-3xl font-bold text-ink-900 tracking-tight">Sahifa topilmadi</h1>
      <p className="mt-2 text-ink-500">
        Siz izlayotgan sahifa mavjud emas yoki ko'chirilgan bo'lishi mumkin.
      </p>
      <div className="mt-7 flex gap-2 justify-center">
        <button
          onClick={() => window.history.back()}
          className="btn-base bg-white text-ink-900 border border-ink-200 hover:bg-ink-50 h-10 px-4"
        >
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </button>
        <Link to="/" className="btn-base bg-ink-900 text-white hover:bg-ink-700 h-10 px-4">
          <Home className="w-4 h-4" /> Bosh sahifa
        </Link>
      </div>
    </div>
  </div>
);
export default NotFound;
