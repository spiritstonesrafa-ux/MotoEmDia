import { Link } from "@tanstack/react-router";
import { Gauge } from "lucide-react";

export function Logo({ to = "/" }: { to?: "/" | "/app" }) {
  return (
    <Link to={to} className="flex items-center gap-2 font-display text-lg font-bold text-navy">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy text-navy-foreground">
        <Gauge className="h-4 w-4" />
      </span>
      <span>MotoEm<span className="text-primary">Dia</span></span>
    </Link>
  );
}
