export default function Settings() {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">System Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your platform preferences, display, and operational modes.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-secondary p-4">
          <p className="text-sm text-muted-foreground">Theme</p>
          <p className="mt-2 text-lg font-semibold text-foreground">Light</p>
        </div>
        <div className="rounded-xl bg-secondary p-4">
          <p className="text-sm text-muted-foreground">Notifications</p>
          <p className="mt-2 text-lg font-semibold text-foreground">Enabled</p>
        </div>
      </div>
    </div>
  );
}
