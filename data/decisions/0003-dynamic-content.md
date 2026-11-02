# ADR 0003: Content-driven rendering
Status: accepted. content.json is the default; Admin → Content saves an override into `site_content`; GitHub repos are fetched live from api.github.com (60 req/h per visitor IP, unauthenticated).
