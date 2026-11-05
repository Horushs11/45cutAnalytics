import express from 'express';
import { environment } from './config/environment.js';
import { loadLeagueData } from './modules/league/league.service.js';
import { exploreView, getPlayerProfile, VIEWS } from './modules/analytics/analytics.service.js';

const app = express();
app.disable('x-powered-by');

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', source: environment.source });
});

app.get('/api/league', async (_request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  try {
    response.json(await loadLeagueData());
  } catch (error) {
    console.error('League data request failed:', error);
    response.status(500).json({ message: 'Unable to load league data. Check the API terminal and PostgreSQL configuration.' });
  }
});

app.get('/api/analytics/views', (_request, response) => {
  response.json({ views: VIEWS, season: environment.season });
});

app.get('/api/players/:id/profile', async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    response.status(400).json({ message: 'ID de jugador no válido' });
    return;
  }
  try {
    const profile = await getPlayerProfile(id);
    if (!profile) {
      response.status(404).json({ message: 'Jugador no encontrado en esta temporada.' });
      return;
    }
    response.json(profile);
  } catch (error) {
    console.error('Player profile request failed:', error);
    response.status(500).json({ message: 'No se pudo cargar el perfil del jugador.' });
  }
});

app.get('/api/analytics/explorer/:view', async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  if (!VIEWS.includes(request.params.view as typeof VIEWS[number])) {
    response.status(400).json({ message: 'Vista no permitida' });
    return;
  }
  const offset = Number(request.query.offset ?? 0);
  const limit = Number(request.query.limit ?? 50);
  if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit) || limit < 1 || limit > 200) {
    response.status(400).json({ message: 'Paginación no válida (límite máximo: 200).' });
    return;
  }
  const search = typeof request.query.search === 'string' ? request.query.search.trim().slice(0, 100) : '';
  try {
    response.json(await exploreView(request.params.view, { offset, limit, search }));
  } catch (error) {
    console.error('Analytics explorer request failed:', error);
    response.status(500).json({ message: 'No se pudo consultar la vista de analytics.' });
  }
});

app.listen(environment.port, '127.0.0.1', () => {
  console.log(`45CUT API listening on http://127.0.0.1:${environment.port} (${environment.source} mode)`);
});
