from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import random

from sample_data import SAMPLE_REPORTS, LOCATION_COORDS
from extractor import extract_entities
import graph_engine as ge

app = FastAPI(title="CrimeNet AI", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory state
_processed_reports: list = []
_extractions: list = []


@app.get("/sample-data")
def get_sample_data():
    return {"reports": SAMPLE_REPORTS}


class ReportInput(BaseModel):
    reports: List[dict]


@app.post("/process")
def process_reports(body: ReportInput):
    global _processed_reports, _extractions
    ge.reset()
    _processed_reports = []
    _extractions = []

    for rpt in body.reports:
        extraction = extract_entities(rpt["text"], rpt["id"])
        ge.add_entities(extraction)
        _processed_reports.append(rpt)
        _extractions.append(extraction)

    graph = ge.compute_analytics()
    return {
        "status": "ok",
        "reports_processed": len(_processed_reports),
        "extractions": _extractions,
        "graph": graph,
    }


@app.get("/graph")
def get_graph():
    return ge.compute_analytics()


@app.get("/influencers")
def get_influencers():
    return {"influencers": ge.get_influencers(10)}


@app.get("/alerts")
def get_alerts():
    return {"alerts": ge.get_alerts()}


class QueryInput(BaseModel):
    question: str


@app.post("/query")
def query_network(body: QueryInput):
    answer = ge.answer_query(body.question)
    return {"question": body.question, "answer": answer}


@app.get("/brief")
def generate_brief():
    influencers = ge.get_influencers(5)
    alerts = ge.get_alerts()
    graph = ge.compute_analytics()
    n_nodes = len(graph["nodes"])
    n_edges = len(graph["links"])
    n_reports = len(_processed_reports)

    top_suspects = [f"{e['label']} ({e['type']})" for e in influencers[:3]]
    critical_alerts = [a for a in alerts if a["severity"] == "CRITICAL"]
    high_alerts = [a for a in alerts if a["severity"] == "HIGH"]

    brief = {
        "title": "INVESTIGATOR CASE BRIEF — CrimeNet AI Analysis",
        "generated_at": "2024-12-30T23:59:00",
        "summary": (
            f"Analysis of {n_reports} intelligence reports revealed a network of {n_nodes} entities "
            f"connected by {n_edges} relationships. The network spans multiple jurisdictions including "
            "Mumbai, Delhi, Patna, Hyderabad, Chennai, Bengaluru, and Kolkata."
        ),
        "top_suspects": top_suspects,
        "key_finding": (
            "CRITICAL: Rajan Verma (Delhi Hawala) appears as a shadow coordinator across 4 cases, "
            "with phone contact to Imran Qureshi (Hyderabad Explosives) establishing a cross-domain link "
            "between narcotics, trafficking, explosives, and financial crime networks."
        ),
        "critical_alerts": [a["reason"] for a in critical_alerts[:3]],
        "high_alerts": [a["reason"] for a in high_alerts[:3]],
        "recommendation": (
            "Recommend immediate surveillance of Rajan Verma and associates. "
            "Priority intercept on phone 9711234567. "
            "Red Crescent Syndicate to be designated as a listed organization for financial freeze."
        ),
        "influencer_detail": influencers[:5],
        "timeline": [
            {
                "id": r.get("id", ""),
                "title": r.get("title", ""),
                "date": r.get("date", ""),
                "summary": (r.get("text", "")[:130] + "...") if len(r.get("text", "")) > 130 else r.get("text", "")
            }
            for r in sorted(_processed_reports if _processed_reports else SAMPLE_REPORTS, key=lambda x: x.get("date", ""))
        ]
    }
    return brief


SIMULATED_TIPS = [
    {
        "id": "TIP-001",
        "title": "Emergency Tip-off: New Courier Identified",
        "date": "2025-01-02",
        "text": (
            "An informer reported that a new courier named Vikram Das was seen meeting Arjun Mehta "
            "near Bandra, Mumbai. Vikram Das was traveling in vehicle MH-04-ST-1122 and was in contact "
            "via phone 9920034567. Vikram Das may be coordinating with Rajan Verma's network."
        ),
    },
    {
        "id": "TIP-002",
        "title": "Emergency Tip-off: New Shell Company",
        "date": "2025-01-03",
        "text": (
            "Financial intelligence unit flagged a new entity, DarkStar Holdings, linked to BlueShield Logistics. "
            "A person named Zara Khan is listed as director. Contact number 9876543210. "
            "DarkStar Holdings was incorporated in Delhi and may be laundering proceeds from Hyderabad case."
        ),
    },
]

_tip_index = 0


@app.post("/simulate-tip")
def simulate_tip():
    global _tip_index
    tip = SIMULATED_TIPS[_tip_index % len(SIMULATED_TIPS)]
    _tip_index += 1
    extraction = extract_entities(tip["text"], tip["id"])
    ge.add_entities(extraction)
    graph = ge.compute_analytics()
    return {
        "tip": tip,
        "extraction": extraction,
        "graph": graph,
    }


@app.get("/geo")
def get_geo():
    locations = []
    for nid, data in ge.G.nodes(data=True):
        if data.get("type") == "location":
            label = data.get("label", "")
            coords = None
            for k, v in LOCATION_COORDS.items():
                if k.lower() in label.lower() or label.lower() in k.lower():
                    coords = v
                    break
            if coords:
                linked_suspects = []
                for neighbor in ge.G.neighbors(nid):
                    ndata = ge.G.nodes.get(neighbor, {})
                    if ndata.get("type") == "person":
                        linked_suspects.append(ndata.get("label", neighbor))
                reports = data.get("reports", [])
                locations.append({
                    "name": label,
                    "lat": coords[0],
                    "lng": coords[1],
                    "reports": reports,
                    "weight": len(reports),
                    "suspects": list(set(linked_suspects)),
                })
    return {"locations": locations}
