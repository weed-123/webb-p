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
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Data</h2>
        <Separator className="my-3" />

        {debugInfo && (
          <div className="bg-muted p-2 text-xs mb-2 rounded">
            <p className="font-semibold">Debug:</p>
            <p className="whitespace-pre-wrap">{debugInfo}</p>
          </div>
        )}

        <div className="flex flex-col gap-2 bg-muted rounded-xl p-5">
          <h3 className="text-sm">Performance Metrics</h3>
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <p>Efficiency: 85%</p>
            <p>Accuracy: 95%</p>
            <p>Coverage: 1.5ha/hr</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 bg-muted rounded-xl p-5">
          <h3 className="text-sm">Reports Generation</h3>
          <div className="flex flex-col gap-2">
            <Button onClick={redirectToReports} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Generate Daily Report'}
            </Button>
            <Button onClick={redirectToReports} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Export Performance Data'}
            </Button>
            <Button onClick={redirectToReports} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'System Status Report'}
            </Button>
          </div>
        </div>
      </div>
	  </div>
	);
  }
  
  