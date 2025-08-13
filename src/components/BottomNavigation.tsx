import { Home, BookOpen, Trophy, User, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", icon: Home, label: "Home", labelNepali: "होम" },
  { id: "mcqs", icon: BookOpen, label: "MCQs", labelNepali: "प्रश्नहरू" },
  { id: "daily-quiz", icon: Calendar, label: "Daily Quiz", labelNepali: "दैनिक क्विज" },
  { id: "leaderboard", icon: Trophy, label: "Leaderboard", labelNepali: "लिडरबोर्ड" },
  { id: "profile", icon: User, label: "Profile", labelNepali: "प्रोफाइल" },
];

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-smooth min-w-0",
                isActive 
                  ? "text-primary bg-primary/10 scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon size={20} className={cn("transition-smooth", isActive && "animate-pulse-glow")} />
              <span className="text-xs font-medium truncate nepali-text">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};