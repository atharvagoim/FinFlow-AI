import { AppLayout } from "../components/layout/AppLayout";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  return (
    <AppLayout title="Settings">
      <Card className="max-w-lg">
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <div className="space-y-3 text-sm">
          <p><span className="text-slate-400">Name:</span> {user?.name}</p>
          <p><span className="text-slate-400">Email:</span> {user?.email}</p>
          <p><span className="text-slate-400">Role:</span> <span className="capitalize">{user?.role?.replace("_", " ")}</span></p>
        </div>
      </Card>
    </AppLayout>
  );
}
