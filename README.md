# CrimeNet — Criminal Network Analysis System

> Hackathon Demo | Ministry of Home Affairs / NCRB Use Case | **Synthetic data only**

## Quick Start

### Backend (Terminal 1)
```bash
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --reload --port 8000
```
Or on Windows: `start.bat`

### Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173**

## Demo Flow
1. Click **Load Sample Data** → 10 synthetic reports appear
2. Click **Process & Extract** → NER + regex runs, graph builds
3. Switch to **NETWORK** tab → 3D interactive force graph
4. Switch to **GEOSPATIAL** → India heatmap with hotspots
5. Switch to **INFLUENCERS** → ranked entities with centrality scores
6. Switch to **ALERTS** → flagged suspicious patterns
7. Switch to **QUERY** → ask "Who connects Case 3 and Case 7?"
8. Switch to **BRIEF** → generate investigator case brief
9. Click **Simulate Tip-off** → new tip streams in, graph updates live

## Architecture
- **Frontend**: React + Vite + TailwindCSS v4 + React Three Fiber (3D hero) + react-force-graph-3d
- **Backend**: Python FastAPI + spaCy NER + NetworkX graph analytics
- **Storage**: In-memory (SQLite can be added)
- **Entity types**: Person, Location, Vehicle, Phone, Organization
- **Analytics**: Degree centrality, Betweenness centrality, PageRank, Louvain community detection

## Key Demo Moment
The **hidden link**: Rajan Verma (Delhi Hawala, RPT-003) is connected to Imran Qureshi (Hyderabad Explosives, RPT-006) via shared phone contact — discovered automatically by the system, spanning 4 cross-domain cases.
