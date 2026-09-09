import networkx as nx
from collections import defaultdict
try:
    from community import best_partition
except ImportError:
    best_partition = None


G = nx.Graph()
_entity_reports: dict[str, list[str]] = defaultdict(list)
_report_entities: dict[str, list[str]] = defaultdict(list)


def reset():
    G.clear()
    _entity_reports.clear()
    _report_entities.clear()


def _node_id(entity_type: str, value: str) -> str:
    return f"{entity_type}::{value.strip()}"


def add_entities(extraction: dict):
    report_id = extraction["report_id"]
    type_map = {
        "persons": "person",
        "locations": "location",
        "organizations": "organization",
        "phones": "phone",
        "vehicles": "vehicle",
    }
    nodes_this_report = []
    for field, etype in type_map.items():
        for val in extraction.get(field, []):
            nid = _node_id(etype, val)
            if not G.has_node(nid):
                G.add_node(nid, label=val, type=etype, reports=[report_id], weight=1)
            else:
                G.nodes[nid]["reports"] = list(set(G.nodes[nid].get("reports", []) + [report_id]))
                G.nodes[nid]["weight"] = G.nodes[nid].get("weight", 1) + 0.5
            _entity_reports[nid].append(report_id)
            nodes_this_report.append(nid)
            if report_id not in _report_entities[report_id]:
                _report_entities[report_id].append(nid)

    # Co-occurrence edges
    for i, a in enumerate(nodes_this_report):
        for b in nodes_this_report[i + 1:]:
            if G.has_edge(a, b):
                G[a][b]["weight"] = G[a][b].get("weight", 1) + 1
                G[a][b]["reports"] = list(set(G[a][b].get("reports", []) + [report_id]))
            else:
                G.add_edge(a, b, weight=1, reports=[report_id])


def safe_pagerank(graph, alpha=0.85, max_iter=100, tol=1e-6):
    if len(graph) == 0:
        return {}
    try:
        return nx.pagerank(graph, alpha=alpha, max_iter=max_iter, tol=tol)
    except Exception:
        nodes = list(graph.nodes())
        N = len(nodes)
        if N == 0:
            return {}
        p = {n: 1.0 / N for n in nodes}
        for _ in range(max_iter):
            p_last = p.copy()
            p = {n: (1.0 - alpha) / N for n in nodes}
            for n in nodes:
                nbrs = list(graph.neighbors(n))
                deg = len(nbrs)
                if deg > 0:
                    share = alpha * p_last[n] / deg
                    for nbr in nbrs:
                        p[nbr] += share
            err = sum(abs(p[n] - p_last[n]) for n in nodes)
            if err < tol:
                break
        total = sum(p.values()) or 1.0
        return {k: v / total for k, v in p.items()}


def compute_analytics() -> dict:
    if len(G) == 0:
        return {"nodes": [], "links": []}

    degree = dict(nx.degree_centrality(G))
    between = nx.betweenness_centrality(G, normalized=True)
    pagerank = safe_pagerank(G, alpha=0.85)

    communities = {}
    if best_partition and len(G) > 0:
        try:
            partition = best_partition(G)
            communities = partition
        except Exception:
            pass

    nodes = []
    for nid, data in G.nodes(data=True):
        nodes.append({
            "id": nid,
            "label": data.get("label", nid),
            "type": data.get("type", "unknown"),
            "reports": data.get("reports", []),
            "degree": round(degree.get(nid, 0), 4),
            "betweenness": round(between.get(nid, 0), 4),
            "pagerank": round(pagerank.get(nid, 0), 4),
            "community": communities.get(nid, 0),
            "weight": data.get("weight", 1),
        })

    links = []
    for a, b, data in G.edges(data=True):
        links.append({
            "source": a,
            "target": b,
            "weight": data.get("weight", 1),
            "reports": data.get("reports", []),
        })

    return {"nodes": nodes, "links": links}


def get_influencers(top_n: int = 10) -> list:
    if len(G) == 0:
        return []
    degree = dict(nx.degree_centrality(G))
    between = nx.betweenness_centrality(G, normalized=True)
    pagerank = safe_pagerank(G, alpha=0.85)

    scores = []
    for nid, data in G.nodes(data=True):
        d, b, p = degree.get(nid, 0), between.get(nid, 0), pagerank.get(nid, 0)
        composite = d * 0.3 + b * 0.4 + p * 0.3
        reports = data.get("reports", [])
        reason = _build_reason(nid, data, d, b, p, reports)
        scores.append({
            "id": nid,
            "label": data.get("label", nid),
            "type": data.get("type", "unknown"),
            "degree": round(d, 4),
            "betweenness": round(b, 4),
            "pagerank": round(p, 4),
            "composite": round(composite, 4),
            "reports": reports,
            "reason": reason,
        })
    scores.sort(key=lambda x: x["composite"], reverse=True)
    return scores[:top_n]


def _build_reason(nid, data, d, b, p, reports):
    label = data.get("label", nid)
    etype = data.get("type", "entity")
    parts = []
    if len(reports) > 1:
        parts.append(f"appears in {len(reports)} separate cases ({', '.join(reports)})")
    if b > 0.1:
        parts.append("acts as a key bridge between unrelated clusters")
    if d > 0.3:
        parts.append(f"directly connected to {int(d * (len(G) - 1))} other entities")
    if p > 0.05:
        parts.append("receives high influence from well-connected nodes (PageRank)")
    if not parts:
        parts.append("notable connection density within its cluster")
    return f"{label} ({etype}) — " + "; ".join(parts) + "."


def get_alerts() -> list:
    alerts = []

    # Shared phone across multiple people/cases
    for nid, data in G.nodes(data=True):
        if data.get("type") == "phone" and len(data.get("reports", [])) > 1:
            neighbors = list(G.neighbors(nid))
            persons = [n for n in neighbors if G.nodes[n].get("type") == "person"]
            if len(persons) >= 2:
                alerts.append({
                    "type": "SHARED_PHONE",
                    "severity": "HIGH",
                    "entity": data.get("label"),
                    "related": [G.nodes[p].get("label") for p in persons],
                    "reports": data.get("reports", []),
                    "reason": f"Phone {data['label']} linked to {len(persons)} different persons across cases {', '.join(data['reports'])}. Indicates coordinated communication.",
                })

    # Bridge entity: high betweenness connecting separate clusters
    between = nx.betweenness_centrality(G, normalized=True)
    for nid, score in between.items():
        if score > 0.15:
            data = G.nodes[nid]
            alerts.append({
                "type": "BRIDGE_ENTITY",
                "severity": "CRITICAL",
                "entity": data.get("label"),
                "related": [],
                "reports": data.get("reports", []),
                "reason": f"{data.get('label')} has betweenness centrality of {score:.2f}, meaning removing this node would fragment the network into disconnected sub-networks. High-value target.",
            })

    # Vehicle appearing in multiple case locations
    for nid, data in G.nodes(data=True):
        if data.get("type") == "vehicle" and len(data.get("reports", [])) > 1:
            alerts.append({
                "type": "VEHICLE_MULTI_CASE",
                "severity": "MEDIUM",
                "entity": data.get("label"),
                "related": [],
                "reports": data.get("reports", []),
                "reason": f"Vehicle {data['label']} appears across cases {', '.join(data['reports'])}. Possible logistics node.",
            })

    # Organization appearing in multiple cases
    for nid, data in G.nodes(data=True):
        if data.get("type") == "organization" and len(data.get("reports", [])) > 1:
            alerts.append({
                "type": "ORG_MULTI_CASE",
                "severity": "HIGH",
                "entity": data.get("label"),
                "related": [],
                "reports": data.get("reports", []),
                "reason": f"Organization '{data['label']}' appears in {len(data['reports'])} cases ({', '.join(data['reports'])}). Possible criminal front.",
            })

    return alerts


def answer_query(question: str) -> str:
    q = question.lower()

    # Find entities mentioned in question
    mentioned = []
    for nid, data in G.nodes(data=True):
        label = data.get("label", "").lower()
        if label and label in q:
            mentioned.append((nid, data))

    # "who connects X and Y" pattern
    if ("connect" in q or "link" in q or "bridge" in q) and len(mentioned) >= 2:
        a_id, a_data = mentioned[0]
        b_id, b_data = mentioned[1]
        try:
            path = nx.shortest_path(G, a_id, b_id)
            path_labels = [G.nodes[n].get("label", n) for n in path]
            return (
                f"The shortest connection between {a_data['label']} and {b_data['label']} "
                f"runs through {len(path)-2} intermediate node(s): "
                f"{' → '.join(path_labels)}. "
                f"This suggests a {len(path)-1}-hop indirect relationship."
            )
        except nx.NetworkXNoPath:
            return f"No direct path found between {a_data['label']} and {b_data['label']} in the current network."

    # "who is most influential" / "top suspect"
    if any(w in q for w in ["influential", "important", "central", "top", "suspect", "key"]):
        top = get_influencers(3)
        if top:
            names = [f"{e['label']} ({e['type']})" for e in top]
            return f"The top influential entities are: {', '.join(names)}. {top[0]['reason']}"

    # "how many cases" for a person
    if mentioned:
        nid, data = mentioned[0]
        reports = data.get("reports", [])
        neighbors = list(G.neighbors(nid))
        neighbor_labels = [G.nodes[n].get("label") for n in neighbors[:5]]
        return (
            f"{data['label']} ({data.get('type', 'entity')}) appears in {len(reports)} case(s): "
            f"{', '.join(reports)}. Connected to: {', '.join(neighbor_labels)}."
        )

    # Alerts summary
    if any(w in q for w in ["alert", "flag", "suspicious", "danger", "risk"]):
        alerts = get_alerts()
        if alerts:
            top = alerts[:3]
            return "Top flagged entities: " + "; ".join([f"{a['entity']} ({a['type']})" for a in top]) + "."

    if len(G) == 0:
        return "No graph data loaded yet. Please generate sample data first."

    return (
        f"The network currently has {G.number_of_nodes()} entities and {G.number_of_edges()} relationships "
        f"across {len(set(r for n, d in G.nodes(data=True) for r in d.get('reports', [])))} cases. "
        f"Try asking: 'Who connects Case 3 and Case 7?' or 'Who is the most influential entity?'"
    )
