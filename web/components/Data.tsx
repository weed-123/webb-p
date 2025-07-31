import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";

export default function Data() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const redirectToReports = async () => {
    setIsLoading(true);
    try {
      setDebugInfo("Checking authentication status...");
      const response = await fetch('/api/auth/check-token');
      const data = await response.json();
      
      setDebugInfo(`Auth response: ${JSON.stringify(data)}`);
      
      if (data.authenticated) {
        const role = user?.role || data.role;
        setDebugInfo(`Using role: ${role} to redirect`);
        
        const isAdmin = role === 'administrator' || role === 'admin';
        if (isAdmin) {
          setDebugInfo("Redirecting to admin reports...");
          router.push('/admin/reports');
        } else {
          setDebugInfo("Redirecting to operator reports...");
          router.push('/operator/reports');
        }
      } else {
        setDebugInfo("Not authenticated, redirecting to login...");
        router.push('/login');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setDebugInfo(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-muted/50 p-5">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Data</h2>
        <Separator className="my-2" />

        {debugInfo && (
          <div className="bg-neutral-800/40 p-3 text-xs mb-2 rounded border border-yellow-600 text-yellow-300">
            <p className="font-semibold">Debug Info:</p>
            <p className="whitespace-pre-wrap">{debugInfo}</p>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="rounded-xl p-5 bg-neutral-900 border border-gray-700 shadow-sm">
          <h3 className="text-sm font-medium text-white mb-2">📊 Performance Metrics</h3>
          <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Efficiency</span>
              <span className="text-white font-semibold">85%</span>
            </div>
            <div className="flex justify-between">
              <span>Accuracy</span>
              <span className="text-white font-semibold">95%</span>
            </div>
          </div>
        </div>

        {/* Reports Generation */}
        <div className="rounded-xl p-5 bg-neutral-900 border border-gray-700 shadow-sm">
          <h3 className="text-sm font-medium text-white mb-3">📝 Reports Generation</h3>
          <div className="grid grid-cols-1 gap-2">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={redirectToReports}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Export Performance Data'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}