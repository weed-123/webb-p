import { useState, useEffect } from "react";
import { ref, onValue, get } from "firebase/database";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { Button } from "./ui/button";

export default function RealtimeMonitor() {
  const [latestData, setLatestData] = useState<{
    date?: string;
    time?: string;
    img_results?: string;
    plant_health?: {
      overall_health?: string;
      growth_rate?: string;
    };
    weed_detection?: {
      weed_count?: number;
      weed_coverage_percentage?: number;
    };
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>("");

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    setDebug("Manually refreshing data...");
    try {
      const latestRef = ref(db, "latest");
      const snapshot = await get(latestRef);
      const data = snapshot.val();
      setLatestData(data);
      setDebug(`Data refreshed at ${new Date().toLocaleTimeString()}`);
      setLoading(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      setDebug(`Error at ${new Date().toLocaleTimeString()}: ${errorMsg}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    const latestRef = ref(db, "latest");
    const unsubscribe = onValue(
      latestRef,
      (snapshot) => {
        const data = snapshot.val();
        setLatestData(data);
        setDebug(`Real-time update at ${new Date().toLocaleTimeString()}`);
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setDebug(`Listener error at ${new Date().toLocaleTimeString()}`);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <div className="aspect-video rounded-xl bg-muted/50 p-5">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Monitoring</h2>
          <Button variant="outline" size="sm" onClick={refreshData} className="text-xs">
            Refresh Data
          </Button>
        </div>

        <div className="text-xs text-muted-foreground bg-neutral-800/20 p-2 rounded mb-2">
          Status: {debug || "Initializing..."}
        </div>

        <div className="flex flex-col bg-muted rounded-xl p-5">
          <h3 className="text-sm">Latest Detection Result</h3>

          {loading ? (
            <div className="bg-neutral-800 h-64 rounded-xl flex items-center justify-center text-muted-foreground">
              Loading data...
            </div>
          ) : error ? (
            <div className="bg-red-900/20 h-64 rounded-xl flex items-center justify-center text-red-500">
              Error: {error}
            </div>
          ) : !latestData ? (
            <div className="bg-neutral-800 h-64 rounded-xl flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="text-sm text-muted-foreground flex gap-2">
                <span>Date: {latestData.date || "N/A"}</span>
                <span>Time: {latestData.time || "N/A"}</span>
              </div>

              {latestData.img_results ? (
                <div className="relative w-full h-64">
                  <Image
                    src={latestData.img_results}
                    alt="Latest detection result"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="bg-neutral-800 h-64 rounded-xl flex items-center justify-center text-muted-foreground">
                  No image data available
                </div>
              )}

              {/* Plant Health Metrics */}
              {latestData.plant_health && (
                <div className="bg-neutral-800/40 p-4 rounded-lg text-sm text-muted-foreground mt-2">
                  <h4 className="font-semibold mb-2">Plant Health Metrics</h4>
                  <p>Overall Health: <span className="text-white">{latestData.plant_health.overall_health || "N/A"}</span></p>
                  <p>Growth Rate: <span className="text-white">{latestData.plant_health.growth_rate || "N/A"}</span></p>
                </div>
              )}

              {/* Weed Detection Metrics */}
              {latestData.weed_detection && (
                <div className="bg-neutral-800/40 p-4 rounded-lg text-sm text-muted-foreground mt-2">
                  <h4 className="font-semibold mb-2">Weed Detection</h4>
                  <p>Weed Count: <span className="text-white">{latestData.weed_detection.weed_count ?? "N/A"}</span></p>
                  <p>Weed Coverage: <span className="text-white">{latestData.weed_detection.weed_coverage_percentage ?? "N/A"}%</span></p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}