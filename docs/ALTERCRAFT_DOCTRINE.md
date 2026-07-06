# AlterCraft Doctrine

Status date: 2026-07-03

AlterCraft is being shaped as a complete infra execution partner for designers, architects, builders, developers, realtors and contractors.

The business should be easy to understand:

> Partners bring the project. AlterCraft executes the work with labour, material, manufacturing, robotics, site proof, payment discipline and handover control.

## Sovereignty Rule

AlterCraft must own the operating intelligence.

No intelligent outsourcing:

- no black-box accountant,
- no black-box agency,
- no black-box software,
- no advisor who understands AlterCraft better than AlterCraft's own system.

External professionals may be used only as statutory adapters where law requires a licensed signer, auditor, portal filing credential or certificate. They do not become the brain of the business. The internal system must still know the numbers first.

Doctrine:

> AlterCraft builds the books of truth. Outside signers only validate or file what the system already knows.

## Positioning

AlterCraft should be positioned as an execution partner, not only an interior brand.

Core work domains:

- exterior execution,
- interior fitout,
- modular manufacturing,
- robotics and site automation,
- civil and block work,
- concrete and base work,
- finishing and handover work.

Core partner types:

- designers with client work but no execution team,
- architects who need reliable site delivery,
- builders who need labour or material support,
- developers who need bulk execution,
- realtors and estate partners who need repair, finishing or handover support,
- contractors who need manufacturing, manpower, robotics support or site control help.

## Product Stack

### Contractor Desk

Contractor Desk is the partner-facing app.

It should stay simple:

- create account,
- choose service,
- choose labour, material, labour plus material, turnkey or white-label execution,
- enter approximate work area,
- see an indicative rate and estimate,
- place or save a project request,
- track project, proof, money and message drafts.

Do not expose internal version labels such as V1, V2 or command-center terms in the user-facing app.

### OperatorDesk

OperatorDesk is the internal control app.

It should help AlterCraft control:

- leads,
- jobs,
- payment gates,
- cash buckets,
- labour movement,
- material movement,
- site proof,
- disputes,
- team roles.

OperatorDesk can remain private while Contractor Desk becomes the cleaner B2B entry point.

### Robotics Layer

Robotics is part of the long-term AlterCraft execution stack.

The robotics lane can include:

- shop-floor jigs and assisted manufacturing,
- CNC/router workflow support,
- cutting, drilling, sanding or repetitive fabrication aids,
- site measurement and survey tools,
- proof-capture devices,
- material movement aids,
- small automation rigs for recurring production tasks,
- future service robots only after prototypes are real.

Doctrine:

- Robotics must reduce labour chaos, proof gaps, rework, risk or production time.
- Do not buy machines for ego; buy or build machines only when a repeatable task is already proven.
- Do not claim robotic execution, autonomous site work or automated manufacturing until the hardware, workflow, operator SOP and safety process exist.
- Robotics data should feed OperatorDesk, Contractor Desk proof records and Capital Desk asset tracking.
- Every robot, tool or automation rig is a business asset with cost, maintenance, operator, safety status and ROI target.

### Central DB

The first central database layer now exists locally.

Current state:

- local SQLite database,
- schema in `server/db/schema.sql`,
- backend API in `server/centralDbServer.mjs`,
- runbook in `docs/contractor-desk-central-db.md`.
- user account, login ID, user ID, admin notes and starter data tables now exist in the local DB.
- `/contractor-admin` is the local AlterCraft admin desk for user setup and guided onboarding.

Doctrine:

- GitHub stores code and documentation, not live customer/project data.
- Local SQLite is for development and workflow testing.
- Hosted database comes next, preferably Supabase for the first live test unless a stronger reason appears.
- Do not claim production cloud, secure login, file upload or real-time sync until those parts are actually built and tested.

## Money Doctrine

Execution work should not move blindly.

- No site movement without a payment gate.
- No labour dispatch without advance or written exception.
- No material purchase without material payment or approved internal allocation.
- No received cash without a bucket.
- No handover without final payment status and proof record.
- Incoming cash is operating oxygen, not free spending money.

## Capital And Compliance Doctrine

AlterCraft's accounting system must be built as an internal control engine, not as a monthly panic folder for somebody else to decode.

The system must track:

- every client invoice,
- every receipt,
- every vendor bill,
- every labour payout,
- every material purchase,
- every capital injection,
- every owner withdrawal,
- every GST amount collected,
- every eligible input tax credit signal,
- every income-tax reserve,
- every proof record linked to a project, party and payment.

### GST State Machine

GST is custody money. It is not operating profit.

For every invoice and expense, the system should store:

- invoice date,
- party name,
- GSTIN if available,
- taxable value,
- GST rate,
- output GST or input GST,
- payment status,
- project link,
- proof reference,
- filing month.

Monthly GST discipline:

- GSTR-1 is the outward invoice statement.
- GSTR-3B is the settlement return.
- The dashboard must show output GST, visible input credit, net payable, and filing readiness before portal filing.
- Portal filing dates can change by notification, so the system should show statutory targets and require a current portal check before final filing.

### Income Tax State Machine

Income tax is paid on taxable profit, not on raw revenue.

The system should separate:

- gross revenue,
- direct project cost,
- labour and supervision,
- logistics and fuel,
- tools and equipment,
- software and API costs,
- office and admin costs,
- founder capital introduced,
- owner drawings,
- net taxable profit estimate,
- advance tax reserve.

Advance tax should be treated as a quarterly reserve gate. The system should warn before 15 June, 15 September, 15 December and 15 March based on estimated annual profit.

### Statutory Signer Boundary

The doctrine is not "trust a CA." The doctrine is "never outsource the intelligence."

If a proprietorship or company law threshold requires a CA, auditor or statutory form upload, that person is only a signer/verifier against AlterCraft's own books. They get structured exports from the system, not messy WhatsApp trails and memory-based explanations.

Required boundary:

- AlterCraft calculates first.
- AlterCraft stores proof first.
- AlterCraft classifies transactions first.
- AlterCraft generates filing packs first.
- A statutory signer only checks, signs or uploads where law requires it.

This keeps control inside the company while still respecting legal requirements.

### Corporate Structure Reality

A private limited company can improve B2B trust and create separation between founder and company, but the liability shield must not be oversold.

Limited liability can weaken if:

- personal guarantees are signed,
- personal and business money are mixed,
- statutory dues are ignored,
- fraud or deliberate misstatement happens,
- directors fail legal duties.

Therefore:

- keep business bank flows separate,
- do not pay site chaos from undocumented personal cash,
- record owner capital introduced,
- record owner drawings separately,
- keep board/shareholder/auditor documents in a corporate folder,
- never present a Pvt. Ltd. as magic protection.

### Capital Desk Product Target

Capital Desk becomes the finance and compliance layer inside the AlterECO system.

Minimum first build:

- daily cash position,
- labour due tomorrow,
- vendor payable,
- client receivable,
- material requirement,
- GST custody amount,
- tax reserve,
- project margin,
- proof missing,
- next collection action.

Capital Desk should connect to Contractor Desk projects and OperatorDesk job/cash movement. It should not claim final tax filing until portal export, sign-off flow and production backend security exist.

## Proof Doctrine

Proof protects AlterCraft and the partner.

- No verbal-only scope.
- No undocumented asset.
- No project without owner and next action.
- No stage movement without proof or written reason.
- No dispute conversation without evidence first.
- No emotional escalation; settlement first, lawful escalation only.

## Data Doctrine

The product must stay honest.

- If data is only saved on the device, say it clearly.
- If data is saved in the local backend, call it local backend.
- If data is cloud-hosted, only say so after the hosted database and API are live.
- Every backend project should belong to a user ID when the user is logged in.
- AlterCraft admin may create starter data for a user during onboarding, but it must remain visibly editable and traceable.
- Do not put live customer records, payment trails or sensitive site files into GitHub commits.
- Do not design flows that require users to trust fake upload, fake login or fake automation.

## Revenue Doctrine

The B2B model should favour repeatable bulk work.

Revenue lanes:

- labour supply,
- labour plus material execution,
- material sourcing,
- modular manufacturing,
- robotics-assisted manufacturing and site automation,
- automation setup, tool jigs and production workflow support,
- turnkey execution,
- white-label execution for designers and builders,
- supervision or site-control fee,
- proof/reporting and operating support as a premium layer.

Pricing should stay understandable: area, service, execution type, estimated range, token/payment gate and next action.

## 30-Day Operating Dashboard

The doctrine should become a weekly operating rhythm.

Track:

- new partner requests,
- quoted project value,
- token amount expected,
- cash collected,
- pending payment reduced,
- active sites by stage,
- proof records created,
- labour days deployed,
- material purchases controlled,
- manufacturing jobs started or closed,
- robotics/automation experiments shipped,
- tool or machine ROI tracked,
- disputes prevented or settled,
- SOPs written,
- backend/product modules shipped,
- founder decision latency reduced.

## Current Rule

Build small, make it real, keep the language clean, and never let the product promise more than the system can actually do today.

## Verified Compliance Anchors

These are anchors for product logic, not legal advice. Re-check the portals before filing because dates, thresholds and forms can change by notification.

- GST portal guidance says monthly GSTR-1 is generally due on the 11th day of the succeeding month for monthly filers.
- GST portal guidance says monthly GSTR-3B is generally due on the 20th day of the succeeding month for monthly filers.
- Income Tax portal guidance uses advance-tax gates around 15 June, 15 September, 15 December and 15 March.
- India Code Companies Act, 2013, Section 149 establishes company board/director requirements, including two directors for a private company.
- India Code Companies Act, 2013, Section 139 establishes company auditor appointment requirements.
- Income Tax portal Form 3CA-3CD guidance says audit forms under section 44AB are CA-uploaded with DSC where applicable.

Reference links:

- https://tutorial.gst.gov.in/userguide/returns/GSTR_1.htm
- https://tutorial.gst.gov.in/userguide/returns/GSTR3B.htm
- https://www.incometax.gov.in/iec/foportal/help/e-filing-itr1-form-sahaj-faq
- https://www.indiacode.nic.in/handle/123456789/2114
- https://www.incometax.gov.in/iec/foportal/help/statutory-forms/popular-form/form3ca-3cd-um
