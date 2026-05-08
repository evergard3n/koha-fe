import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("search", "routes/search.tsx"),
  route(":id", "routes/novel.tsx"),
  route(":id/:hash", "routes/chapter.tsx"),
] satisfies RouteConfig;
