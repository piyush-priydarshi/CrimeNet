import re
import spacy

nlp = None

def load_model():
    global nlp
    if nlp is None:
        try:
            nlp = spacy.load("en_core_web_sm")
        except OSError:
            import subprocess, sys
            subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"], check=True)
            nlp = spacy.load("en_core_web_sm")
    return nlp

PHONE_RE = re.compile(r"\b[6-9]\d{9}\b")
VEHICLE_RE = re.compile(r"\b[A-Z]{2}-\d{2}-[A-Z]{1,3}-\d{4}\b")
ID_RE = re.compile(r"\b(RPT-\d{3})\b")

KNOWN_ORGS = [
    "Red Crescent Syndicate", "TechVault Solutions", "BlueShield Logistics",
    "SunriseExport Pvt Ltd", "PrimeLand Ventures",
]

def extract_entities(text: str, report_id: str) -> dict:
    model = load_model()
    doc = model(text)

    persons, locations, orgs = set(), set(), set()
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            persons.add(ent.text.strip())
        elif ent.label_ in ("GPE", "LOC", "FAC"):
            locations.add(ent.text.strip())
        elif ent.label_ == "ORG":
            orgs.add(ent.text.strip())

    for org in KNOWN_ORGS:
        if org.lower() in text.lower():
            orgs.add(org)

    phones = set(PHONE_RE.findall(text))
    vehicles = set(VEHICLE_RE.findall(text))

    return {
        "report_id": report_id,
        "persons": sorted(persons),
        "locations": sorted(locations),
        "organizations": sorted(orgs),
        "phones": sorted(phones),
        "vehicles": sorted(vehicles),
    }
