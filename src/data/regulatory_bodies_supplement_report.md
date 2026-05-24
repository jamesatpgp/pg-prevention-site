# Regulatory Bodies Supplement — Coverage Report

**Retrieval date:** 2026-05-23
**Output CSV:** `src/data/regulatory_bodies_supplement.csv`
**Scope:** New rows for regulators named in the statute inventory that had no row in `regulatory_bodies.csv`. Existing files were not modified.

## Summary

- **Punch-list lines:** 29 (state × vertical × agency)
- **Rows written:** 26 (3 lines collapse onto a shared agency — see "Deduplication" below)
- **Verified official URL:** 25 rows
- **Blank-with-explanation:** 1 row (Missouri Horse Racing Commission — dormant, no official site)

All website values were taken only from the agency's own `.gov` / official portal / official program page and confirmed to resolve to the named body. No Wikipedia/trade-press/aggregator URLs were used as the website value.

## Deduplication (29 punch-list lines → 26 rows)

Several agencies regulate multiple verticals, so one row serves multiple punch-list lines (matching is by name, then vertical):

- **Kentucky** horse racing + sports betting → one row: *Kentucky Horse Racing and Gaming Corporation*
- **North Carolina** horse racing + sports betting → one row: *North Carolina State Lottery Commission*
- **New Jersey** online casino + sports betting → one row: *New Jersey Division of Gaming Enforcement*
- **Maryland** sports betting line names two bodies → two rows: *Maryland Lottery and Gaming Control Commission* (also covers the commercial-casino line) and *Sports Wagering Application Review Commission (SWARC)*

## Per-regulator results

| # | Jurisdiction | Agency (body_name) | Official URL | Status |
|---|---|---|---|---|
| 1 | American Samoa | American Samoa Attorney General; local authorization | https://legalaffairs.as.gov/ | Verified |
| 2 | Arizona | Arizona Department of Revenue - Bingo Section | https://azdor.gov/business/bingo-arizona | Verified* |
| 3 | Arkansas | Arkansas Department of Finance and Administration | https://www.dfa.arkansas.gov/office/taxes/excise-tax-administration/miscellaneous-tax/arkansas-miscellaneous-tax-laws/bingo-raffle/ | Verified |
| 4 | Florida | Florida Department of Agriculture and Consumer Services | https://www.fdacs.gov/Business-Services/Game-Promotions-Sweepstakes | Verified |
| 5 | Idaho | Idaho State Lottery Commission | https://www.idaholottery.com/charitable-gaming | Verified |
| 6 | West Virginia | West Virginia State Tax Department | https://tax.wv.gov/Business/BusinessRegistration/BingoAndRaffle/Pages/BusinessRegistrationBingoAndRaffle.aspx | Verified |
| 7 | Maryland | County-level authorization; Comptroller registration | https://www.marylandtaxes.gov/business/admission-amusement/index.php | Verified (301→200) |
| 8 | New Jersey | New Jersey Legalized Games of Chance Control Commission | https://www.njconsumeraffairs.gov/lgccc | Verified |
| 9 | New Jersey | Division of Consumer Affairs - Fantasy Sports Unit | https://www.njconsumeraffairs.gov/FSU | Verified |
| 10 | New Jersey | New Jersey Racing Commission | https://www.njoag.gov/nj-racing-commission/ | Verified |
| 11 | New Jersey | New Jersey Division of Gaming Enforcement | https://www.njoag.gov/about/divisions-and-offices/division-of-gaming-enforcement-home/ | Verified |
| 12 | North Carolina | North Carolina Department of Public Safety - ALE | https://www.ncdps.gov/our-organization/alcohol-law-enforcement | Verified |
| 13 | North Carolina | North Carolina State Lottery Commission | https://ncgaming.gov/ | Verified |
| 14 | Indiana | Indiana Horse Racing Commission | https://www.in.gov/hrc/ | Verified |
| 15 | Kentucky | Kentucky Horse Racing and Gaming Corporation | https://khrc.ky.gov/ | Verified (corrected) |
| 16 | Maryland | Maryland Lottery and Gaming Control Commission | https://www.mdgaming.com/ | Verified |
| 17 | Maryland | Sports Wagering Application Review Commission | https://swarc.org/ | Verified |
| 18 | Missouri | Missouri Horse Racing Commission | *(blank)* | Inactive — no site |
| 19 | Oregon | Oregon State Lottery | https://www.oregonlottery.org/ | Verified |
| 20 | Rhode Island | Rhode Island Division of Gaming and Athletics Licensing | https://dbr.ri.gov/gaming-and-athletics | Verified (corrected) |
| 21 | North Dakota | North Dakota Office of Attorney General - Gaming Division | https://attorneygeneral.nd.gov/licensing-and-gaming/gaming/ | Verified |
| 22 | North Dakota | North Dakota Racing Commission | https://www.racingcommission.nd.gov/ | Verified |
| 23 | Puerto Rico | Puerto Rico Gaming Commission (Comision de Juegos) | https://comjuegos.pr.gov/ | Verified (corrected) |
| 24 | Vermont | Vermont Attorney General | https://ago.vermont.gov/ | Verified** |
| 25 | Virgin Islands | Virgin Islands Racing Commission | https://dspr.vi.gov/horseracecommission.html | Verified |
| 26 | Virginia | Virginia Department of Agriculture and Consumer Services | https://www.vdacs.virginia.gov/food-fantasy-contests.shtml | Verified |

\* Arizona: `azdor.gov` returns HTTP 403 to the automated fetcher (bot protection); page content confirmed via a browser user-agent fetch.
\*\* Vermont: `ago.vermont.gov` returns HTTP 403 to the automated fetcher; it is the correct official AG domain, and the AG's authority over fantasy contests was independently confirmed via the official Vermont Legislature statute (31 V.S.A. ch. 25 §1334).

## Corrections to candidate URLs (do not reuse the bad ones)

- **Kentucky** — candidate `khrgc.ky.gov` does **not** resolve (connection refused). Correct/current site: **`khrc.ky.gov`** (agency kept the legacy domain after the Horse Racing Commission → Horse Racing and Gaming Corporation rebrand/merger).
- **Puerto Rico** — candidate `juegodepr.com` does **not** resolve. Correct site confirmed via the `pr.gov` agency directory: **`comjuegos.pr.gov`**. Horse racing is consolidated under this commission (its *Negociado del Deporte Hipico*); there is no separate active hípico body.
- **Rhode Island** — candidate `/divisions/gaming-athletics-licensing` path 404s. Live landing page: **`dbr.ri.gov/gaming-and-athletics`**.
- **North Carolina (ALE)** — bare `ale.nc.gov` did not resolve as a standalone homepage; ALE's official page is hosted on **`ncdps.gov`**.
- **New Jersey (DGE)** — older `nj.gov/oag/ge` now serves only a "page has been replaced" redirect; live canonical home is the **`njoag.gov`** path above.

## Items to flag for the integration step

- **Missouri Horse Racing Commission** — flagged inactive in the punch list and confirmed dormant. It is established under the Missouri Constitution (Amendment 7, 1984) and still appears in the state boards directory (`boards.mo.gov`), but Missouri has no active racetracks or pari-mutuel operations (only licensed racing ran 1986–1988). **No website** — row added with website blank and explanation in `notes`. Do not confuse with the separate, active Missouri Gaming Commission.
- **Maryland charitable** — there is **no statewide** charitable-gaming license; counties license bingo/raffles/games of chance. The Comptroller of Maryland handles Admissions & Amusement tax (on bingo/tip jars) and nonprofit (SUTEC) registration. The chosen URL is the Comptroller's A&A page (301-redirects to the Comptroller services knowledge base; resolves HTTP 200). The Regulator box for this line points to a tax/registration page, not a single licensing authority.
- **North Carolina State Lottery Commission** — two official surfaces exist: `ncgaming.gov` (the gaming-regulator site for sports wagering & pari-mutuel) and `nclottery.com` (lottery operations + commission roster). The CSV uses `ncgaming.gov` as the regulator homepage. Pari-mutuel/horse-race wagering is authorized by 2023 statute but still under rulemaking — not yet operational.
- **Vermont DFS** — DFS *operator registration* is filed with the VT Department of Liquor & Lottery, but *rulemaking and civil enforcement* authority sits with the Attorney General (the named agency). The row points to the AG site.
- **Arizona / Vermont** — both official sites block the automated fetcher (HTTP 403). URLs are correct; content/authority confirmed by alternate means noted above.
- **Some contact fields left blank** where the detail (phone/address/email/leadership) was not published on the official page itself (e.g., Arkansas phone/address appeared only in third-party snippets). Left blank per the sourcing rules rather than importing from aggregators.
