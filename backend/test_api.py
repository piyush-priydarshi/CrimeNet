import urllib.request, json

def get(path):
    r = urllib.request.urlopen(f"http://localhost:8000{path}")
    return json.loads(r.read())

def post(path, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(f"http://localhost:8000{path}", data=body, headers={"Content-Type": "application/json"}, method="POST")
    r = urllib.request.urlopen(req)
    return json.loads(r.read())

d = get("/sample-data")
print(f"[OK] /sample-data: {len(d['reports'])} reports")

result = post("/process", {"reports": d["reports"]})
g = result["graph"]
print(f"[OK] /process: {result['reports_processed']} reports, {len(g['nodes'])} nodes, {len(g['links'])} links")

inf = get("/influencers")
top3 = [e["label"] for e in inf["influencers"][:3]]
print(f"[OK] /influencers: top 3 = {top3}")

alerts = get("/alerts")
crit = [a for a in alerts["alerts"] if a["severity"] == "CRITICAL"]
high = [a for a in alerts["alerts"] if a["severity"] == "HIGH"]
print(f"[OK] /alerts: {len(alerts['alerts'])} total | {len(crit)} CRITICAL | {len(high)} HIGH")
if crit:
    print(f"     CRITICAL: {crit[0]['entity']} — {crit[0]['reason'][:80]}...")

q = post("/query", {"question": "Who connects Case 3 and Case 7?"})
print(f"[OK] /query answer: {q['answer'][:150]}")

brief = get("/brief")
print(f"[OK] /brief: {brief['title']}")
print(f"     Key finding: {brief['key_finding'][:100]}")

geo = get("/geo")
print(f"[OK] /geo: {len(geo['locations'])} locations")

tip = post("/simulate-tip", {})
print(f"[OK] /simulate-tip: '{tip['tip']['title']}'")
print(f"     Graph after tip: {len(tip['graph']['nodes'])} nodes, {len(tip['graph']['links'])} links")

print("\n[PASS] ALL ENDPOINTS VERIFIED OK")
