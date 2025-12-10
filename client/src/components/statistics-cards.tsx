import { Images } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TableRow } from "@shared/schema";

interface StatisticsCardsProps {
  rows: TableRow[];
  isLoading?: boolean;
}

export function StatisticsCards({ rows, isLoading = false }: StatisticsCardsProps) {

  const countImages = () => {
    return rows.reduce((count, row) => count + row.images.length, 0);
  };


  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 mb-6" data-testid="statistics-cards">
        <Card className={`stats-card-glass border-none rounded-2xl fade-in-stagger`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="skeleton w-16 h-3" />
                <div className="skeleton w-12 h-3" />
              </div>
              <div className="skeleton w-6 h-6 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 mb-6" data-testid="statistics-cards">
      <Card className="stats-card-glass border-none rounded-2xl fade-in-stagger group hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/30 transition-all duration-500 dark:bg-gradient-to-br dark:from-purple-950/20 dark:via-blue-950/20 dark:to-purple-950/20 dark:border dark:border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground" style={{fontSize: '11px'}} data-testid="text-images-count-label">Images</p>
              <p className="font-bold text-purple-400 group-hover:text-purple-300 transition-colors duration-300" style={{fontSize: '11px'}} data-testid="text-images-count-value">
                {countImages()}
              </p>
            </div>
            <Images className="text-purple-400 text-2xl group-hover:scale-110 group-hover:text-purple-300 transition-all duration-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
