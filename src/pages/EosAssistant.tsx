export default function EosAssistant() {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">EOS Assistant</h1>
        <p className="text-sm text-muted-foreground">
          A central command layer for intelligent automation and insight.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-secondary p-4">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="mt-2 text-lg font-semibold text-foreground">Ready</p>
        </div>
        <div className="rounded-xl bg-secondary p-4">
          <p className="text-sm text-muted-foreground">Next action</p>
          <p className="mt-2 text-lg font-semibold text-foreground">Awaiting operator input</p>
        </div>
      </div>
    </div>
  );
}
