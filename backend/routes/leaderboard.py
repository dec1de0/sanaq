from fastapi import APIRouter, Query
import datetime
import hashlib

router = APIRouter()

# Real leaderboard data — 100 players with wins and win ratio
_RAW = [
    (1,  "nevertoobsy4u",          2708, 100.00),
    (2,  "ngaaketeandrews",         1434,  98.90),
    (3,  "DennyC",                  1425,  99.65),
    (4,  "APONGT&Q",                1391, 100.00),
    (5,  "euanwd",                   882, 100.00),
    (6,  "Kalin",                    829,  98.11),
    (7,  "elyzcastro1",              777, 100.00),
    (8,  "Grandpaw",                 734, 100.00),
    (9,  "kalimbaglueck",            508,  99.41),
    (10, "BranstonNoodles",          465, 100.00),
    (11, "fuangadi",                 430,  99.54),
    (12, "grandpaw60",               376, 100.00),
    (13, "Nay Bando",                366,  99.73),
    (14, "alvaparra10",              361,  98.63),
    (15, "FENIX",                    295,  99.33),
    (16, "athenagarcia.knotion",     282,  97.24),
    (17, "henry",                    276, 100.00),
    (18, "peggygib",                 256,  92.75),
    (19, "ron",                      222,  99.55),
    (20, "roger.rondon",             217,  98.64),
    (21, "Pat",                      198,  89.19),
    (22, "chaamankumar0007",         184,  93.40),
    (23, "Piranesi",                 181, 100.00),
    (24, "jman896",                  175,  96.69),
    (25, "james",                    163, 100.00),
    (26, "ciuciulitza",              157,  95.73),
    (27, "hannah289437",             146, 100.00),
    (28, "Black Powder Bo",          142, 100.00),
    (29, "seanpatrickgatelyjr",      132,  97.78),
    (30, "warrenjennyjanett",        132,  92.96),
    (31, "mann-kuljit",              116,  96.67),
    (32, "Kuljit Mann",              109,  98.20),
    (33, "DBCooper",                 107,  95.54),
    (34, "marg",                     106, 100.00),
    (35, "jam.bupp",                 105,  86.78),
    (36, "hernan.alperin",           101,  99.02),
    (37, "tac0bellhipster",          100,  97.09),
    (38, "raw3903",                   93, 100.00),
    (39, "castillobaby2019",          92, 100.00),
    (40, "sylvie.gendreau27",         92, 100.00),
    (41, "Luggga",                    85,  98.84),
    (42, "sawat",                     85,  92.39),
    (43, "somaiasaleh2",              78, 100.00),
    (44, "etothsbf",                  74,  83.15),
    (45, "DokuDoku",                  70, 100.00),
    (46, "braidedowl",                69, 100.00),
    (47, "Pam",                       68,  98.55),
    (48, "IndieWooWoo",               61,  96.83),
    (49, "cherylahoffman52",          61,  84.72),
    (50, "dorthabailey1969",          59,  95.16),
    (51, "Claire DiFrance",           56,  41.79),
    (52, "davidfin2",                 54,  87.10),
    (53, "Phil",                      50,  96.15),
    (54, "terrybaeder",               49,  94.23),
    (55, "hhung514",                  44,  95.65),
    (56, "sayedabdelrahim30",         40, 100.00),
    (57, "oreo6404",                  39, 100.00),
    (58, "marilyn.tremain",           37, 100.00),
    (59, "spiderwings0828",           36,  97.30),
    (60, "greg4940",                  31, 100.00),
    (61, "melisa.ch291208",           31,  96.88),
    (62, "Billatw",                   31,  93.94),
    (63, "Zyfer",                     30,  90.91),
    (64, "cladclad",                  28,  90.32),
    (65, "Mary",                      28,  70.00),
    (66, "Mikoto55",                  28,  47.46),
    (67, "lexi",                      27, 100.00),
    (68, "camshizzle",                25, 100.00),
    (69, "bonnieamoran",              25,  80.65),
    (70, "cedricawash",               24,  96.00),
    (71, "christina.jarvis1991",      24,  72.73),
    (72, "Jacki",                     24,  58.54),
    (73, "johnnyfug",                 23,  44.23),
    (74, "claudiu.v.oprea",           22,  95.65),
    (75, "mzladylaine",               22,  95.65),
    (76, "mario",                     22,  91.67),
    (77, "cptkirkp13",                21,  77.78),
    (78, "dougobaldwin",              20, 100.00),
    (79, "Ginette",                   20,  86.96),
    (80, "K V V S S J",              20,  86.96),
    (81, "vmkhemka",                  20,  80.00),
    (82, "kaytekirby",                20,  71.43),
    (83, "Vanco",                     19, 100.00),
    (84, "colinscarlett08",           19, 100.00),
    (85, "leomareza1002",             18, 100.00),
    (86, "barbieuxchristian2",        17, 100.00),
    (87, "envy",                      17, 100.00),
    (88, "fred",                      16, 100.00),
    (89, "roseann11",                 16, 100.00),
    (90, "afg123afg124",              16, 100.00),
    (91, "JoMo",                      16,  94.12),
    (92, "ANNIE M",                   16,  21.62),
    (93, "Joann",                     15, 100.00),
    (94, "Geoff Glass",               15,  83.33),
    (95, "dbrcameron",                14, 100.00),
    (96, "abourami60",                14, 100.00),
    (97, "kohruixuan7",               14,  93.33),
    (98, "M KENT PROCTO",            14,  56.00),
    (99, "mikichus",                  13, 100.00),
    (100,"Hriskata1616",              13,  56.52),
]

_CITIES = [
    "New York", "London", "Toronto", "Sydney", "Los Angeles", "Chicago",
    "Melbourne", "Vancouver", "Dublin", "Singapore", "Amsterdam", "Paris",
    "Berlin", "Tokyo", "Seoul", "Bangkok", "Istanbul", "Cairo", "Lagos",
    "Mumbai", "Almaty", "Astana", "Shymkent", "Karaganda",
]


def _h(username: str) -> int:
    return int(hashlib.md5(username.encode()).hexdigest(), 16)


def _build_entry(rank: int, username: str, wins: int, win_ratio_pct: float) -> dict:
    h = _h(username)
    # games derived from real data
    games = round(wins / (win_ratio_pct / 100)) if win_ratio_pct > 0 else wins
    # avg_time: top rank ≈ 120 s, rank 100 ≈ 440 s, plus small hash jitter
    base_avg = 120 + (rank - 1) * 3.2
    avg_time = int(base_avg + (h % 40) - 20)
    avg_time = max(90, avg_time)
    # best_time: 65–80 % of avg
    best_time = int(avg_time * (0.65 + (h % 16) / 100))
    # streak: higher wins → longer streak, capped by hash variation
    streak = max(1, min(wins // 10, 180) + (h % 15))
    city = _CITIES[h % len(_CITIES)]
    return {
        "rank": rank,
        "username": username,
        "city": city,
        "games": games,
        "wins": wins,
        "win_ratio": round(win_ratio_pct, 2),
        "avg_time": avg_time,
        "best_time": best_time,
        "streak": streak,
    }


_LEADERBOARD = [_build_entry(r, p, w, wr) for r, p, w, wr in _RAW]


@router.get("/global")
def global_lb(limit: int = Query(50, le=100)):
    return {"leaderboard": _LEADERBOARD[:limit], "total": len(_LEADERBOARD)}


@router.get("/daily")
def daily_lb():
    today = datetime.date.today().isoformat()
    # Daily: shuffle order slightly by hash of (username + today)
    def daily_score(e):
        h = _h(e["username"] + today)
        return -(e["wins"] + h % 20)
    daily = sorted(_LEADERBOARD, key=daily_score)
    for i, e in enumerate(daily):
        e = dict(e)
        e["rank"] = i + 1
        daily[i] = e
    return {"date": today, "leaderboard": daily[:50]}


@router.get("/city")
def city_lb(city: str = Query("New York")):
    city_entries = [e for e in _LEADERBOARD if e["city"].lower() == city.lower()]
    reranked = [dict(e, rank=i + 1) for i, e in enumerate(city_entries)]
    return {"city": city, "leaderboard": reranked}
