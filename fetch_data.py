"""API-FootballからJ1の順位と得点/アシストランキングを取得し data.json に保存する。"""
import json, os, sys, datetime, urllib.request

KEY = os.environ.get("API_FOOTBALL_KEY") or sys.exit("環境変数 API_FOOTBALL_KEY がありません")
LEAGUE = 98                                   # J1 League
SEASON = int(os.environ.get("SEASON", "2026"))  # 2026-27シーズンは 2026

JP = {  # API上の英語名 -> (日本語名, 略称)
 "Vissel Kobe": ("ヴィッセル神戸", "神戸"), "Kashiwa Reysol": ("柏レイソル", "柏"),
 "Sanfrecce Hiroshima": ("サンフレッチェ広島", "広島"), "Machida Zelvia": ("FC町田ゼルビア", "町田"),
 "FC Tokyo": ("FC東京", "FC東京"), "Yokohama F. Marinos": ("横浜F・マリノス", "横浜FM"),
 "Kawasaki Frontale": ("川崎フロンターレ", "川崎F"), "Kashima Antlers": ("鹿島アントラーズ", "鹿島"),
 "Fagiano Okayama": ("ファジアーノ岡山", "岡山"), "Urawa Reds": ("浦和レッズ", "浦和"),
 "Cerezo Osaka": ("セレッソ大阪", "C大阪"), "Shimizu S-Pulse": ("清水エスパルス", "清水"),
 "Mito Hollyhock": ("水戸ホーリーホック", "水戸"), "Kyoto Sanga": ("京都サンガF.C.", "京都"),
 "V-Varen Nagasaki": ("V・ファーレン長崎", "長崎"), "Gamba Osaka": ("ガンバ大阪", "G大阪"),
 "Nagoya Grampus": ("名古屋グランパス", "名古屋"), "Avispa Fukuoka": ("アビスパ福岡", "福岡"),
 "Tokyo Verdy": ("東京ヴェルディ", "東京V"), "JEF United Chiba": ("ジェフユナイテッド千葉", "千葉"),
}
def jp(name):
    if name not in JP:
        print(f"警告: 日本語名が未登録のクラブ: {name}（JPに追加してください）")
    return JP.get(name, (name, name))

def get(path):
    req = urllib.request.Request("https://v3.football.api-sports.io" + path,
                                 headers={"x-apisports-key": KEY})
    with urllib.request.urlopen(req, timeout=30) as r:
        d = json.load(r)
    if d.get("errors"):
        sys.exit(f"APIエラー: {d['errors']}")
    return d["response"]

res = get(f"/standings?league={LEAGUE}&season={SEASON}")
table = res[0]["league"]["standings"][0] if res else []
if len(table) < 10:
    sys.exit("順位データが取得できませんでした。data.json は更新しません。")

wdl = lambda x: [x["win"], x["draw"], x["lose"]]
teams = []
for t in table:
    n, c = jp(t["team"]["name"])
    a = t["all"]
    teams.append(dict(n=n, c=c, w=a["win"], d=a["draw"], l=a["lose"],
                      gf=a["goals"]["for"], ga=a["goals"]["against"],
                      f=(t.get("form") or "")[::-1],   # APIは古い順 → 新しい順に反転
                      h=wdl(t["home"]), a=wdl(t["away"])))

def leaders(path, key):
    out = []
    for p in get(path)[:5]:
        st = p["statistics"][0]
        out.append([p["player"]["name"], jp(st["team"]["name"])[1], st["goals"][key] or 0])
    return out

data = dict(
    updated=datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).strftime("%Y-%m-%d %H:%M JST"),
    teams=teams,
    goals=leaders(f"/players/topscorers?league={LEAGUE}&season={SEASON}", "total"),
    assists=leaders(f"/players/topassists?league={LEAGUE}&season={SEASON}", "assists"),
)
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
print("data.json を更新しました:", data["updated"])
