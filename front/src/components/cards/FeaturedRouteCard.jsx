import { Link } from "react-router-dom";
import { MapPin, Clock, Star, Navigation, Mountain, Bookmark } from "lucide-react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { ROUTES } from "../../constants/routes";
import { tagBadgeVariant } from "../../utils/tagBadge";

function StationRow({ label, station }) {
  const ratio = station.total ? Math.min(100, (station.available / station.total) * 100) : 0;
  const low = ratio <= 20;
  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-gray-400">
          <Navigation className="h-3.5 w-3.5" />
          {label} {station.name}
        </span>
        <span className={`font-bold ${low ? "text-warn" : "text-neon"}`}>
          {station.available}
          <span className="text-gray-500">/{station.total}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10">
        <div className={`h-1.5 rounded-full ${low ? "bg-warn" : "bg-neon"}`} style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
}

export default function FeaturedRouteCard({ route }) {
  const isBikeShare = typeof route.departure === "object";

  return (
    <div className="grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-2">
      <div className="relative h-64 lg:h-full">
        <img src={route.image} alt={route.name} className="h-full w-full object-cover" />
        <div className="absolute left-4 top-4 flex gap-2">
          {route.tags?.map((tag) => (
            <Badge key={tag} variant={tagBadgeVariant(tag)}>
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-center p-8">
        <p className="mb-2 flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5" />
          {route.region}
        </p>
        <h3 className="mb-2 text-2xl font-extrabold text-white">{route.name}</h3>
        {route.rating && (
          <p className="mb-4 flex items-center gap-1.5 text-sm">
            <span className="flex items-center gap-0.5 text-neon">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-neon" />
              ))}
            </span>
            <span className="font-bold text-white">{route.rating}</span>
            {route.reviewCount && <span className="text-gray-500">({route.reviewCount.toLocaleString()})</span>}
          </p>
        )}
        {route.description && <p className="mb-5 text-sm leading-relaxed text-gray-400">{route.description}</p>}

        <div className="mb-5 flex items-center gap-5 text-sm text-gray-300">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-gray-500" />
            {route.distance}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-500" />
            {route.duration}
          </span>
          {route.elevationGain && (
            <span className="flex items-center gap-1.5">
              <Mountain className="h-4 w-4 text-gray-500" />
              {route.elevationGain}
            </span>
          )}
          {route.free && <Badge variant="neon">무료</Badge>}
        </div>

        {isBikeShare && (
          <div className="mb-2">
            <StationRow label="출발" station={route.departure} />
            <StationRow label="도착" station={route.destination} />
          </div>
        )}

        <Button
          as={Link}
          to={ROUTES.routeDetail(route.id)}
          variant={isBikeShare ? "cyan" : "primary"}
          className="mt-3 w-full"
        >
          {isBikeShare ? <Navigation className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {isBikeShare ? "라이딩 시작" : "루트 저장하기"}
        </Button>
      </div>
    </div>
  );
}
