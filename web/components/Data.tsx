import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { ref, onValue } from "firebase/database"; // Import necessary Firebase functions
import { db } from "@/lib/firebase"; // Import your Firebase database

export default function Data() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState(0); // State for accuracy
  const [weedCount, setWeedCount] = useState(0); // State for weed count

  useEffect(() => {
    const latestRef = ref(db, "latest"); // Reference to the latest data
    const unsubscribe = onValue(latestRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Update accuracy and weed count based on the latest data structure
        setAccuracy(data.accuracy || 0);
        if (data.weed_detection) {
          setWeedCount(data.weed_detection.weed_count || 0);
        }
      } else {
        console.error('Latest data is not available');
      }
    }, (error) => {
      console.error('Error fetching latest data:', error);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

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
              <span>Accuracy</span>
              <span className="text-white font-semibold">{accuracy}%</span> {/* Display accuracy */}
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