import { Link } from "react-router-dom";
import { MapPin, Clock, Star, Navigation } from "lucide-react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { ROUTES } from "../../constants/routes";
import { tagBadgeVariant } from "../../utils/tagBadge";

function StationRow({ label, station }) {
  const ratio = station.total ? Math.min(100, (station.available / station.total) * 100) : 0;
  const low = ratio <= 20;
  return (
    <div className="mb-2">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-gray-400">
          <Navigation className="h-3 w-3" />
          {label} {station.name}
        </span>
        <span className={`font-bold ${low ? "text-warn" : "text-neon"}`}>
          {station.available}
          <span className="text-gray-500">/{station.total}</span>
        </span>
      </div>
      <div className="h-1 rounded-full bg-white/10">
        <div
          className={`h-1 rounded-full ${low ? "bg-warn" : "bg-neon"}`}
          style={{ width: `${ratio}%` }}
        />
      </div>
    </div>
  );
}

export default function RouteCard({ route }) {
  const isBikeShare = typeof route.departure === "object";

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative h-40 w-full overflow-hidden">
        <img src={route.image} alt={route.name} className="h-full w-full object-cover" />
        <div className="absolute left-3 top-3 flex gap-2">
          {route.tags?.map((tag) => (
            <Badge key={tag} variant={tagBadgeVariant(tag)}>
              {tag}
            </Badge>
          ))}
        </div>
        {route.free && (
          <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-1 text-xs font-bold text-white">
            무료
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="mb-1 flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3 w-3" />
          {route.region}
        </p>
        <h3 className="mb-2 text-base font-bold text-white">{route.name}</h3>
        <div className="mb-4 flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {route.distance}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {route.duration}
          </span>
          {route.rating && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-neon text-neon" />
              {route.rating}
            </span>
          )}
        </div>

        {isBikeShare && (
          <div className="mb-4">
            <StationRow label="출발" station={route.departure} />
            <StationRow label="도착" station={route.destination} />
          </div>
        )}

        <Button as={Link} to={ROUTES.routeDetail(route.id)} variant="dark" className="mt-auto w-full">
          <Navigation className="h-4 w-4" />
          루트 선택
        </Button>
      </div>
    </div>
  );
}
