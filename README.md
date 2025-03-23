# Ideen-Tool mit Research API Integration

Dieses Tool ermöglicht es, Trend-Recherchen zu einem bestimmten Thema durchzuführen und die Ergebnisse für Content-Ideen zu nutzen.

## Entwicklungsumgebung einrichten

1. Repository klonen
2. Abhängigkeiten installieren: `npm install`
3. `.env`-Datei basierend auf `.env.example` erstellen und API-Keys eintragen
4. Entwicklungsserver starten: `npm run dev:all`

## API-Integration

Das Tool integriert mit einer externen Research-API, die folgende Funktionen bietet:
- Trend-Analyse zu einem Thema starten
- Status der Analyse abfragen
- Ergebnisse der Trend-Analyse abrufen

## Vercel Deployment

Die Anwendung ist für das Deployment auf Vercel konfiguriert. Dabei wird:
- Die Vite-App gebaut und bereitgestellt
- API-Anfragen über Vercel-Rewrites zur Research-API weitergeleitet
- Die CORS-Einstellungen für die API-Kommunikation konfiguriert

### Deployment-Konfiguration

- `vercel.json` enthält die Routing-Regeln für API-Anfragen zur Research-API
- In der Produktion werden API-Anfragen direkt an `researchapi.stefanai.de` weitergeleitet
- Der Express-Server wird nur in der Entwicklungsumgebung verwendet

## Umgebungsvariablen

Folgende Umgebungsvariablen werden benötigt:

- `VITE_RESEARCH_API_URL`: URL der Research-API (Produktion)
- `RESEARCH_API_KEY`: API-Key für die Research-API

## Lokaler Entwicklungsprozess

Bei der lokalen Entwicklung:
1. Der Vite-Server läuft auf Port 5173
2. Ein Express-Proxy-Server läuft auf Port 3001
3. API-Anfragen werden vom Vite-Server zum Express-Server und dann zur Research-API weitergeleitet 