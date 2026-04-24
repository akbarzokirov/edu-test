const PageHeader = ({ title, description, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <div className="min-w-0">
      <h1 className="text-2xl font-bold text-ink-900 tracking-tight">{title}</h1>
      {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
    </div>
    {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
  </div>
);
export default PageHeader;
