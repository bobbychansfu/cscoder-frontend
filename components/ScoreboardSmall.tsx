import Link from 'next/link'
import { Card } from "@/components/ui/card"

interface  ScoreboardEntry {
    user: {
        computing_id: string;
        name: string;
    };
    total_score: number;
    total_penalty: number;
}

interface ScoreboardPreviewProps {
    contestId: string | string[];
    scoreboard: ScoreboardEntry[];
}

export function ScoreboardSmall({ contestId, scoreboard }: ScoreboardPreviewProps) {
    const topContestants = scoreboard.slice(0, 10);

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'text-yellow-500'; // Gold
            case 2:
                return 'text-gray-400'; // Silver
            case 3:
                return 'text-yellow-600'; // Bronze
            default:
                return '';
        }
    };

    return (
        <Card className="p-4 shadow-neumorphic">
            <h2 className="text-xl font-bold text-red-700 mb-4">Scoreboard Preview</h2>
            <div className="space-y-2">
                {topContestants.map((entry, index) => (
                    <div key={entry.user.computing_id} className={`flex justify-between items-center text-sm p-1 rounded-md ${
                        index < 3 ? 'font-bold' : ''
                    }`}>
                        <span className={`flex-1 truncate ${getRankColor(index + 1)}`}>#{index + 1} {entry.user.name}</span>
                        <span className="text-green-600">Score: {entry.total_score}</span>
                    </div>
                ))}
            </div>
            <div className="mt-4 text-center">
                <Link href={`/contest/${contestId}/scoreboard`} className="text-red-600 hover:underline">
                    View Full Scoreboard
                </Link>
            </div>
        </Card>
    );
}