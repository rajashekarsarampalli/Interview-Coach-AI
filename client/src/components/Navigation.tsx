import { Link, useLocation } from "wouter";
import { LayoutDashboard, Briefcase, Video, UserCircle } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/interview/new", label: "Practice", icon: Video },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-20 md:w-64 bg-card border-r border-border/50 hidden sm:flex flex-col py-8 z-50">
      <div className="px-6 mb-12 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
          A
        </div>
        <span className="text-xl font-bold tracking-tight hidden md:block">
          Ace<span className="text-primary">It</span>
        </span>
      </div>

      <div className="flex-1 space-y-2 px-3">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
          
          return (
            <Link key={link.href} href={link.href}>
              <div 
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer group
                  ${isActive 
                    ? "bg-primary/10 text-primary font-medium shadow-[0_0_15px_rgba(37,99,235,0.15)]" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "group-hover:text-foreground"}`} />
                <span className="hidden md:block">{link.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary hidden md:block animate-pulse" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="px-6 mt-auto">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-white/5">
          <UserCircle className="w-8 h-8 text-muted-foreground" />
          <div className="hidden md:block overflow-hidden">
            <p className="text-sm font-medium truncate">Demo User</p>
            <p className="text-xs text-muted-foreground truncate">Free Plan</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
