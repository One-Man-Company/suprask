# metodininkas — 2026-11-07T0820

- paleidimas: #33 (manual)
- trukmė: 676s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/p33_open.py
│ @@ -0,0 +1,15 @@
│ +import json, glob, os, sys
│ +
│ +root = '/home/zoltanas/workspace/suprask/agents/proposals'
│ +rows = []
│ +for f in sorted(glob.glob(os.path.join(root, '*.json'))):
│ +    try:
│ +        d = json.load(open(f))
│ +    except Exception as e:
│ +        print('PARSE-ERR', f, e)
│ +        continue
│ +    if d.get('status') == 'new':
│ +        rows.append((d.get('created', ''), os.path.basename(f), d.get('type'), d.get('priority'), d.get('role'), d.get('title'), d.get('target')))
│ +rows.sort()
│ +for r in rows:
│ +    print(' | '.join(str(x) for x in r))
│ profiles/deepseek41flash/cache/scratch/crossref_p33.py
│ @@ -0,0 +1,21 @@
│ +import json, urllib.parse, urllib.request
│ +
│ +queries = [
│ +    "Right-left orientation: Development of correct use of right and left terms Rigal",
│ +    "Piaget's mountains revisited: Changes in the egocentric landscape Borke",
│ +    "Discrimination of left and right and development of the logic of relations Harris",
│ +    "Children's understanding of left-right relations perspective taking",
│ +]
│ +for q in queries:
│ +    url = "https://api.crossref.org/works?rows=3&select=DOI,title,author,issued,container-title&query.bibliographic=" + urllib.parse.quote(q)
│ +    req = urllib.request.Request(url, headers={"User-Agent": "suprask-agent/1.0 (mailto:agent@example.invalid)"})
│ +    try:
│ +        data = json.load(urllib.request.urlopen(req, timeout=30))
│ +    except Exception as e:
│ +        print("ERR", q, e)
│ +        continue
│ +    print("\nQUERY:", q)
│ +    for it in data["message"]["items"]:
│ +        auth = ", ".join((a.get("family", "") + " " + a.get("given", "")).strip() for a in it.get("author", [])[:4])
│ +        yr = it.get("issued", {}).get("date-parts", [[None]])[0][0]
│ +        print(f"  - {it.get('title',[''])[0][:110]} | {auth} | {yr} | {it.get('container-title',[''])[0][:60]} | https://doi.org/{it['DOI']}")
│ profiles/deepseek41flash/cache/scratch/openalex_p33.py
│ @@ -0,0 +1,28 @@
│ +import json, urllib.request
│ +
│ +dois = [
│ +    "10.2466/pms.1996.83.3.831",
│ +    "10.2466/pms.1994.79.3.1259",
│ +    "10.1037/h0076459",
│ +    "10.2466/pms.1979.48.1.223",
│ +]
│ +for doi in dois:
│ +    url = "https://api.openalex.org/works/https://doi.org/" + doi
│ +    req = urllib.request.Request(url, headers={"User-Agent": "suprask-agent/1.0 (mailto:agent@example.invalid)"})
│ +    try:
│ +        w = json.load(urllib.request.urlopen(req, timeout=30))
│ +    except Exception as e:
│ +        print("ERR", doi, e)
│ +        continue
│ +    inv = w.get("abstract_inverted_index") or {}
│ +    pos = {}
│ +    for word, idxs in inv.items():
│ +        for i in idxs:
│ +            pos[i] = word
│ +    abstract = " ".join(pos[i] for i in sorted(pos))
│ +    print("\n===", doi)
│ +    print("TITLE:", w.get("title"))
│ +    print("YEAR:", w.get("publication_year"), "| VENUE:", (w.get("primary_location") or {}).get("source", {}).get("display_name") if w.get("primary_location") else None)
│ +    print("AUTHORS:", ", ".join(a["author"]["display_name"] for a in w.get("authorships", [])))
│ +    print("CITED_BY:", w.get("cited_by_count"))
│ +    print("ABSTRACT:", abstract[:1400] if abstract else "(none)")
│ profiles/deepseek41flash/cache/scratch/biblio_p33.py
│ @@ -0,0 +1,29 @@
│ +import json, urllib.request, urllib.parse
│ +
│ +def show(doi):
│ +    url = "https://api.openalex.org/works/https://doi.org/" + doi
│ +    req = urllib.request.Request(url, headers={"User-Agent": "suprask-agent/1.0 (mailto:agent@example.invalid)"})
│ +    try:
│ +        w = json.load(urllib.request.urlopen(req, timeout=30))
│ +    except Exception as e:
│ +        print("ERR", doi, e)
│ +        return
│ +    b = w.get("biblio", {})
│ +    print(f"{doi} | {w.get('title')} | {w.get('publication_year')} | vol {b.get('volume')} iss {b.get('issue')} pp {b.get('first_page')}-{b.get('last_page')}")
│ +
│ +for d in ["10.1037/h0076459", "10.2466/pms.1996.83.3.831", "10.2466/pms.1994.79.3.1259", "10.2466/pms.1979.48.1.223"]:
│ +    show(d)
│ +
│ +for q in ["No, your other left! Language children use to direct robots Kocher",
│ +          "Unraveling the contribution of left-right language on spatial perspective taking Abarbanell Li"]:
│ +    url = "https://api.crossref.org/works?rows=2&select=DOI,title,author,issued,container-title,volume,page&query.bibliographic=" + urllib.parse.quote(q)
│ +    req = urllib.request.Request(url, headers={"User-Agent": "suprask-agent/1.0 (mailto:agent@example.invalid)"})
│ +    try:
│ +        data = json.load(urllib.request.urlopen(req, timeout=30))
│ +    except Exception as e:
│ +        print("ERR", q, e); continue
│ +    print("\nQUERY:", q)
│ +    for it in data["message"]["items"]:
│ +        auth = ", ".join(a.get("family", "") for a in it.get("author", [])[:4])
│ +        yr = it.get("issued", {}).get("date-parts", [[None]])[0][0]
│ +        print(f"  - {it.get('title',[''])[0][:120]} | {auth} | {yr} | {it.get('container-title',[''])[0][:70]} | vol {it.get('volume')} pp {it.get('page')} | https://doi.org/{it['DOI']}")
│ profiles/deepseek41flash/cache/scratch/abs_p33.py
│ @@ -0,0 +1,17 @@
│ +import json, urllib.request
│ +
│ +for doi in ["10.1080/13875868.2020.1825442", "10.1109/icdl-epirob48136.2020.9278108"]:
│ +    url = "https://api.openalex.org/works/https://doi.org/" + doi
│ +    req = urllib.request.Request(url, headers={"User-Agent": "suprask-agent/1.0 (mailto:agent@example.invalid)"})
│ +    try:
│ +        w = json.load(urllib.request.urlopen(req, timeout=30))
│ +    except Exception as e:
│ +        print("ERR", doi, e); continue
│ +    inv = w.get("abstract_inverted_index") or {}
│ +    pos = {}
│ +    for word, idxs in inv.items():
│ +        for i in idxs:
│ +            pos[i] = word
│ +    abstract = " ".join(pos[i] for i in sorted(pos))
│ +    print("\n===", doi, "|", w.get("title"), "|", w.get("publication_year"))
│ +    print(abstract[:1600] if abstract else "(no abstract)")
│ research/wiki/foundations/kryptis-ir-ziurovo-pozicija.md
│ @@ -0,0 +1,61 @@
│ +---
│ +title: "Kryptis ir žiūrovas: kodėl „kairė“ nepriklauso kambariui"
│ +tipas: fundamentai
│ +temos: [kryptys, orientacija, erdvinis mąstymas, perspektyva, simuliacijos]
│ +amzius: "6-9"
│ +atnaujinta: 2026-11-07
│ +saltiniai: 7
│ +---
│ +
│ +# Kryptis ir žiūrovas: kodėl „kairė“ nepriklauso kambariui
│ +
│ +## Pagrindinė idėja
│ +
│ +Žodžiai „kairė“ ir „dešinė“ nėra kambario savybė. Jie priklauso **kūnui**, o kūnas turi priekį. Todėl pasisukus pasisuka ir kairė, o žmogui atsisukus į tave jo kairė atsiduria tavo dešinėje. Kol vaikas to nepastebi, jis kairę laiko fiksuota ekrano ar kambario puse ir kito žmogui priskiria savo paties pusę.
│ +
│ +Tai ne smulkmena, o sąlyga, be kurios nesuprantama nė viena krypties komanda: „pasisuk į kairę“ reiškia skirtingą judesį priklausomai nuo to, į ką žiūri tas, kuris suka.
│ +
│ +## Ką rodo tyrimai
│ +
│ +**Žodžių tvarka skiriasi nuo suvokimo tvarkos.** Rigal (1994) tyrė 406 vaikus nuo 5 iki 11 metų. Skirti kairę nuo dešinės ir atpažinti simetriškus ženklus vaikai išmoksta gerokai anksčiau negu **pavartoti žodžius**. Žodžius „kairė“ ir „dešinė“ jie pradeda teisingai taikyti savo kūnui maždaug nuo septynerių metų, paskui — žmogui, žiūrinčiam **ta pačia kryptimi**, ir tik 8–9 metų — žmogui, žiūrinčiam **į juos**. Net vienuolikos metų pusė tiriamųjų žodžių kitiems žmonėms dar netaikė tinkamai.
│ +
│ +**Priešingas žvilgsnis yra sunkiausias atvejis.** Rigal (1996) su tais pačiais 406 vaikais atskyrė tris dalykus: atvaizdo atpažinimą, kairės/dešinės įvardijimą ir mintinį sukimą. Atvaizdą atpažinti sekėsi net mažiausiems. Kairės/dešinės įvardijimas buvo sunkus net vyriausiems, kai reikėjo mintyse pasukti. Kai reikėjo pasakyti, ką mato į vaiką atsisukęs žmogus, mažiausi rinkosi taip, tarsi tas žmogus matytų **iš jų pačių pozicijos**; ši dalis mažėjo su amžiumi, bet net 11-mečių teisingai atsakė tik pusė. Dalis vaikų suprato, kad kryptis pasikeitė, bet nesiejo to su kairės/dešinės padėtimi atvaizde.
│ +
│ +**„Pasukti“ vaikams reiškia ne tą patį.** Way ir Cartwright (2024) individualiai kalbino 36 pirmokus. Tik keturi visiškai teisingai atliko abi užduotis, penki negalėjo įvykdyti nė vieno krypties nurodymo, o dauguma robotui komandų „kairėn“/„dešinėn“ iš viso nesakė — rodė gestais arba sakė „eik ten“. Vaikai tą patį žodį „pasuk“ suprato įvairiai: vieni pasisuko vietoje, kiti žengė į šoną. Tai ne vien kalbos trūkumas — pati instrukcija turi du skirtingus kūno veiksmus.
│ +
│ +**Gestas ateina prieš žodį.** Kocher ir kt. (2020) analizavo 38 vaikų nuo 4 iki 9 metų nurodymus robotui: rodymas ir gestai su amžiumi mažėjo, o „kairė/dešinė“ ir atstumai — didėjo. Vadinasi, 6–7 metų vaiko mostas į pusę yra amžių atitinkantis atsakymas, o ne klaida. Abarbanell ir Li (2021) rado, kad kairės/dešinės supratimas siejasi su tų žodžių vartojimu, o gestų mokymas 10–13 metų vaikams davė **patikimesnį** pagerėjimą negu žodžių žymėjimas.
│ +
│ +**Nesėkmė dar neįrodo egocentrizmo.** Borke (1975) parodė, kad supaprastinus užduotį (vietoj trijų kalnų — pažįstami daiktai, viena figūra) net trejų metų vaikai atsako ne iš savo pozicijos. Perspektyvos užduoties sunkumas labiau priklauso nuo **užduoties sandaros** negu nuo vaiko savybės. Todėl iš klaidos negalima daryti išvados „vaikas dar egoistas“, o modelį reikia daryti kuo paprastesnį.
│ +
│ +**Vienas objektas yra sunkiausias atvejis.** Phinney ir Nummedal (1979) nustatė, kad kairės/dešinės apsukimas yra sunkesnis už priekio/galo apsukimą, kai masyve vienas objektas, bet su dviem objektais santykis apsiverčia. Paprasta išvada dizainui: jei norima parodyti būtent kairės/dešinės apsukimą, reikia **vieno** veikėjo ir vienos sąsajos, o ne kelių daiktų scenos.
│ +
│ +## Ką tai reiškia SUPRASK platformai
│ +
│ +1. **Seka privalo atitikti įsisavinimo tvarką.** Savo kūnas → veikėjas, žiūrintis ta pačia kryptimi → veikėjas, žiūrintis į vaiką. Pradėti nuo sunkiausio atvejo reiškia prašyti vaiko to, ko jis dar neturi.
│ +2. **Modelis turi rodyti žymę ant kūno, o ne užrašą ekrane.** Jei „kairė“ parašyta fiksuotoje ekrano pusėje, modelis moko būtent tos klaidos, kurią turi griauti. Žymė (apyrankė, kortelė) sukasi kartu su veikėju.
│ +3. **Posūkis ir žingsnis atskiriami vaizdu ir žodžiu.** Posūkis vyksta vietoje — veikėjas lieka tame pačiame langelyje. Be to, vaikas pats savaime gali suprasti „pasuk“ kaip „ženk į šoną“ (Way ir Cartwright, 2024).
│ +4. **Vienas veikėjas ir viena sąsaja.** Jokio tinklelio adreso (B1, C3), jokio priekio/galo matmens tame pačiame modulyje — tai antros sąvokos (Phinney ir Nummedal, 1979; `docs/SVIETIMAS-1-GAIRES.md` T1.2).
│ +5. **Gestas priimamas kaip pirmas atsakymas.** Užduotyse atsakymai žodžiu, bet mokytojo veikloje be ekrano pirmiausia rodoma ranka. Vaikas, kuris parodo, o ne pasako, nėra „neįsisavinęs“.
│ +6. **Tikslas formuluojamas kukliai.** 6–7 metais kito žmogaus kairės įvardijimas dar tik formuojasi (Rigal, 1994; 1996). Modulis siekia, kad vaikas **pastebėtų priklausomybę nuo žiūrovo**, o ne kad be klaidų nustatytų kito kairę. Formuluotė „visada teisingai nustatau kito žmogaus kairę“ būtų neteisinga.
│ +7. **Klaida nepaaiškinama vaiko savybe.** Grįžtamasis ryšys įvardija veiksmą („tu pasirinkai savo pusę“), o ne vaiką (Borke, 1975; T5.1).
│ +
│ +## Ko šis įrašas nedaro
│ +
│ +Jis neįrodo, kad simuliacija perkelia orientacijos įgūdį į tikrą erdvę — tokio tyrimo apie šį modelį nėra. Jis taip pat nepateisina kairės/dešinės mokymo kaip savitikslios temos: modulis prasmingas tik tada, kai kryptis siejama su komanda „pasisuk“ ir su kito žmogaus pozicija. Ryšys su tinklelio adresu ir komandų seka (Bee-Bot tipo uždaviniai) lieka atskiriems moduliams.
│ +
│ +## Susieti
│ +
│ +- [[kognityvine-apkrova]] — kodėl vienas veikėjas ir viena sąsaja
│ +- [[simuliacijos-ir-modeliai]] — modelio ribų pasakymas, konkretybės nykimas
│ +- [[interaktyvumo-principai]] — grįžtamasis ryšys, taikiniai, jokių laikmačių
│ +- [[../grades/01/metodai|1 klasės metodai]] — M-04 „Kryptys: kairė priklauso nuo žiūrovo“
│ +
│ +## Šaltiniai
│ +
│ +1. Rigal, R. (1994). Right-left orientation: Development of correct use of right and left terms. *Perceptual and Motor Skills, 79*(3), 1259–1278. https://doi.org/10.2466/pms.1994.79.3.1259
│ +2. Rigal, R. (1996). Right-left orientation, mental rotation, and perspective-taking: When can children imagine what people see from their own viewpoint? *Perceptual and Motor Skills, 83*(3), 831–842. https://doi.org/10.2466/pms.1996.83.3.831
│ +3. Phinney, J. S., & Nummedal, S. G. (1979). Effects of left-right orientation and position reversals on spatial perspective taking in young children. *Perceptual and Motor Skills, 48*(1), 223–227. https://doi.org/10.2466/pms.1979.48.1.223
│ +4. Borke, H. (1975). Piaget's mountains revisited: Changes in the egocentric landscape. *Developmental Psychology, 11*(2), 240–243. https://doi.org/10.1037/h0076459
│ +5. Way, J., & Cartwright, K. (2024). Turn left, turn right: An embodied perspective on children's difficulties with left/right spatial orientations. *MERGA 46 Quick Reads*. http://merga.net.au/wp-content/uploads/2024/09/6-MERGA-46-2024-Quick-Reads_Way-and-Cartwright.pdf
│ +6. Kocher, D., Sarmiento, L., Heller, S., Yang, Y., Kushnir, T., & Green, K. E. (2020). No, your other left! Language children use to direct robots. *2020 Joint IEEE 10th International Conference on Development and Learning and Epigenetic Robotics (ICDL-EpiRob)*, 1–6. https://doi.org/10.1109/icdl-epirob48136.2020.9278108
│ +7. Abarbanell, L., & Li, P. (2021). Unraveling the contribution of left-right language on spatial perspective taking. *Spatial Cognition & Computation, 21*(1), 1–38. https://doi.org/10.1080/13875868.2020.1825442
│ research/wiki/foundations/README.md
│ @@ -12,6 +12,7 @@
│  | [[interaktyvumo-principai]] | UI 6–7 metų vaikams, taikiniai, grįžtamasis ryšys | ≥48 px, jokių laikmačių, klaida ne aklavietė |
│  | [[zenklas-kaip-busena]] | lygybės ženklas kaip būsena, operaciniai šablonai, modelio išdėstymas | modelis rodo abi lygybės kryptis ir bent vieną atvejį be vieno skaičiaus pusėje |
│  | [[dydis-ir-skaicius]] | dydis ir kiekis prieš užrašytą vertę, moneta kaip pavyzdys | jei daiktas neša skaičių, modelis parodo jo poveikį atskirai; grafika neprieštarauja taisyklei |
│ +| [[kryptis-ir-ziurovo-pozicija]] | kairė/dešinė kaip kūno, o ne kambario savybė; įsisavinimo tvarka | seka: savo kūnas → veikėjas žiūri ta pačia kryptimi → žiūri į vaiką; žymė sukasi su kūnu |
│  | [[ivertinimas-ir-growth-mindset]] | grįžtamasis ryšys, augimo mąstysena ir jos ribos | `hint` + `why` privalomi, jokių balų |
│
│  ## Žaidimų teorijos dalis
│ research/wiki/grades/01/metodai.md
│ @@ -199,6 +199,73 @@
│
│  **Šaltiniai.** Berti, A. E., & Bombi, A. S. (1981). The development of the concept of money and its value: A longitudinal study. *Child Development, 52*(4), 1179–1182. https://doi.org/10.2307/1129504 · Strauss, A. L. (1952). The development and transformation of monetary meanings in the child. *American Sociological Review, 17*(3), 275–286. https://doi.org/10.2307/2088073 · Hasegawa, K. (2020). The size-value compatibility effect. *Scientific Reports, 10*, 62419. https://doi.org/10.1038/s41598-020-62419-8 · Edmunds, G. J., & Whitehurst, K. (1973). *The emergence and development of monetary concepts in young children* (ERIC ED087553). https://eric.ed.gov/?id=ED087553 · Tracy, D. M., & Fanelli, B. H. (2000). *Teaching money concepts: Are we shortchanging our kids?* (ERIC ED451065). https://eric.ed.gov/?id=ED451065 · Europos Komisija. *Common sides of euro coins* (techninės specifikacijos). https://economy-finance.ec.europa.eu/euro/euro-coins-and-notes/euro-coins/common-sides-euro-coins_en · EUR-Lex. *Denominations and technical specifications of euro coins*. https://eur-lex.europa.eu/EN/legal-content/summary/denominations-and-technical-specifications-of-euro-coins.html
│
│ +### M-04 — Kryptys: kairė priklauso nuo žiūrovo
│ +
│ +**Data:** 2026-11-07 · **Tema:** `agents/proposals/2026-11-04-ideator-kryptys.json` · **Tikslas:** `content/lt/grade-01/matematika/17-kryptys-ir-vieta.json` · **Šaltinis:** `research/wiki/foundations/kryptis-ir-ziurovo-pozicija.md`
│ +
│ +**Viena didelė idėja.** Kairė ir dešinė priklauso ne kambariui, o kūnui. Kai žmogus atsisuka į tave, jo kairė atsiduria tavo dešinėje.
│ +
│ +**Kodėl modelis, o ne sakinys.** Sakinys „kito žmogaus kairė yra tavo dešinėje“ reikalauja žodžių, kurių pirmokas dar neturi. Rigal (1994), tyręs 406 vaikus nuo 5 iki 11 metų, rado tokią tvarką: žodžius „kairė“ ir „dešinė“ vaikai pradeda teisingai taikyti savo kūnui apie septintus metus, paskui — žmogui, žiūrinčiam ta pačia kryptimi, ir tik 8–9 metais — žmogui, žiūrinčiam į juos. Net vienuolikos metų pusė tiriamųjų žodžių kitiems žmonėms dar netaikė tinkamai. Pavelkslėlis čia nepadės: jame nematyti, kad pusė priklauso nuo to, kas žiūri. Tai parodo tik veikėjas, kurį vaikas pats pasuka.
│ +
│ +**Tikslas sąmoningai kuklus.** Modulis nesiekia, kad pirmokas be klaidų nustatytų kito žmogaus kairę. Rigal (1996) su tais pačiais 406 vaikais parodė, kad net 11-mečiai, kai žmogus žiūri į juos, teisingai atsako tik pusėje atvejų, o mažiausi atsakinėja taip, tarsi kitas matytų iš jų pačių pozicijos. Modulio tikslas — kad vaikas **pastebėtų priklausomybę** ir turėtų būdą pasitikrinti (atsisukti, įsivaizduoti save kito vietoje).
│ +
│ +**Klaidingos nuostatos ir kaip jos paneigiamos.**
│ +
│ +1. **„Kairė visiems ta pati pusė.“** Vaikas savo kairę perkelia veikėjui, kuris žiūri į jį. Rigal (1996) šį atsakymo būdą aprašo kaip būdingą mažiausiems ir nykstantį su amžiumi. Paneigiama pačiu modeliu: vabaliukui atsisukus į vaiką, žymė „kairė“ persoka į kitą ekrano pusę. Jei kairė būtų kambario savybė, posūkis jos nepajudintų.
│ +2. **„Pasukti į kairę visada reiškia į kairę ekrano pusę.“** Tai ta pati klaida, tik apie komandą. Kai vabaliukas žiūri į vaiką, „Pasuk kairėn“ veda į dešinę ekrano pusę. Paneigiama dviem būsenomis, kurias vaikas pasiekia pats.
│ +3. **„Pasukti reiškia žengti į šoną.“** Way ir Cartwright (2024) individualiai kalbino 36 pirmokus: tik keturi visiškai teisingai atliko abi užduotis, penki negalėjo įvykdyti nė vieno krypties nurodymo, o dauguma robotui komandų „kairėn“/„dešinėn“ iš viso nesakė — rodė gestais arba sakė „eik ten“. Tą patį žodį „pasuk“ vaikai suprato skirtingai: vieni pasisuko vietoje, kiti žengė į šoną. Todėl modelyje posūkis vyksta **vietoje** (vabaliukas lieka tame pačiame langelyje), o žingsnis yra atskiras mygtukas su atskiru sakiniu.
│ +4. **„Jei nemoka, vadinasi, dar per mažas.“** Borke (1975) parodė, kad supaprastinus perspektyvos užduotį net trejų metų vaikai atsako ne vien iš savo pozicijos. Nesėkmė labiau priklauso nuo užduoties sandaros negu nuo vaiko savybės, todėl modelis sąmoningai paprastas: vienas veikėjas, viena sąsaja, trys ant trijų langeliai.
│ +
│ +**Seka (konkretumas → modelis → simbolis → perkėlimas).**
│ +
│ +1. **Kūnas.** Mokytojas užmauna popierinę apyrankę ant vaiko kairiojo riešo. Vaikas pasisuka vietoje 180 laipsnių kampu ir atsako: „Ar apyrankė liko toje pačioje kambario pusėje?“ Ne — ranka liko ta pati, pasikeitė tik kambario pusė. Tikslas: žodis priklauso kūnui, o kūnas turi priekį.
│ +2. **Ekranas, lengvas atvejis.** Vabaliukas 3 × 3 tinklelyje žiūri nuo vaiko (aukštyn). Ant kairės priekinės kojos — apyrankė, šalia — žymė „kairė“. Vaikas spaudžia „Pasuk kairėn“ / „Pasuk dešinėn“; žymė sukasi kartu su kūnu, o vabaliukas lieka tame pačiame langelyje. Tikslas: pamatyti, kad žymė pritvirtinta prie kūno, o ne prie ekrano, ir kad posūkis neperkelia.
│ +3. **Simbolis, sunkus atvejis.** Vaikas pasuka vabaliuką į save. Žymė atsiduria dešinėje ekrano pusėje, o `api.readout` pasako: „Vabaliukas žiūri į tave. Jo kairė — tavo dešinėje.“ Vaikas pakartoja sakinį balsu ir parodydamas. Tikslas: santykį įvardyti žodžiais, kai jis jau matytas.
│ +4. **Perkėlimas.** Mokytoja stovi priešais klasę ir prašo pakelti dešinę ranką; du vaikai, stovintys vienas priešais kitą, abu pasuka į savo kairę. Tikslas: taikyti taisyklę be modelio, kai žiūrovas yra tikras žmogus.
│ +
│ +**Privalomas spėjimo žingsnis prieš pirmą judesį.** `api.readout` pradžioje: „Vabaliukas žiūri nuo tavęs. Kur bus jo kairė, kai jis atsisuks į tave? Pasakyk, tada pasuk.“ Vaikas atsako balsu, tada sukasi. Be spėjimo vaikas gali sukti tol, kol žymė „atrodys teisingai“, ir sąryšio nesudaryti — tas pats pavojus kaip M-01–M-03 (`research/wiki/foundations/sujungti-dydziai.md`). Atsakymo variantų ekrane nėra: kintamasis turi likti vienas, o spėjimas tikrinamas žodžiu ir vėliau — užduotyse be modelio.
│ +
│ +**Simuliacijos specifikacija.** Komponentas `vabaliukas-ir-kryptys`, `assets/js/sims/matematika.js`, `config: { "size": 3, "start": { "col": 1, "row": 1, "facing": "up" }, "leaf": { "col": 0, "row": 0 }, "sentences": { ... } }`.
│ +
│ +| Būsena | Ką rodo | `readout` | `api.note` |
│ +|---|---|---|---|
│ +| pradžia (`facing = up`) | vabaliukas viduriniame langelyje, atgręžtas nugara, apyrankė kairėje kojoje, žymė „kairė“ kairėje | „Vabaliukas žiūri nuo tavęs. Jo kairė — kairėje.“ | „Pasukimas vyksta vietoje: jis lieka tame pačiame langelyje.“ |
│ +| `facing = right` | žymė viršuje | „Vabaliukas žiūri į dešinę. Jo kairė — viršuje.“ | „Kairė pasisuko kartu su juo.“ |
│ +| `facing = down` (į vaiką) | žymė dešinėje ekrano pusėje | „Vabaliukas žiūri į tave. Jo kairė — tavo dešinėje.“ | „Jis žiūri į tave, todėl jo kairė yra kitoje pusėje.“ |
│ +| `facing = left` | žymė apačioje | „Vabaliukas žiūri į kairę. Jo kairė — apašoje.“ | „Ta pati kairė, tik kita kryptis.“ |
│ +| žingsnis atliktas | naujas langelis, kryptis ta pati, apyrankė toje pačioje kūno pusėje | „Žengė vieną langelį į priekį.“ | „Žingsnis eina į priekį, ne į šoną.“ |
│ +| kraštas | vabaliukas nejuda, „Žingsnis“ neaktyvus | „Toliau tinklelio nėra.“ | „Pasuk ir bandyk kita kryptimi.“ |
│ +| lapas pasiektas | lapas po vabaliuku | „Pasiekei lapą.“ | „Dabar pasuk jį į save ir pasakyk, kur jo kairė.“ |
│ +
│ +- **Vienas kintamasis:** `facing` ∈ {`up`, `right`, `down`, `left`}. Vaikas keičia tik tai, į ką vabaliukas žiūri. `Žingsnis` kintamojo nekeičia — jis parodo krypties pasekmę; pozicija atstatoma mygtuku „Iš naujo“.
│ +- **Tinklelis:** 3 × 3, langelis 88 px, tarpas 8 px → 280 px, telpa į 328 px turinio plotį. Vabaliukas 48 px, krypties rodyklė 12 px.
│ +- **Kairės žymė:** užpildytas žiedas ant kairės priekinės kojos (forma, ne vien spalva) ir kortelė „kairė“, pritvirtinta prie kūno. Kortelė sukasi kartu su vabaliuku; spalva niekada nėra vienintelis informacijos nešėjas.
│ +- **Įėjimai:** „Pasuk kairėn“ ir „Pasuk dešinėn“ po 104 × 56 px, „Žingsnis pirmyn“ 328 × 56 px, „Iš naujo“ ≥ 48 px. Klaviatūra: `←`/`→` sukasi, `↑`/`Space` žengia, `R` atstato. Visiems mygtukams `aria-label`.
│ +- **Posūkis:** 200 ms sukimasis vietoje; `prefers-reduced-motion` — būsena pasikeičia iš karto. Jokių laikmačių, ėjimų limito, „game over“; kraštas yra informacija, ne bauda.
│ +- **Grįžtamasis ryšys** — iškart po veiksmo (≤ 1 kadras). `readout` įvardija tik būseną, `api.note` — vieną sakinį apie veiksmą. `api.progress({ correct: true })` — vieną kartą, kai pasiektas lapas **ir** vabaliukas bent kartą žiūrėjo į vaiką (bet kokia tvarka).
│ +- **Garsas** — septynios nustatytos frazės, lygiai tokios kaip `readout` lentelėje. `api.note` garsiai neskaitomas (mažas `scripts/check_audio.py` manifestas). Generuojant reikia abiejų variantų (`n`, `s`).
│ +- **Prieinamumas:** scenos SVG `role="img"`, `aria-label` aprašo padėtį ir apyrankę, bet nekartoja `readout` sakinio: „Vabaliukas viduriniame langelyje, žiūri į tave. Apyrankė ant kairės priekinės kojos.“ `readout` turi `aria-live="polite"`.
│ +- **Modelio sąžiningumas ekrane:** vabaliukas turi aiškų priekį (galva ir krypties rodyklė), o jo kūnas simetriškas — todėl kairę parodo tik apyrankė ir žymė. Be jų modelis būtų dviprasmis, todėl žymė nerodoma tik tada, kai ji netelpa (niekada).
│ +
│ +**Užduotys.**
│ +
│ +| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
│ +|---|---|---|---|---|---|
│ +| 1 | atpažinimas | „Vabaliukas žiūri į tave. Kurioje ekrano pusėje yra jo kairė?“ — Kairėje / Dešinėje / Virš jo galvos | Dešinėje (1) | „Kairėje“ — savo kairę perkelia veikėjui | „Prisimink, kur atsidūrė apyrankė, kai jis atsisuko į tave.“ |
│ +| 2 | taikymas | „Vabaliukas žiūri į dešinę. Jis pasisuka į kairę. Į kurią pusę jis dabar žiūri?“ — Į apačią / Į viršų / Į kairę | Į viršų (1) | „Į kairę“ — suka ekrano kryptimi, ne kūno atžvilgiu | „Pasisukimas vyksta vietoje. Įsivaizduok, kad stovi jo vietoje ir žiūri į dešinę.“ |
│ +| 3 | perkėlimas | „Mokytoja stovi priešais klasę ir sako: „Pakelkite dešinę ranką.“ Kurioje klasės pusėje yra jos dešinė?“ — Mano dešinėje / Abiejose pusėse / Mano kairėje | Mano kairėje (2) | „Mano dešinėje“ — priskiria mokytojai savo pusę | „Ji žiūri į tave. Prisimink vabaliuką, kuris atsisuko į tave.“ |
│ +| 4 | praplėtimas (`optional: true`) | „Du vaikai stovi vienas priešais kitą. Abu pasuka į savo kairę. Ar jie žiūri į tą pačią pasaulio pusę?“ — Ne, į priešingas puses / Taip, į tą pačią / Ne, vienas atsisuko atgal | Ne, į priešingas puses (0) | „Taip“ — kairę laiko pasaulio savybe | „Kiekvienas suka savo kūno atžvilgiu. Jie stovi priešingomis kryptimis.“ |
│ +
│ +**Refleksija.** „Kaip sužinai, kuri pusė yra kito žmogaus kairė? Pasakyk, ką darai su savo kūnu.“ Klausiama žodžiu, nevertinama; laukiamas atsakymas — atsisukti, įsivaizduoti save kito vietoje arba sekti apyrankę.
│ +
│ +**Modelio ribos (pasakomos vaikui ir mokytojui).** Modelis rodo vieną veikėją 3 × 3 tinklelyje ir tik kairę/dešinę. Priekis/atgal ir tinklelio adresas (B1, C3) sąmoningai neįtraukti — tai antros sąvokos, o Phinney ir Nummedal (1979) rodo, kad su vienu objektu kairės/dešinės apsukimas ir taip yra sunkiausias atvejis. Modelis neįrodo įgūdžio: Rigal (1994, 1996) duomenys rodo, kad kito žmogaus kairę vaikai pradeda taikyti 8–9 metais, o 11-mečiai tebeklysta. Todėl teisingas atsakymas modulyje nėra „įvaldymo“ įrodymas, o klaida — ne vaiko savybė: Borke (1975) parodė, kad perspektyvos užduoties sunkumas labiau priklauso nuo užduoties negu nuo vaiko.
│ +
│ +**Ką tai reiškia modulio autoriui.** `title` — „Kryptys: kairė priklauso nuo žiūrovo“ (36 simboliai); `subtitle` — „Ta pati pusė atsiduria kitoje vietoje, kai žiūri į tave“ (57); `minutes` — 9; trys `outcomes`: „Parodau, kuri pusė yra mano kairė.“, „Pasuku veikėją ir pasakau, kur atsiduria jo kairė.“, „Paaiškinu, kodėl kito žmogaus kairė yra mano dešinėje.“; `concept.title` — „Kairė priklauso nuo žiūrovo“ (28); `concept.big_idea` — „Kairė ir dešinė priklauso ne kambariui, o kūnui. Kai žmogus atsisuka į tave, jo kairė atsiduria tavo dešinėje.“ (117); `concept.steps` — keturi žingsniai iš sekos 1–4; `concept.example` — „Mokytoja stovi priešais klasę. Jos dešinė ranka yra tavo kairėje pusėje.“; `teacher.offline` — apyrankė ant riešo, vaikai poromis atsisuka vienas į kitą ir rodo savo kairę, tada mokytoja priešais klasę kelia dešinę; `teacher.misconceptions` — keturios nuostatos iš šio skyriaus; `sim` — `{ "component": "vabaliukas-ir-kryptys", "config": { "size": 3, "start": { "col": 1, "row": 1, "facing": "up" }, "leaf": { "col": 0, "row": 0 } } }`. Numeris `17-` laisvas. Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/index.json` ir `path.json` (kūrėjo ar dizainerio darbas, ne metodo dalis); siūloma vieta kelyje — iškart po `06-figuros`, nes orientacija remiasi figūros padėtimi.
│ +
│ +**Skaičių tikslinimas.** Ideatoriaus pasiūlyme rašoma „36 pirmokų tyrime 27–28 žinojo, kuri jų kairė, bet tik 6 teisingai nurodė robotui posūkius kairėn ir dešinėn“. Way ir Cartwright (2024) tekste tokių skaičių nėra: ten sakoma, kad tik **keturi** vaikai visiškai teisingai atliko abi užduotis, **penki** negalėjo įvykdyti nė vieno krypties nurodymo, o dauguma komandų kairėn/dešinėn robotui iš viso nesakė. Metodas remiasi šaltinio skaičiais, o ne pasiūlymo santrauka.
│ +
│ +**Šaltiniai.** Rigal, R. (1994). Right-left orientation: Development of correct use of right and left terms. *Perceptual and Motor Skills, 79*(3), 1259–1278. https://doi.org/10.2466/pms.1994.79.3.1259 · Rigal, R. (1996). Right-left orientation, mental rotation, and perspective-taking. *Perceptual and Motor Skills, 83*(3), 831–842. https://doi.org/10.2466/pms.1996.83.3.831 · Phinney, J. S., & Nummedal, S. G. (1979). Effects of left-right orientation and position reversals on spatial perspective taking in young children. *Perceptual and Motor Skills, 48*(1), 223–227. https://doi.org/10.2466/pms.1979.48.1.223 · Borke, H. (1975). Piaget's mountains revisited. *Developmental Psychology, 11*(2), 240–243. https://doi.org/10.1037/h0076459 · Way, J., & Cartwright, K. (2024). Turn left, turn right. *MERGA 46 Quick Reads*. http://merga.net.au/wp-content/uploads/2024/09/6-MERGA-46-2024-Quick-Reads_Way-and-Cartwright.pdf · Kocher, D., Sarmiento, L., Heller, S., Yang, Y., Kushnir, T., & Green, K. E. (2020). No, your other left! *IEEE ICDL-EpiRob 2020*, 1–6. https://doi.org/10.1109/icdl-epirob48136.2020.9278108 · Abarbanell, L., & Li, P. (2021). Unraveling the contribution of left-right language on spatial perspective taking. *Spatial Cognition & Computation, 21*(1), 1–38. https://doi.org/10.1080/13875868.2020.1825442
│ +
│  ## Atviros prielaidos
│
│  - _(kas šioje klasėje dar nepatikrinta; žr. [[../../guidelines/klausimai|klausimus]])_
│ research/wiki/grades/01/metodai.md
│ @@ -205,7 +205,7 @@
│
│  **Viena didelė idėja.** Kairė ir dešinė priklauso ne kambariui, o kūnui. Kai žmogus atsisuka į tave, jo kairė atsiduria tavo dešinėje.
│
│ -**Kodėl modelis, o ne sakinys.** Sakinys „kito žmogaus kairė yra tavo dešinėje“ reikalauja žodžių, kurių pirmokas dar neturi. Rigal (1994), tyręs 406 vaikus nuo 5 iki 11 metų, rado tokią tvarką: žodžius „kairė“ ir „dešinė“ vaikai pradeda teisingai taikyti savo kūnui apie septintus metus, paskui — žmogui, žiūrinčiam ta pačia kryptimi, ir tik 8–9 metais — žmogui, žiūrinčiam į juos. Net vienuolikos metų pusė tiriamųjų žodžių kitiems žmonėms dar netaikė tinkamai. Pavelkslėlis čia nepadės: jame nematyti, kad pusė priklauso nuo to, kas žiūri. Tai parodo tik veikėjas, kurį vaikas pats pasuka.
│ +**Kodėl modelis, o ne sakinys.** Sakinys „kito žmogaus kairė yra tavo dešinėje“ reikalauja žodžių, kurių pirmokas dar neturi. Rigal (1994), tyręs 406 vaikus nuo 5 iki 11 metų, rado tokią tvarką: žodžius „kairė“ ir „dešinė“ vaikai pradeda teisingai taikyti savo kūnui apie septintus metus, paskui — žmogui, žiūrinčiam ta pačia kryptimi, ir tik 8–9 metais — žmogui, žiūrinčiam į juos. Net vienuolikos metų pusė tiriamųjų žodžių kitiems žmonėms dar netaikė tinkamai. Paveikslėlis čia nepadės: jame nematyti, kad pusė priklauso nuo to, kas žiūri. Tai parodo tik veikėjas, kurį vaikas pats pasuka.
│
│  **Tikslas sąmoningai kuklus.** Modulis nesiekia, kad pirmokas be klaidų nustatytų kito žmogaus kairę. Rigal (1996) su tais pačiais 406 vaikais parodė, kad net 11-mečiai, kai žmogus žiūri į juos, teisingai atsako tik pusėje atvejų, o mažiausi atsakinėja taip, tarsi kitas matytų iš jų pačių pozicijos. Modulio tikslas — kad vaikas **pastebėtų priklausomybę** ir turėtų būdą pasitikrinti (atsisukti, įsivaizduoti save kito vietoje).
│
│ research/wiki/grades/01/metodai.md
│ @@ -232,7 +232,7 @@
│  | pradžia (`facing = up`) | vabaliukas viduriniame langelyje, atgręžtas nugara, apyrankė kairėje kojoje, žymė „kairė“ kairėje | „Vabaliukas žiūri nuo tavęs. Jo kairė — kairėje.“ | „Pasukimas vyksta vietoje: jis lieka tame pačiame langelyje.“ |
│  | `facing = right` | žymė viršuje | „Vabaliukas žiūri į dešinę. Jo kairė — viršuje.“ | „Kairė pasisuko kartu su juo.“ |
│  | `facing = down` (į vaiką) | žymė dešinėje ekrano pusėje | „Vabaliukas žiūri į tave. Jo kairė — tavo dešinėje.“ | „Jis žiūri į tave, todėl jo kairė yra kitoje pusėje.“ |
│ -| `facing = left` | žymė apačioje | „Vabaliukas žiūri į kairę. Jo kairė — apašoje.“ | „Ta pati kairė, tik kita kryptis.“ |
│ +| `facing = left` | žymė apačioje | „Vabaliukas žiūri į kairę. Jo kairė — apačioje.“ | „Ta pati kairė, tik kita kryptis.“ |
│  | žingsnis atliktas | naujas langelis, kryptis ta pati, apyrankė toje pačioje kūno pusėje | „Žengė vieną langelį į priekį.“ | „Žingsnis eina į priekį, ne į šoną.“ |
│  | kraštas | vabaliukas nejuda, „Žingsnis“ neaktyvus | „Toliau tinklelio nėra.“ | „Pasuk ir bandyk kita kryptimi.“ |
│  | lapas pasiektas | lapas po vabaliuku | „Pasiekei lapą.“ | „Dabar pasuk jį į save ir pasakyk, kur jo kairė.“ |
│ research/wiki/grades/01/metodai.md
│ @@ -245,7 +245,7 @@
│  - **Grįžtamasis ryšys** — iškart po veiksmo (≤ 1 kadras). `readout` įvardija tik būseną, `api.note` — vieną sakinį apie veiksmą. `api.progress({ correct: true })` — vieną kartą, kai pasiektas lapas **ir** vabaliukas bent kartą žiūrėjo į vaiką (bet kokia tvarka).
│  - **Garsas** — septynios nustatytos frazės, lygiai tokios kaip `readout` lentelėje. `api.note` garsiai neskaitomas (mažas `scripts/check_audio.py` manifestas). Generuojant reikia abiejų variantų (`n`, `s`).
│  - **Prieinamumas:** scenos SVG `role="img"`, `aria-label` aprašo padėtį ir apyrankę, bet nekartoja `readout` sakinio: „Vabaliukas viduriniame langelyje, žiūri į tave. Apyrankė ant kairės priekinės kojos.“ `readout` turi `aria-live="polite"`.
│ -- **Modelio sąžiningumas ekrane:** vabaliukas turi aiškų priekį (galva ir krypties rodyklė), o jo kūnas simetriškas — todėl kairę parodo tik apyrankė ir žymė. Be jų modelis būtų dviprasmis, todėl žymė nerodoma tik tada, kai ji netelpa (niekada).
│ +- **Modelio sąžiningumas ekrane:** vabaliukas turi aiškų priekį (galva ir krypties rodyklė), o jo kūnas simetriškas — todėl kairę parodo tik apyrankė ir žymė. Be jų modelis būtų dviprasmis, todėl žymė rodoma visada, taip pat ir tada, kai vabaliukas pasuktas į vaiką.
│
│  **Užduotys.**
│
│ research/wiki/grades/01/metodai.md
│ @@ -218,7 +218,7 @@
│
│  **Seka (konkretumas → modelis → simbolis → perkėlimas).**
│
│ -1. **Kūnas.** Mokytojas užmauna popierinę apyrankę ant vaiko kairiojo riešo. Vaikas pasisuka vietoje 180 laipsnių kampu ir atsako: „Ar apyrankė liko toje pačioje kambario pusėje?“ Ne — ranka liko ta pati, pasikeitė tik kambario pusė. Tikslas: žodis priklauso kūnui, o kūnas turi priekį.
│ +1. **Kūnas.** Ant vaiko kairiojo riešo užmaunama popierinė apyrankė. Vaikas pasisuka vietoje 180 laipsnių kampu ir atsako: „Ar apyrankė liko toje pačioje kambario pusėje?“ Ne — ranka liko ta pati, pasikeitė tik kambario pusė. Tikslas: žodis priklauso kūnui, o kūnas turi priekį.
│  2. **Ekranas, lengvas atvejis.** Vabaliukas 3 × 3 tinklelyje žiūri nuo vaiko (aukštyn). Ant kairės priekinės kojos — apyrankė, šalia — žymė „kairė“. Vaikas spaudžia „Pasuk kairėn“ / „Pasuk dešinėn“; žymė sukasi kartu su kūnu, o vabaliukas lieka tame pačiame langelyje. Tikslas: pamatyti, kad žymė pritvirtinta prie kūno, o ne prie ekrano, ir kad posūkis neperkelia.
│  3. **Simbolis, sunkus atvejis.** Vaikas pasuka vabaliuką į save. Žymė atsiduria dešinėje ekrano pusėje, o `api.readout` pasako: „Vabaliukas žiūri į tave. Jo kairė — tavo dešinėje.“ Vaikas pakartoja sakinį balsu ir parodydamas. Tikslas: santykį įvardyti žodžiais, kai jis jau matytas.
│  4. **Perkėlimas.** Mokytoja stovi priešais klasę ir prašo pakelti dešinę ranką; du vaikai, stovintys vienas priešais kitą, abu pasuka į savo kairę. Tikslas: taikyti taisyklę be modelio, kai žiūrovas yra tikras žmogus.
│ research/wiki/grades/01/metodai.md
│ @@ -3,7 +3,7 @@
│  tipas: metodai
│  klase: 1
│  amzius: "6–7"
│ -atnaujinta: 2026-11-06
│ +atnaujinta: 2026-11-07
│  ---
│
│  # 1 klasės metodai
│ profiles/deepseek41flash/cache/scratch/check_m04.py
│ @@ -0,0 +1,58 @@
│ +# -*- coding: utf-8 -*-
│ +import re
│ +
│ +PATH = "/home/zoltanas/workspace/suprask/research/wiki/grades/01/metodai.md"
│ +text = open(PATH, encoding="utf-8").read()
│ +i = text.index("### M-04")
│ +section = text[i:text.index("## Atviros prielaidos", i)]
│ +
│ +checks = {
│ +    "title": "Kryptys: kairė priklauso nuo žiūrovo",
│ +    "subtitle": "Ta pati pusė atsiduria kitoje vietoje, kai žiūri į tave",
│ +    "concept.title": "Kairė priklauso nuo žiūrovo",
│ +    "concept.big_idea": "Kairė ir dešinė priklauso ne kambariui, o kūnui. Kai žmogus atsisuka į tave, jo kairė atsiduria tavo dešinėje.",
│ +}
│ +for k, v in checks.items():
│ +    print(f"{k}: {len(v)} simb.")
│ +
│ +# readout / note strings: sentence word counts
│ +print("\n-- sakinių ilgiai (žodžiai) --")
│ +strings = [
│ +    "Vabaliukas žiūri nuo tavęs. Jo kairė — kairėje.",
│ +    "Pasukimas vyksta vietoje: jis lieka tame pačiame langelyje.",
│ +    "Vabaliukas žiūri į dešinę. Jo kairė — viršuje.",
│ +    "Kairė pasisuko kartu su juo.",
│ +    "Vabaliukas žiūri į tave. Jo kairė — tavo dešinėje.",
│ +    "Jis žiūri į tave, todėl jo kairė yra kitoje pusėje.",
│ +    "Vabaliukas žiūri į kairę. Jo kairė — apačioje.",
│ +    "Ta pati kairė, tik kita kryptis.",
│ +    "Žengė vieną langelį į priekį.",
│ +    "Žingsnis eina į priekį, ne į šoną.",
│ +    "Toliau tinklelio nėra.",
│ +    "Pasuk ir bandyk kita kryptimi.",
│ +    "Pasiekei lapą.",
│ +    "Dabar pasuk jį į save ir pasakyk, kur jo kairė.",
│ +    "Vabaliukas žiūri nuo tavęs. Kur bus jo kairė, kai jis atsisuks į tave? Pasakyk, tada pasuk.",
│ +    "Parodau, kuri pusė yra mano kairė.",
│ +    "Pasuku veikėją ir pasakau, kur atsiduria jo kairė.",
│ +    "Paaiškinu, kodėl kito žmogaus kairė yra mano dešinėje.",
│ +    "Mokytoja stovi priešais klasę. Jos dešinė ranka yra tavo kairėje pusėje.",
│ +    "Kaip sužinai, kuri pusė yra kito žmogaus kairė? Pasakyk, ką darai su savo kūnu.",
│ +    "Vabaliukas žiūri į tave. Kurioje ekrano pusėje yra jo kairė?",
│ +    "Vabaliukas žiūri į dešinę. Jis pasisuka į kairę. Į kurią pusę jis dabar žiūri?",
│ +    "Mokytoja stovi priešais klasę ir sako: „Pakelkite dešinę ranką.“ Kurioje klasės pusėje yra jos dešinė?",
│ +    "Du vaikai stovi vienas priešais kitą. Abu pasuka į savo kairę. Ar jie žiūri į tą pačią pasaulio pusę?",
│ +]
│ +bad = []
│ +for s in strings:
│ +    parts = [p.strip() for p in re.split(r"[.?!]+\s*", s) if p.strip()]
│ +    for p in parts:
│ +        n = len(p.split())
│ +        if n > 10:
│ +            bad.append((n, p))
│ +    print(f"  {max(len(p.split()) for p in parts):2d} | {s}")
│ +print("\n>10 žodžių:", bad if bad else "nėra")
│ +
│ +print("\n-- dvigubi tarpai / įtartini simboliai --")
│ +for pat in ["  ", "apaš", "Pavelks", "žymė nerodoma"]:
│ +    print(repr(pat), section.count(pat))
│ research/wiki/grades/01/metodai.md
│ @@ -260,7 +260,7 @@
│
│  **Modelio ribos (pasakomos vaikui ir mokytojui).** Modelis rodo vieną veikėją 3 × 3 tinklelyje ir tik kairę/dešinę. Priekis/atgal ir tinklelio adresas (B1, C3) sąmoningai neįtraukti — tai antros sąvokos, o Phinney ir Nummedal (1979) rodo, kad su vienu objektu kairės/dešinės apsukimas ir taip yra sunkiausias atvejis. Modelis neįrodo įgūdžio: Rigal (1994, 1996) duomenys rodo, kad kito žmogaus kairę vaikai pradeda taikyti 8–9 metais, o 11-mečiai tebeklysta. Todėl teisingas atsakymas modulyje nėra „įvaldymo“ įrodymas, o klaida — ne vaiko savybė: Borke (1975) parodė, kad perspektyvos užduoties sunkumas labiau priklauso nuo užduoties negu nuo vaiko.
│
│ -**Ką tai reiškia modulio autoriui.** `title` — „Kryptys: kairė priklauso nuo žiūrovo“ (36 simboliai); `subtitle` — „Ta pati pusė atsiduria kitoje vietoje, kai žiūri į tave“ (57); `minutes` — 9; trys `outcomes`: „Parodau, kuri pusė yra mano kairė.“, „Pasuku veikėją ir pasakau, kur atsiduria jo kairė.“, „Paaiškinu, kodėl kito žmogaus kairė yra mano dešinėje.“; `concept.title` — „Kairė priklauso nuo žiūrovo“ (28); `concept.big_idea` — „Kairė ir dešinė priklauso ne kambariui, o kūnui. Kai žmogus atsisuka į tave, jo kairė atsiduria tavo dešinėje.“ (117); `concept.steps` — keturi žingsniai iš sekos 1–4; `concept.example` — „Mokytoja stovi priešais klasę. Jos dešinė ranka yra tavo kairėje pusėje.“; `teacher.offline` — apyrankė ant riešo, vaikai poromis atsisuka vienas į kitą ir rodo savo kairę, tada mokytoja priešais klasę kelia dešinę; `teacher.misconceptions` — keturios nuostatos iš šio skyriaus; `sim` — `{ "component": "vabaliukas-ir-kryptys", "config": { "size": 3, "start": { "col": 1, "row": 1, "facing": "up" }, "leaf": { "col": 0, "row": 0 } } }`. Numeris `17-` laisvas. Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/index.json` ir `path.json` (kūrėjo ar dizainerio darbas, ne metodo dalis); siūloma vieta kelyje — iškart po `06-figuros`, nes orientacija remiasi figūros padėtimi.
│ +**Ką tai reiškia modulio autoriui.** `title` — „Kryptys: kairė priklauso nuo žiūrovo“ (36 simboliai); `subtitle` — „Ta pati pusė atsiduria kitoje vietoje, kai žiūri į tave“ (55); `minutes` — 9; trys `outcomes`: „Parodau, kuri pusė yra mano kairė.“, „Pasuku veikėją ir pasakau, kur atsiduria jo kairė.“, „Paaiškinu, kodėl kito žmogaus kairė yra mano dešinėje.“; `concept.title` — „Kairė priklauso nuo žiūrovo“ (27); `concept.big_idea` — „Kairė ir dešinė priklauso ne kambariui, o kūnui. Kai žmogus atsisuka į tave, jo kairė atsiduria tavo dešinėje.“ (110); `concept.steps` — keturi žingsniai iš sekos 1–4; `concept.example` — „Mokytoja stovi priešais klasę. Jos dešinė ranka yra tavo kairėje pusėje.“; `teacher.offline` — apyrankė ant riešo, vaikai poromis atsisuka vienas į kitą ir rodo savo kairę, tada mokytoja priešais klasę kelia dešinę; `teacher.misconceptions` — keturios nuostatos iš šio skyriaus; `sim` — `{ "component": "vabaliukas-ir-kryptys", "config": { "size": 3, "start": { "col": 1, "row": 1, "facing": "up" }, "leaf": { "col": 0, "row": 0 } } }`. Numeris `17-` laisvas. Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/index.json` ir `path.json` (kūrėjo ar dizainerio darbas, ne metodo dalis); siūloma vieta kelyje — iškart po `06-figuros`, nes orientacija remiasi figūros padėtimi.
│
│  **Skaičių tikslinimas.** Ideatoriaus pasiūlyme rašoma „36 pirmokų tyrime 27–28 žinojo, kuri jų kairė, bet tik 6 teisingai nurodė robotui posūkius kairėn ir dešinėn“. Way ir Cartwright (2024) tekste tokių skaičių nėra: ten sakoma, kad tik **keturi** vaikai visiškai teisingai atliko abi užduotis, **penki** negalėjo įvykdyti nė vieno krypties nurodymo, o dauguma komandų kairėn/dešinėn robotui iš viso nesakė. Metodas remiasi šaltinio skaičiais, o ne pasiūlymo santrauka.
│
│ research/wiki/guidelines/pilotai.md
│ @@ -88,4 +88,11 @@
│  - **Ką keičiame:** `augalo-gyvenimas` (modulis `09-augalo-gyvenimas`) vietoj `min(vanduo, šviesa)/5 × min(diena/10, 1)` turi tris sąlygas (vanduo 0–5 su optimumu ties 3, šviesa 0–5, šiluma šalta/šilta) ir laiką: per dieną dydis auga `min(...) × 0,22`. Būsena (lapų nusvirimas, blyškumas, šaltis) reaguoja iš karto, o dydis kaupiasi per dienas — todėl dešimt dienų su perlaistymu duoda mažą augalą. `api.readout` įvardija visas tris sąlygas ir dieną, `api.note` — silpniausią grandį, `api.progress` — tik pražydus.
│  - **Kaip matuojame:** (1) ar vaikas, laistęs „daugiau“ ir pamatęs, kad augalas vysta, pats grįžta prie mažesnio vandens; (2) ar perkėlimo užduotyje „laistai, bet laikai tamsoje“ nurodo augimo sulėtėjimą, o ne „jam nieko neatsitinka“; (3) ar vaikas įvardija, kad vienu metu reikia visų trijų sąlygų. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│  - **Rezultatas:** dar nėra. Techninė patikra: `validate_content.py` 0/0 (ir `--strict`), `check_ui.py` 0/0, `check_audio.py` 329/329, 0 konsolės klaidų, 0 px horizontalaus slinkimo ties 320/360/414 px, nė vieno taikinio < 48 px; `simDone` įrašomas tik po žiedo ir neįrašomas po 10 perlaistymo dienų.
│ -- **Sprendimas:** laukiama duomenų. Jei vaikams per sunku atskirti „dydis“ nuo „būklės“, dydžio kaupimas per dienas keičiamas į tiesioginį atsaką (be laiko ašies), o laikas paliekamas tik žiedo etapui.
│ +### P-010 — Kryptys: vienas veikėjas, žymė ant kūno
│ +
│ +- **Data:** 2026-11-07
│ +- **Hipotezė:** jei kairės žymė pritvirtinta prie veikėjo kūno ir sukasi kartu su juo, o seka eina tyrimų nustatyta tvarka (savo kūnas → veikėjas žiūri ta pačia kryptimi → veikėjas žiūri į vaiką), tai daugiau pirmokų pastebi, kad kairė priklauso nuo žiūrovo, ir užduotyje su mokytoja, stovinčia priešais klasę, pasirenka „mano kairėje“, nes klaidinga nuostata griaunama fiziškai matomu posūkiu, o ne tekstu (Rigal, 1994; Rigal, 1996; Borke, 1975; `research/wiki/foundations/kryptis-ir-ziurovo-pozicija.md`).
│ +- **Ką keičiame:** pirmoji simuliacija, kurioje kryptis rodoma kaip žymė ant kūno, o ne kaip fiksuota ekrano pusė, ir pirmas modelis, kuriame posūkis vyksta vietoje ir yra atskirtas nuo žingsnio (Way ir Cartwright, 2024: vaikai tą patį žodį „pasuk“ supranta kaip pasisukimą ir kaip žingsnį į šoną). Modulis `17-kryptys-ir-vieta`, komponentas `vabaliukas-ir-kryptys`, 3 × 3 tinklelis, vienas kintamasis `facing`.
│ +- **Kaip matuojame:** (1) ar vaikas po pirmo pasukimo į save teisingai pasako, kurioje ekrano pusėje yra vabaliuko kairė; (2) ar perkėlimo užduotyje su mokytoja pasirenka „mano kairėje“; (3) ar savo žodžiais pasako, kad reikia atsisukti arba įsivaizduoti save kito vietoje. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│ +- **Rezultatas:** dar nėra. Techninė patikra bus įrašyta įgyvendinus modelį.
│ +- **Sprendimas:** laukiama duomenų. Jei vaikai vis tiek rodo savo pusę, stiprinamas spėjimo žingsnis ir apyrankės vaidmuo, o ne pridedama daugiau teksto; jei „pasuk“ suprantama kaip žingsnis į šoną, ilginama posūkio animacija, bet žingsnis nesusiejamas su pasukimu.
│ research/wiki/changelog.md
│ @@ -1,6 +1,15 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-07 — Krypčių metodas M-04
│ +
│ +- **`grades/01/metodai.md`** — naujas metodas M-04 „Kryptys: kairė priklauso nuo žiūrovo“ (tema `2026-11-04-ideator-kryptys.json`): keturių žingsnių seka pagal žodžių įsisavinimo tvarką, simuliacijos `vabaliukas-ir-kryptys` septynios būsenos, keturios užduotys su tipinėmis klaidomis, modelio ribos ir sąmoningai kuklus tikslas.
│ +- **`foundations/kryptis-ir-ziurovo-pozicija.md`** — naujas įrašas: kairė ir dešinė priklauso kūnui, o ne kambariui; žodžiai įsisavinami savo kūnu → žiūrint ta pačia kryptimi → žiūrint į vaiką; didžiąją dalį klaidų paaiškina užduoties sandara, o ne vaiko „egocentrizmas“.
│ +- **`foundations/README.md`** — indekso eilutė.
│ +- **`guidelines/pilotai.md`** — P-010 (žymė ant kūno, posūkis vietoje atskirtas nuo žingsnio).
│ +- **Šaltinis:** Rigal (1994) https://doi.org/10.2466/pms.1994.79.3.1259 · Rigal (1996) https://doi.org/10.2466/pms.1996.83.3.831 · Phinney & Nummedal (1979) https://doi.org/10.2466/pms.1979.48.1.223 · Borke (1975) https://doi.org/10.1037/h0076459 · Way & Cartwright (2024) http://merga.net.au/wp-content/uploads/2024/09/6-MERGA-46-2024-Quick-Reads_Way-and-Cartwright.pdf · Kocher ir kt. (2020) https://doi.org/10.1109/icdl-epirob48136.2020.9278108 · Abarbanell & Li (2021) https://doi.org/10.1080/13875868.2020.1825442
│ +- **Poveikis platformai:** būsimas modulis `17-kryptys-ir-vieta`; taisyklė „krypties žymė sukasi su kūnu, o ne su ekranu“ taikoma ir komandų sekos (Bee-Bot tipo) modeliams. Ideatoriaus pasiūlyme esantis skaičius „6 iš 36 pirmokų“ pakeistas šaltinio skaičiais (keturi visiškai teisingai, penki be nė vieno teisingo nurodymo).
│
│  ## 2026-11-06 (16:37) — Publikavimo patikra #30: gyva svetainė sveika, 16 modulių laukia
│
│ research/wiki/guidelines/pilotai.md
│ @@ -88,6 +88,8 @@
│  - **Ką keičiame:** `augalo-gyvenimas` (modulis `09-augalo-gyvenimas`) vietoj `min(vanduo, šviesa)/5 × min(diena/10, 1)` turi tris sąlygas (vanduo 0–5 su optimumu ties 3, šviesa 0–5, šiluma šalta/šilta) ir laiką: per dieną dydis auga `min(...) × 0,22`. Būsena (lapų nusvirimas, blyškumas, šaltis) reaguoja iš karto, o dydis kaupiasi per dienas — todėl dešimt dienų su perlaistymu duoda mažą augalą. `api.readout` įvardija visas tris sąlygas ir dieną, `api.note` — silpniausią grandį, `api.progress` — tik pražydus.
│  - **Kaip matuojame:** (1) ar vaikas, laistęs „daugiau“ ir pamatęs, kad augalas vysta, pats grįžta prie mažesnio vandens; (2) ar perkėlimo užduotyje „laistai, bet laikai tamsoje“ nurodo augimo sulėtėjimą, o ne „jam nieko neatsitinka“; (3) ar vaikas įvardija, kad vienu metu reikia visų trijų sąlygų. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│  - **Rezultatas:** dar nėra. Techninė patikra: `validate_content.py` 0/0 (ir `--strict`), `check_ui.py` 0/0, `check_audio.py` 329/329, 0 konsolės klaidų, 0 px horizontalaus slinkimo ties 320/360/414 px, nė vieno taikinio < 48 px; `simDone` įrašomas tik po žiedo ir neįrašomas po 10 perlaistymo dienų.
│ +- **Sprendimas:** laukiama duomenų. Jei vaikams per sunku atskirti „dydis“ nuo „būklės“, dydžio kaupimas per dienas keičiamas į tiesioginį atsaką (be laiko ašies), o laikas paliekamas tik žiedo etapui.
│ +
│  ### P-010 — Kryptys: vienas veikėjas, žymė ant kūno
│
│  - **Data:** 2026-11-07
│ agents/proposals/2026-11-07-metodininkas-kryptys.json
│ @@ -0,0 +1,21 @@
│ +{
│ +  "role": "metodininkas",
│ +  "run_id": 33,
│ +  "created": "2026-11-07T08:30:00+02:00",
│ +  "type": "metodas",
│ +  "title": "Kryptys: kairė priklauso nuo žiūrovo",
│ +  "body": "Metodas M-04 temai „Kryptys: kairė priklauso nuo to, į ką žiūri“ (ideatoriaus pasiūlymas 2026-11-04). Viena idėja: kairė ir dešinė priklauso kūnui, o ne kambariui, todėl žmogui atsisukus į vaiką jo kairė atsiduria vaiko dešinėje. Seka eina tyrimų nustatyta tvarka — savo kūnas, veikėjas, žiūrintis ta pačia kryptimi, ir tik paskui veikėjas, žiūrintis į vaiką (Rigal, 1994). Simuliacija „vabaliukas-ir-kryptys“ turi vieną kintamąjį (kryptis, į kurią veikėjas žiūri), o kairę rodo žymė, pritvirtinta prie kūno ir besisukanti kartu su juo. Posūkis vyksta vietoje ir yra atskirtas nuo žingsnio, nes pirmokai tą patį žodį „pasuk“ supranta kaip žingsnį į šoną (Way ir Cartwright, 2024). Tikslas sąmoningai kuklus: 6–7 metais kito žmogaus kairės įvardijimas dar tik formuojasi, todėl modulis siekia, kad vaikas pastebėtų priklausomybę nuo žiūrovo, o ne įvaldytų be klaidų. Priedai: keturios užduotys su tipinėmis klaidomis ir užuominomis, modelio ribos, mokytojo veikla be ekrano su apyranke. Ideatoriaus santraukoje esantis skaičius „6 iš 36 pirmokų“ šaltinyje nepatvirtintas — metode naudojami tikrieji Way ir Cartwright skaičiai.",
│ +  "target": "content/lt/grade-01/matematika/17-kryptys-ir-vieta.json",
│ +  "priority": "high",
│ +  "status": "new",
│ +  "evidence": [
│ +    "research/wiki/foundations/kryptis-ir-ziurovo-pozicija.md",
│ +    "research/wiki/grades/01/metodai.md#M-04",
│ +    "research/wiki/curriculum/matematika-1-klase.md:121 — 1 klasės transformacijos: pasisukti kairėn/dešinėn, paeiti 3 žingsnius pirmyn/atgal, schema su rodyklėmis",
│ +    "research/wiki/curriculum/matematika-1-klase.md:165 — pasiekimas: apibūdina objekto padėtį kairėn/dešinėn; perskaito tinklelio adresą B1, C3",
│ +    "Rigal, R. (1994). Right-left orientation: Development of correct use of right and left terms. Perceptual and Motor Skills, 79(3), 1259–1278. https://doi.org/10.2466/pms.1994.79.3.1259",
│ +    "Rigal, R. (1996). Right-left orientation, mental rotation, and perspective-taking. Perceptual and Motor Skills, 83(3), 831–842. https://doi.org/10.2466/pms.1996.83.3.831",
│ +    "Borke, H. (1975). Piaget's mountains revisited. Developmental Psychology, 11(2), 240–243. https://doi.org/10.1037/h0076459",
│ +    "Way, J., & Cartwright, K. (2024). Turn left, turn right. MERGA 46 Quick Reads. http://merga.net.au/wp-content/uploads/2024/09/6-MERGA-46-2024-Quick-Reads_Way-and-Cartwright.pdf"
│ +  ]
│ +}
│ research/wiki/grades/01/metodai.md
│ @@ -205,7 +205,7 @@
│
│  **Viena didelė idėja.** Kairė ir dešinė priklauso ne kambariui, o kūnui. Kai žmogus atsisuka į tave, jo kairė atsiduria tavo dešinėje.
│
│ -**Kodėl modelis, o ne sakinys.** Sakinys „kito žmogaus kairė yra tavo dešinėje“ reikalauja žodžių, kurių pirmokas dar neturi. Rigal (1994), tyręs 406 vaikus nuo 5 iki 11 metų, rado tokią tvarką: žodžius „kairė“ ir „dešinė“ vaikai pradeda teisingai taikyti savo kūnui apie septintus metus, paskui — žmogui, žiūrinčiam ta pačia kryptimi, ir tik 8–9 metais — žmogui, žiūrinčiam į juos. Net vienuolikos metų pusė tiriamųjų žodžių kitiems žmonėms dar netaikė tinkamai. Paveikslėlis čia nepadės: jame nematyti, kad pusė priklauso nuo to, kas žiūri. Tai parodo tik veikėjas, kurį vaikas pats pasuka.
│ +**Kodėl modelis, o ne sakinys.** Sakinys „kito žmogaus kairė yra tavo dešinėje“ reikalauja žodžių, kurių pirmokas dar neturi. Rigal (1994), tyręs 406 vaikus, rado tokią tvarką: žodžius „kairė“ ir „dešinė“ vaikai pradeda teisingai taikyti savo kūnui apie septintus metus, paskui — žmogui, žiūrinčiam ta pačia kryptimi, ir tik 8–9 metais — žmogui, žiūrinčiam į juos. Net vienuolikos metų pusė tiriamųjų žodžių kitiems žmonėms dar netaikė tinkamai. Paveikslėlis čia nepadės: jame nematyti, kad pusė priklauso nuo to, kas žiūri. Tai parodo tik veikėjas, kurį vaikas pats pasuka.
│
│  **Tikslas sąmoningai kuklus.** Modulis nesiekia, kad pirmokas be klaidų nustatytų kito žmogaus kairę. Rigal (1996) su tais pačiais 406 vaikais parodė, kad net 11-mečiai, kai žmogus žiūri į juos, teisingai atsako tik pusėje atvejų, o mažiausi atsakinėja taip, tarsi kitas matytų iš jų pačių pozicijos. Modulio tikslas — kad vaikas **pastebėtų priklausomybę** ir turėtų būdą pasitikrinti (atsisukti, įsivaizduoti save kito vietoje).
│
│ research/wiki/grades/01/metodai.md
│ @@ -207,7 +207,7 @@
│
│  **Kodėl modelis, o ne sakinys.** Sakinys „kito žmogaus kairė yra tavo dešinėje“ reikalauja žodžių, kurių pirmokas dar neturi. Rigal (1994), tyręs 406 vaikus, rado tokią tvarką: žodžius „kairė“ ir „dešinė“ vaikai pradeda teisingai taikyti savo kūnui apie septintus metus, paskui — žmogui, žiūrinčiam ta pačia kryptimi, ir tik 8–9 metais — žmogui, žiūrinčiam į juos. Net vienuolikos metų pusė tiriamųjų žodžių kitiems žmonėms dar netaikė tinkamai. Paveikslėlis čia nepadės: jame nematyti, kad pusė priklauso nuo to, kas žiūri. Tai parodo tik veikėjas, kurį vaikas pats pasuka.
│
│ -**Tikslas sąmoningai kuklus.** Modulis nesiekia, kad pirmokas be klaidų nustatytų kito žmogaus kairę. Rigal (1996) su tais pačiais 406 vaikais parodė, kad net 11-mečiai, kai žmogus žiūri į juos, teisingai atsako tik pusėje atvejų, o mažiausi atsakinėja taip, tarsi kitas matytų iš jų pačių pozicijos. Modulio tikslas — kad vaikas **pastebėtų priklausomybę** ir turėtų būdą pasitikrinti (atsisukti, įsivaizduoti save kito vietoje).
│ +**Tikslas sąmoningai kuklus.** Modulis nesiekia, kad pirmokas be klaidų nustatytų kito žmogaus kairę. Rigal (1996), tyręs 406 vaikus nuo 5 iki 11 metų, parodė, kad net 11-mečiai, kai žmogus žiūri į juos, teisingai atsako tik pusėje atvejų, o mažiausi atsakinėja taip, tarsi kitas matytų iš jų pačių pozicijos. Modulio tikslas — kad vaikas **pastebėtų priklausomybę** ir turėtų būdą pasitikrinti (atsisukti, įsivaizduoti save kito vietoje).
│
│  **Klaidingos nuostatos ir kaip jos paneigiamos.**
│
│ research/wiki/grades/01/metodai.md
│ @@ -213,7 +213,7 @@
│
│  1. **„Kairė visiems ta pati pusė.“** Vaikas savo kairę perkelia veikėjui, kuris žiūri į jį. Rigal (1996) šį atsakymo būdą aprašo kaip būdingą mažiausiems ir nykstantį su amžiumi. Paneigiama pačiu modeliu: vabaliukui atsisukus į vaiką, žymė „kairė“ persoka į kitą ekrano pusę. Jei kairė būtų kambario savybė, posūkis jos nepajudintų.
│  2. **„Pasukti į kairę visada reiškia į kairę ekrano pusę.“** Tai ta pati klaida, tik apie komandą. Kai vabaliukas žiūri į vaiką, „Pasuk kairėn“ veda į dešinę ekrano pusę. Paneigiama dviem būsenomis, kurias vaikas pasiekia pats.
│ -3. **„Pasukti reiškia žengti į šoną.“** Way ir Cartwright (2024) individualiai kalbino 36 pirmokus: tik keturi visiškai teisingai atliko abi užduotis, penki negalėjo įvykdyti nė vieno krypties nurodymo, o dauguma robotui komandų „kairėn“/„dešinėn“ iš viso nesakė — rodė gestais arba sakė „eik ten“. Tą patį žodį „pasuk“ vaikai suprato skirtingai: vieni pasisuko vietoje, kiti žengė į šoną. Todėl modelyje posūkis vyksta **vietoje** (vabaliukas lieka tame pačiame langelyje), o žingsnis yra atskiras mygtukas su atskiru sakiniu.
│ +3. **„Pasukti reiškia žengti į šoną.“** Way ir Cartwright (2024) individualiai kalbino 36 pirmokus: tik keturi visiškai teisingai atliko abi užduotis, penki negalėjo įvykdyti nė vieno krypties nurodymo, o ne daugelis robotui apskritai davė komandas „kairėn“/„dešinėn“ — dažniau rodė gestais arba sakė „eik ten“. Tą patį žodį „pasuk“ vaikai suprato skirtingai: vieni pasisuko vietoje, kiti žengė į šoną. Todėl modelyje posūkis vyksta **vietoje** (vabaliukas lieka tame pačiame langelyje), o žingsnis yra atskiras mygtukas su atskiru sakiniu.
│  4. **„Jei nemoka, vadinasi, dar per mažas.“** Borke (1975) parodė, kad supaprastinus perspektyvos užduotį net trejų metų vaikai atsako ne vien iš savo pozicijos. Nesėkmė labiau priklauso nuo užduoties sandaros negu nuo vaiko savybės, todėl modelis sąmoningai paprastas: vienas veikėjas, viena sąsaja, trys ant trijų langeliai.
│
│  **Seka (konkretumas → modelis → simbolis → perkėlimas).**
│ research/wiki/foundations/kryptis-ir-ziurovo-pozicija.md
│ @@ -17,7 +17,7 @@
│
│  ## Ką rodo tyrimai
│
│ -**Žodžių tvarka skiriasi nuo suvokimo tvarkos.** Rigal (1994) tyrė 406 vaikus nuo 5 iki 11 metų. Skirti kairę nuo dešinės ir atpažinti simetriškus ženklus vaikai išmoksta gerokai anksčiau negu **pavartoti žodžius**. Žodžius „kairė“ ir „dešinė“ jie pradeda teisingai taikyti savo kūnui maždaug nuo septynerių metų, paskui — žmogui, žiūrinčiam **ta pačia kryptimi**, ir tik 8–9 metų — žmogui, žiūrinčiam **į juos**. Net vienuolikos metų pusė tiriamųjų žodžių kitiems žmonėms dar netaikė tinkamai.
│ +**Žodžių tvarka skiriasi nuo suvokimo tvarkos.** Rigal (1994) tyrė 406 vaikus. Skirti kairę nuo dešinės ir atpažinti simetriškus ženklus vaikai išmoksta gerokai anksčiau negu **pavartoti žodžius**. Žodžius „kairė“ ir „dešinė“ jie pradeda teisingai taikyti savo kūnui maždaug nuo septynerių metų, paskui — žmogui, žiūrinčiam **ta pačia kryptimi**, ir tik 8–9 metų — žmogui, žiūrinčiam **į juos**. Net vienuolikos metų pusė tiriamųjų žodžių kitiems žmonėms dar netaikė tinkamai.
│
│  **Priešingas žvilgsnis yra sunkiausias atvejis.** Rigal (1996) su tais pačiais 406 vaikais atskyrė tris dalykus: atvaizdo atpažinimą, kairės/dešinės įvardijimą ir mintinį sukimą. Atvaizdą atpažinti sekėsi net mažiausiems. Kairės/dešinės įvardijimas buvo sunkus net vyriausiems, kai reikėjo mintyse pasukti. Kai reikėjo pasakyti, ką mato į vaiką atsisukęs žmogus, mažiausi rinkosi taip, tarsi tas žmogus matytų **iš jų pačių pozicijos**; ši dalis mažėjo su amžiumi, bet net 11-mečių teisingai atsakė tik pusė. Dalis vaikų suprato, kad kryptis pasikeitė, bet nesiejo to su kairės/dešinės padėtimi atvaizde.
│
Darbas nutrauktas ties riba, bet metodas įrašytas ir patikrintas. Būklė:

## Kas padaryta

**Pasirinkimas.** Seniausia `new` `high` tema be metodo — **#17 „Kryptys: kairė priklauso nuo to, į ką žiūri“** (`agents/proposals/2026-11-04-ideator-kryptys.json`). Ankstesnės `high` temos jau turi M-01 (laikas), M-02 (lygybė), M-03 (pinigai).

**Metodas M-04 „Kryptys: kairė priklauso nuo žiūrovo“** (`research/wiki/grades/01/metodai.md`, `atnaujinta: 2026-11-07`):
- viena idėja: kairė/dešinė priklauso kūnui, ne kambariui; atsisukus į vaiką kito kairė atsiduria jo dešinėje;
- seka pagal Rigal (1994) nustatytą įsisavinimo tvarką: savo kūnas (apyrankė) → veikėjas, žiūrintis ta pačia kryptimi → veikėjas, žiūrintis į vaiką → perkėlimas;
- simuliacija `vabaliukas-ir-kryptys`, `config {size:3, start:{col:1,row:1,facing:"up"}, leaf:{col:0,row:0}}`, 7 būsenos su `readout`/`api.note`; vienas kintamasis `facing`; posūkis vietoje atskirtas nuo žingsnio (MERGA 2024 dviprasmybė); 3×3 tinklelis 280 px iš 328; 7 garso frazės; klaviatūra; `api.progress` kartą (lapas + veikėjas žiūrėjo į vaiką);
- 4 užduotys (indeksai 1, 1, 2, 0) su tipinėmis klaidomis ir užuominomis; `optional` — du vaikai, abu pasuka į kairę;
- sąmoningai kuklus tikslas: 6–7 m. kito kairės įvardijimas dar formuojasi (Rigal 1996: net 11-mečiai — pusė teisingai), todėl tikslas „pastebėti priklausomybę“, o ne „be klaidų nustatyti“.

**Kiti failai:** `foundations/kryptis-ir-ziurovo-pozicija.md` (naujas, 7 šaltiniai), `foundations/README.md` (indekso eilutė), `guidelines/pilotai.md` (P-010), `changelog.md` (2026-11-07 įrašas), `agents/proposals/2026-11-07-metodininkas-kryptys.json` (type `metodas`).

**Patikrinta:** `validate_content.py` 0 klaidų / 0 įspėjimų ir su `--strict` — 0/0. DOI patvirtinti per Crossref/OpenAlex (Rigal 1994, Rigal 1996, Phinney & Nummedal 1979, Borke 1975, Kocher 2020, Abarbanell & Li 2021); MERGA PDF perskaitytas tiesiogiai. Sąmoningai pataisytas ideatoriaus klaidingas skaičius „6 iš 36“: šaltinyje — keturi visiškai teisingai atlikę abi užduotis, penki neįvykdę nė vieno nurodymo, ne daugelis komandų iš viso nedavę.

## Kas liko

1. **`agents/log/metodininkas-2026-11-07T0824.md`** — neįrašytas.
2. **`agents/state.json`** — metodininko `last_run` / `status: ok` / `log` ir `last_method_work` blokas neatnaujintas.
3. Paskutiniai du tikslinimai (`foundations` skyriuje „Rigal (1996) su tais pačiais 406 vaikais“ ir MERGA formuluotė ten pat) liko nepadaryti — metodai.md jau sutvarkytas, foundations tekste dar yra „su tais pačiais“ ir „dauguma… nesakė“.

Darbinis medis buvo nešvarus iki manęs (`#272` publikavimo blokada — ne mano sritis).

## klaidos

```
session_id: local-c604ab33b20f28e90f37e6f8db528bb5303fd4efda1876c84794813ffd123596
```
