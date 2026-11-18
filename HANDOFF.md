# Handoff: "Alia's University Decision" website

## Goal
Build and host a simple, mobile-friendly static website called **Alia's University Decision**. It helps Alia, a UK A-level student (Chemistry, Biology, Psychology; predicted AAB–BBC), explore university courses and pick her 5 UCAS choices for 2027 entry before the **13 January 2027, 18:00 UK** deadline.

## Audience
- Primary: Alia (17–18), mostly on her phone.
- Secondary: family helping her decide.

## Site structure: 4 tabs
Information is split across tabs so she isn't overwhelmed. A persistent header shows the site title and a countdown to 13 Jan 2027 18:00 UK time. Tabs sit under the header (a bottom tab bar on mobile is fine).

| # | Tab | Contents |
| --- | --- | --- |
| 1 | **Overview** | Short intro line, then the full course list by discipline (see Content → Course list). Search box and a "uses my subjects (★)" filter. No links on this tab: these are generic subjects, not specific courses. |
| 2 | **Joint honours** | (a) Explainer at the top: what a joint honours degree is, "and" vs "with" table, pros and cons. (b) Combinations table. (c) Shortlist: science joint degrees. (d) Shortlist: science + business. Each shortlist row has an "Add to my 5" button. |
| 3 | **My 5 choices** | Courses she has added (max 5). Warn if the mix isn't 1 aspirational / 3 match / 1 safer. Remove and reorder. Empty state points her to the Joint honours tab. |
| 4 | **Key dates & checklist** | Key dates table, then the tickable checklist. |

Footer on every tab: "Offers change each year: always check the university's own 2027 page." Plus a Sources link.

- Use hash routing (`#overview`, `#joint-honours`, `#my-5`, `#dates`) so tabs are linkable and work on GitHub Pages. Default tab: Overview.
- Remember the last open tab in `localStorage`.

## Linking rules (important)
1. **Course names** link to the course page on the **university's own website** (URLs below).
2. **University names** link to that university's **UCAS provider page** (URLs below).
3. The Overview tab's generic subjects and the Combinations table get **no links**.
4. All external links open in a new tab with `rel="noopener noreferrer"`.
5. Store links in data, not hard-coded in HTML: `data/universities.json` (name → UCAS URL) and `data/courses.json` (each course references a university by id).
6. If your environment can reach the web, check every URL returns 200 and report any that fail. If it can't, say so and list the links as unchecked; don't swap in guessed URLs.

## Tech constraints
- Plain static site: HTML, CSS, vanilla JS. No backend, no database, no build step unless clearly needed.
- Saved choices, checklist ticks and last tab persist in `localStorage` (wrap reads/writes in try/catch).
- Accessible: semantic HTML, proper tab roles (`role="tablist"`, `aria-selected`), keyboard navigable, WCAG AA contrast.
- Fast: no heavy frameworks. One small CSS file, one small JS file.

## Hosting
- Default: **GitHub Pages** from a new public repo `alias-university-decision`.
- Alternatives if preferred: Netlify or Vercel.
- Ask me before creating the repo or deploying.

## Privacy (important)
- First name only. No surname, school, location, photos or contact details.
- Add `<meta name="robots" content="noindex, nofollow">`.
- No analytics or trackers.

## Acceptance criteria
- Works and looks good at 375px width and on desktop.
- All 4 tabs work, are linkable by URL hash, and are keyboard accessible.
- Every shortlisted course name links to the university's own course page; every university name links to its UCAS page.
- Picking a 6th course is blocked with a clear message.
- Refreshing keeps her picks, ticked checklist items and current tab.
- Lighthouse accessibility score ≥ 95.
- Deployed URL shared back with me.

---

## Data

### Universities → UCAS provider pages
| id | University | UCAS page |
| --- | --- | --- |
| manchester | University of Manchester | https://www.ucas.com/explore/unis/01b03c44/university-of-manchester |
| royal-holloway | Royal Holloway, University of London | https://ucas.com/explore/unis/5b13b3ae/royal-holloway-university-of-london |
| nottingham | University of Nottingham | https://www.ucas.com/explore/unis/79f42328/university-of-nottingham |
| lancaster | Lancaster University | https://www.ucas.com/explore/unis/058545dd/lancaster-university |
| sussex | University of Sussex | https://ucas.com/explore/unis/6e856d76/university-of-sussex |
| keele | Keele University | https://www.ucas.com/explore/unis/5e07e833/keele-university/student-life |
| stirling | University of Stirling | https://ucas.com/explore/unis/20b2137b/university-of-stirling |
| plymouth | University of Plymouth | https://www.ucas.com/explore/unis/250ab332/university-of-plymouth |
| durham | Durham University | https://ucas.com/explore/unis/6e455568/durham-university |
| edinburgh | University of Edinburgh | https://www.ucas.com/explore/unis/114bb2e7/university-of-edinburgh |
| leeds | University of Leeds | https://www.ucas.com/explore/unis/b03b9d06/university-of-leeds/student-life |
| kent | University of Kent | https://www.ucas.com/explore/unis/aa22c216/university-of-kent |
| aston | Aston University, Birmingham | https://www.ucas.com/explore/unis/89c29ffe/aston-university-birmingham/student-life |
| derby | University of Derby | https://www.ucas.com/explore/unis/008ac8a8/university-of-derby |
| imperial | Imperial College London | https://ucas.com/explore/unis/52087408/imperial-college-london/student-life |

Note: for Keele, Leeds, Aston and Imperial the verified URL is a sub-page of the provider profile. Try the same URL without `/student-life`; use it if it loads.

### Shortlist: science joint degrees
| Tier | Uni id | Course | Typical offer | Why it fits | Course page (university site) |
| --- | --- | --- | --- | --- | --- |
| Aspirational | manchester | Cognitive Neuroscience & Psychology | AAA–AAB | BPS-accredited; biology, nervous system, pharmacology; placement option | https://www.manchester.ac.uk/study/undergraduate/courses/2027/20942/bsc-cognitive-neuroscience-and-psychology/ |
| Aspirational | royal-holloway | Psychology, Clinical & Cognitive Neuroscience | AAA–AAB | Clinical focus; EPQ can lower grades | https://www.royalholloway.ac.uk/studying-here/undergraduate/psychology/psychology-clinical-and-cognitive-neuroscience/ |
| Aspirational | nottingham | Psychology & Cognitive Neuroscience | AAA–ABB | Brain imaging, physiological psychology; abroad or industry year | https://nottingham.ac.uk/ugstudy/course/Psychology-and-Cognitive-Neuroscience-BSc |
| Match | lancaster | Biology with Psychology | AAB incl. two sciences | Mostly biology, leaning to behaviour | https://lancaster.ac.uk/study/undergraduate/courses/biology-with-psychology-bsc-hons-c1c8 |
| Match | sussex | Psychology with Neuroscience | AAB | Mostly psychology, neuroscience options | https://www.sussex.ac.uk/study/undergraduate/courses/psychology-with-neuroscience-bsc |
| Match | keele | Neuroscience with Psychology | ABB incl. B in two sciences | Mostly neuroscience; Royal Society of Biology accredited | https://keele.ac.uk/study/undergraduate/undergraduatecourses/neurosciencewithpsychology |
| Safer | keele | Human Biology & Psychology | BBB incl. B in one science | True 50/50; lab skills plus psychology methods | https://keele.ac.uk/study/undergraduate/undergraduatecourses/humanbiologyandpsychology |
| Safer | stirling | Biology & Psychology | BBB | True 50/50; 4 years (Scotland) | https://www.stir.ac.uk/courses/ug/biology/ (see note) |
| Safer | plymouth | Psychology with Human Biology | 112 points (~BBC) incl. C in Biology | Mostly psychology with human biology | https://www.plymouth.ac.uk/courses/undergraduate/bsc-psychology-with-human-biology |
| Stretch | durham | Biology & Psychology | A*AA | New for 2027; only if an A* is realistic | https://www.durham.ac.uk/study/courses/biology-and-psychology-cf17/ |

Stirling note: no standalone Stirling page was found for Biology & Psychology; it appears to sit under the BSc Biology page. Show a small "(combined option on Biology page)" label next to the link.

### Shortlist: science + business
| Tier | Uni id | Course | Typical offer | Why it fits | Course page (university site) |
| --- | --- | --- | --- | --- | --- |
| Aspirational | manchester | Biology with Entrepreneurship (4 yrs) | AAA–AAB incl. AB in two core sciences | Two-thirds biology, one-third entrepreneurship | https://www.manchester.ac.uk/study/undergraduate/courses/2027/18038/bsc-biology-with-entrepreneurship/ |
| Aspirational | edinburgh | Biological Sciences with Management (4 yrs) | AAA–ABB | Top biology department plus management | https://study.ed.ac.uk/programmes/undergraduate/7-biological-sciences-with-management |
| Match | manchester | Life Sciences with Entrepreneurship (4 yrs) | AAB incl. two core sciences | Broader than biology alone; placement year | https://www.manchester.ac.uk/study/undergraduate/courses/2027/18043/bsc-life-sciences-with-entrepreneurship/ |
| Match | leeds | Biological Sciences (Biotechnology with Enterprise) | AAB, or ABB + A in EPQ | Lab to market; accredited; optional industry year | https://courses.leeds.ac.uk/g377/biological-sciences-biotechnology-with-enterprise-bsc |
| Match | sussex | Psychology with Business & Management | AAB | Mostly psychology; stats and programming plus business | https://www.sussex.ac.uk/study/undergraduate/courses/psychology-with-business-and-management-bsc-hons |
| Match | kent | Psychology with Business Psychology | ABB / 112–128 points | Mostly psychology; BPS-accredited | https://www.kent.ac.uk/courses/undergraduate/2027/6521/psychology-with-business-psychology |
| Safer | aston | Psychology & Business (4 yrs incl. placement) | BCC | True 50/50; first step to Chartered Psychologist | https://www.aston.ac.uk/study/courses/psychology-and-business-bsc |
| Safer | derby | Psychology & Business Management (BA) | BBC | Flexible: equal split or major in one | https://www.derby.ac.uk/undergraduate/joint-honours-courses/psychology-and-business-management-ba-hons/ |
| Stretch | imperial | Biological Sciences with Management | AAA minimum | Includes a year at Imperial Business School | https://www.imperial.ac.uk/study/courses/undergraduate/2027/biological-sciences-management/ |

Show this note under the science + business table: business is the easier subject to add later (a one-year master's in management); adding science later is much harder, so science should lead.

---

## Content

### Overview tab: course list by discipline (no links)
★ = uses her subjects directly. ⚠ = often also needs A-level Maths or Physics (or a foundation year).

| Discipline | Courses |
| --- | --- |
| Life sciences | Biology ★, Biological Sciences ★, Biochemistry ★, Biomedical Science ★, Molecular & Cellular Biology ★, Genetics ★, Microbiology ★, Immunology ★, Physiology ★, Pharmacology ★, Neuroscience ★, Zoology, Marine Biology, Ecology & Conservation, Plant Science, Biotechnology ★, Forensic Science ★ |
| Chemistry and physical sciences | Chemistry ★ (⚠ some want Maths), Medicinal Chemistry ★, Pharmaceutical Science ★, Environmental Science, Natural Sciences (⚠ top courses), Earth Sciences / Geology |
| Psychology and the brain | Psychology ★ (choose BPS-accredited), Psychology with Neuroscience ★, Cognitive Science, Behavioural Science, Forensic Psychology, Criminology & Psychology, Sport & Exercise Psychology, Child Development |
| Medicine and dentistry (2028 entry now) | Medicine ★ (UCAT required), Dentistry ★, Graduate-entry Medicine |
| Allied health professions | Physiotherapy ★, Occupational Therapy ★, Radiography (⚠), Speech & Language Therapy ★, Dietetics ★, Paramedic Science, Operating Department Practice, Orthoptics, Podiatry, Audiology, Healthcare Science, Prosthetics & Orthotics (⚠) |
| Nursing and midwifery | Adult, Children's, Mental Health ★, Learning Disability Nursing; Midwifery ★ |
| Pharmacy and optometry | Pharmacy (MPharm) ★, Optometry ★, Physician Associate (usually postgraduate) |
| Animal and veterinary | Veterinary Medicine ★ (2028 entry), Veterinary Nursing, Animal Science, Animal Behaviour ★, Equine Science, Bioveterinary Science ★ |
| Sport, nutrition and public health | Sport & Exercise Science ★, Nutrition ★, Food Science, Public Health, Global Health, Health Sciences |
| Engineering and technology (⚠ foundation year) | Biomedical Engineering, Chemical Engineering, Bioengineering, Data Science, Bioinformatics |
| Social sciences and humanities | Criminology, Sociology, Social Work, Education / Primary Teaching (QTS), Anthropology, Human Geography, Philosophy, Economics (⚠) |
| Law, business and management | Law (LLB), Business & Management, Healthcare Management, Marketing, HR Management, Accounting & Finance |
| Flexible routes | Liberal Arts, Joint honours (see Joint honours tab), Degree apprenticeships (earn while studying, no fees) |

### Joint honours tab: explainer
A joint honours degree lets you study two subjects in the time of one degree, usually 3 years (4 with a placement, a year abroad, or in Scotland). The word in the course title shows the split.

| Title looks like | Format | Split |
| --- | --- | --- |
| Biology **and** Psychology | Joint honours | ~50/50 |
| Psychology **with** Biology | Major/minor | ~75/25 |

| Pros | Cons |
| --- | --- |
| Keeps two career paths open | Less depth in each subject |
| Stands out if she can explain why the two fit together | Possible timetable clashes between departments |
| Same chance of a good degree as single honours | Psychology accreditation can be lost on some courses |
| Business is easy to add as a minor | Can feel like double the background reading |

Natural Sciences (e.g. Durham, Bath, UCL) is an alternative: one flexible degree mixing biology, chemistry and psychology modules.

### Joint honours tab: combinations (no links)
| Combination | Why it fits | Leads to |
| --- | --- | --- |
| Biology & Psychology | Uses all three subjects | Neuroscience, clinical research, health psychology |
| Psychology & (Cognitive) Neuroscience | Brain biology plus behaviour | Research, clinical psychology, pharma |
| Chemistry & Biology / Biochemistry | Her two strongest sciences | Lab science, pharma, biotech |
| Psychology & Criminology | Forensic angle, less lab work | Probation, police, forensic psychology |
| Psychology & Education | Child development | Teaching, educational psychology |
| Psychology & Business | Consumer and workplace behaviour | Marketing, HR, UX research |
| Biology / Life Sciences & Business | Science plus commercial skills | Biotech, pharma, consulting |

### Key dates & checklist tab
| Date | What happens |
| --- | --- |
| 13 January 2027, 18:00 UK time | Main UCAS deadline for equal consideration on most courses |
| 25 February 2027 | UCAS Extra opens for anyone without an offer |
| August 2027 | A-level results day |

UCAS allows 5 choices. Suggested mix: 1 aspirational, 3 match, 1 safer.

Checklist:
- Confirm each course still runs for 2027 entry on UCAS.
- Check each university's own 2027 page for the offer.
- Check BPS accreditation if psychology careers might interest her.
- Check IBMS accreditation if NHS biomedical scientist work is a goal.
- Pick 5 choices: 1 aspirational, 3 match, 1 safer.
- Write one personal statement that fits all 5 courses.
- Submit before 18:00 UK time on 13 January 2027.

### Sources
- UCAS 2027 deadline: https://www.ucas.com/events/2027-entry-deadline-for-all-undergraduate-courses-except-those-with-a-15-october-deadline-475546
- UCAS key dates (The Profs): https://www.theprofs.co.uk/student-resources/university-applications/ucas-key-dates-and-deadlines-for-2027-entry/
- Joint honours FAQs (KCL): https://blogs.kcl.ac.uk/betweentheacts/the-joint-honours-degree-faqs
- Course and UCAS pages as linked above.
