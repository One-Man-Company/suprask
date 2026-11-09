# programos-derintojas — 2026-11-09T1507

- paleidimas: #206 (manual)
- trukmė: 390s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/list_mods.py
│ @@ -0,0 +1,7 @@
│ +import json, os
│ +d=json.load(open('content/lt/grade-01/index.json'))
│ +for s in d['strands']:
│ +    print(s['id'], '|', s['title'], '|', len(s['modules']))
│ +    for m in s['modules']:
│ +        print('   ', m['id'], '—', m['title'], '|', m.get('minutes'), 'min')
│ +print('IS VISO', sum(len(s['modules']) for s in d['strands']))
│ profiles/deepseek41flash/cache/scratch/dump_lt.py
│ @@ -0,0 +1,26 @@
│ +import json, glob, os
│ +os.chdir('/home/zoltanas/workspace/suprask')
│ +for f in sorted(glob.glob('content/lt/grade-01/lietuviu-kalba/*.json')):
│ +    d = json.load(open(f))
│ +    print('=' * 70)
│ +    print(f)
│ +    print('TITLE:', d['title'], '|', d['subtitle'], '| min', d['minutes'])
│ +    print('OUTCOMES:')
│ +    for o in d['outcomes']:
│ +        print('  -', o)
│ +    c = d['concept']
│ +    print('CONCEPT:', c['title'], '::', c['big_idea'])
│ +    for s in c['steps']:
│ +        print('   step:', s)
│ +    if 'example' in c:
│ +        print('   example:', c['example'])
│ +    print('SIM:', (d.get('sim') or {}).get('component'))
│ +    for i, t in enumerate(d['tasks']):
│ +        print('   T%d%s ans=%d: %s' % (i + 1, ' (opt)' if t.get('optional') else '', t['answer'], t['q']))
│ +        print('        opts:', ' | '.join(t['options']))
│ +        print('        hint:', t['hint'])
│ +        print('        why:', t['why'])
│ +    print('REFLECT:', d['reflect'])
│ +    print('SV1:')
│ +    for s in d['svietimas1']:
│ +        print('  -', s)
│ profiles/deepseek41flash/cache/scratch/src_lt.py
│ @@ -0,0 +1,9 @@
│ +import json, glob, os
│ +os.chdir('/home/zoltanas/workspace/suprask')
│ +for f in sorted(glob.glob('content/lt/grade-01/lietuviu-kalba/*.json')):
│ +    d = json.load(open(f))
│ +    print(f)
│ +    print('  sources:')
│ +    for s in d['sources']:
│ +        print('   -', s)
│ +    print('  teacher.goal:', d['teacher']['goal'])
Nepabaičiau iki galo: turinio bei programos palyginimą atlikau, bet pasiūlymų, wiki įrašo ir ataskaitos įrašyti nespėjau (baigėsi žingsnių limitas). Žemiau — kas realiai rasta ir kokie failai turi būti įrašyti kitame paleidime.

ATLIKTA PATIKRA: 1 klasė, lietuvių kalba ir literatūra (4 moduliai)
Šaltinis: sources/pradinio-bp-rekomendacijos-2024.txt (cituotos eilutės patikrintos grep'u)

ATITIKTIS (su citatomis)

  atitinka
  01-garsas-ir-raide — D.1.1. „Skiria lietuvių kalbos garsus kalbos sraute, užrašo juos atitinkamomis raidėmis; paaiškina, kuo raidė skiriasi nuo garso“ (:382–386), ir oficialus 1 klasės veiklos pavyzdys „Kuo raidė skiriasi nuo garso?“ (:374–470).
  04-kaip-zmones-sveikinasi — D.5.2 ir 1 klasės veiklos pavyzdys „Kaip žmonės sveikinasi?“ (:317–372).

  neatitinka
  03-sakinio-tvarka — modulio branduolys „Sakinyje žodžiai eina tam tikra tvarka. Sumaišius juos, sakinys praranda prasmę“ (03-sakinio-tvarka.json:15) prieštarauja paties modulio pavyzdžiui (:21: „Pieną katė geria — taip pat suprantama“) ir lietuvių kalbos laisvajai žodžių tvarkai. Programa 1–2 klasei sakinį aprašo kitaip: „mokomasi kelti sakinio žodžiams klausimus ir suprasti, kad sakinio žodžiai vieni su kitais susiję ir yra derinami tarpusavyje“ (:39795–39796), pasiekimai D.3.3.1–D.3.3.4 (:39798–39809) — „randa žodžius, atsakančius į klausimus kas?, ką veikia?“. Žodžių tvarkos kaip temos šiame dokumente nėra (grep „žodžių tvarka“ → 0); 4 klasėje sakinys — veiksnio/tarinio paieška (:41393–41396). Be to, užduotis T1 teisingais laiko tik vieną eilę, o „Knygą berniukas skaito“ (:56) yra taisyklingas lietuviškas sakinys; simuliacija lygina tikslų žodžių sutapimą (assets/js/sims/calba.js:243), tad ir „Ryte saulė šviečia“ gauna „Dar ne“. Tai LL-18 klasės defektas (neteisingas variantas, kuris gyvenime teisingas).

  iš dalies / neįrodoma
  02-skiemenu-jungimas — skiemens kaip 1–2 kl. pasiekimo šiame šaltinyje nėra: skiemuo minimas tik kaip skaitmeninės priemonės pavadinimas („Žodžių sudarymas iš skiemenų“, :14532) ir kaip muzikos integracijos sąsaja (:10809). 1–2 kl. D.1.3 lygiai eina balsiai → priebalsiai → dvibalsiai (:39747–39770). Modulio `sources` (:132–135) remiasi „skaitymo ir teksto suvokimo pasiekimais“, bet tokio skiemens pasiekimo nėra. Modulio naikinti nesiūlau (skiemeninis skaitymas pagrįstai remia B.1.2), tik pataisyti sąsają ir pažymėti [PATIKRINTI] pilname BP.

  Papildoma pastaba (ne atskiras pasiūlymas): 02 T2 (:95–101) du neteisingi variantai sako tą patį (LL-67); 03 T1 trečias variantas neturi taško, tad skiriasi dviem dimensijomis; 01 T1 klausia „Kuris paveikslėlis“, o variantai — žodžiai.

DIDŽIAUSIA SPRAGA
Lietuvių kalbos B sritis (skaitymas ir teksto supratimas) platformoje neturi nė vieno modulio, nors programa 1–2 klasei ją apibrėžia: B.1.2 „Skaito savo poreikius ir galimybes atitinkančius tekstus, randa tekste aiškiai pateiktą informaciją“ (:7590–7604, veikla „Mokausi rasti man svarbią informaciją“; lygis B.1.2.1 :32449) ir B.2.1.1 „Įvardija ir apibūdina bent vieną veikėją“ (:32540). Visi 4 esami moduliai dengia tik D sritį (kalbos pažinimą); A ir C sričių taip pat nėra.

KAS LIKO NEĮRAŠYTA (padaryti kitame paleidime #206 pakartojime)
1. agents/proposals/2026-11-09-programos-derintojas-sakinio-tvarka.json — tipas atitiktis, high, target content/lt/grade-01/lietuviu-kalba/03-sakinio-tvarka.json; siūlyti perkelti modulį į D.3.3.1 (rasti „kas?“ / „ką veikia?“ žodžius), o simuliaciją daryti žodžių žymėjimą, ne eilės spėjimą.
2. agents/proposals/2026-11-09-programos-derintojas-skaitymo-modulis.json — tipas tema, high, target content/lt/grade-01/lietuviu-kalba/05-... (naujas); modelio idėja: 3 sakinių tekstas + paveikslėlis, klausimas keičiamas (kas? ką veikė? kur?) ir vaikas tekstu rodo žodžius, kurie atsako; atsakymas turi būti tekste, ne paveikslėlyje; antra dalis — veikėjo kortelė iš teksto faktų.
3. agents/proposals/2026-11-09-programos-derintojas-skiemens-sasaja.json — tipas atitiktis, normal, target 02-skiemenu-jungimas.json; pataisyti sources/svietimas1, nuorodą kelti į B.1.2, neįrodytą teiginį žymėti [PATIKRINTI].
4. research/wiki/curriculum/lietuviu-kalba-1-klase.md — patikslinti §2.4 (skiemuo: :14532, :10809; pasiekimo nėra) ir pridėti §9 modulių atitikties lentelę su aukščiau pateiktomis eilutėmis bei pastaba, kad B ir C sritys neturi modulių.
5. agents/log/programos-derintojas-2026-11-09T1513.md — ataskaita.
6. agents/state.json — roles.programos-derintojas (last_run 2026-11-09T15:13:28, log kelias) ir last_curriculum_check → run 206, scope „1 klasė, lietuvių kalba (4 moduliai)“, verdicts ir proposals.

Ko neliečiau: modulių turinio, assets/, docs/, AGENTS.md, agents/state.json nepakeistas, necommitinta. Darbinė kopija prieš darbą buvo švari (git status tuščias).

## klaidos

```
session_id: local-8ab5adf41e56f98918ab092c2894d48820d86272dc17f6ba98522c22a2fff981
```
