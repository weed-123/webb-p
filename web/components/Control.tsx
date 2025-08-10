import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";
import { db } from "@/lib/firebase";
import { ref, set, onValue } from "firebase/database";
import { useState, useEffect } from "react";
import { Play, StopCircle, Loader } from "lucide-react";

export default function Control() {
	const [operation, setOperation] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const operationRef = ref(db, 'control/operation');
		const unsubscribe = onValue(operationRef, (snapshot) => {
			const value = snapshot.val();
			setOperation(value !== null ? value : 0);
		});

		return () => unsubscribe();
	}, []);

	const handleStart = async () => {
		try {
			setIsLoading(true);
			setError(null);
			await set(ref(db, 'control/operation'), 1);
			console.log('Start operation sent to database');
		} catch (err) {
			console.error('Error starting operation:', err);
			setError('Failed to start operation');
		} finally {
			setIsLoading(false);
		}
	};

	const handlePause = async () => {
		try {
			setIsLoading(true);
			setError(null);
			await set(ref(db, 'control/operation'), 2);
			console.log('Pause operation sent to database');
		} finally {
			setIsLoading(false);
		}
	};

	// Helper function to render the status indicator
	const getStatusIndicator = () => {
		if (isLoading) {
			return (
				<div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
					<Loader className="animate-spin h-5 w-5 text-primary" />
					<span>Processing...</span>
				</div>
			);
		}

		switch (operation) {
			case 0:
				return (
					<div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
						<StopCircle className="h-5 w-5 text-muted-foreground" />
						<span>System Stopped</span>
					</div>
				);
			case 1:
			case 5:
				return (
					<div className="flex items-center gap-2 p-3 bg-green-500/20 rounded-lg">
						<Play className="h-5 w-5 text-green-500 animate-pulse" />
						<span className="text-green-500 font-medium">Running</span>
					</div>
				);
			case 2:
				return (
					<div className="flex items-center gap-2 p-3 bg-orange-500/20 rounded-lg">
						<StopCircle className="h-5 w-5 text-orange-500" />
						<span className="text-orange-500 font-medium">Stopped</span>
					</div>
				);
			default:
				return (
					<div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
						<StopCircle className="h-5 w-5 text-muted-foreground" />
						<span>Unknown Status</span>
					</div>
				);
		}
	};

	return (
		<div className="rounded-xl bg-muted/50 p-5">
			<div className="flex flex-col gap-2">
				<h2 className="text-lg font-bold">Control</h2>
				<Separator className="my-3" />
				{error && <p className="text-destructive text-sm mb-2">{error}</p>}
				
				{/* Status Indicator */}
				<div className="mb-4">
					{getStatusIndicator()}
				</div>
				
				<div className="flex flex-col gap-2">
					<Button 
						onClick={handleStart} 
						disabled={![0, 2].includes(operation) || isLoading}
						className="flex items-center gap-2"
					>
						{isLoading ? (
							<>
								<Loader className="animate-spin h-4 w-4" />
								<span>Starting...</span>
							</>
						) : (
							<>
								<Play className="h-4 w-4" />
								<span>Start Operation</span>
							</>
						)}
					</Button>
					<Button 
						onClick={handlePause} 
						disabled={![1, 5].includes(operation) || isLoading}
						className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white"
					>
						{isLoading ? (
							<>
								<Loader className="animate-spin h-4 w-4" />
								<span>Stopping...</span>
							</>
						) : (
							<>
								<StopCircle className="h-4 w-4" />
								<span>Stop</span>
							</>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}