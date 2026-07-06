import React, { FormEvent, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import '../styles/planner.css';
import {
  ArrowRight,
  ClipboardCheck,
  Eye,
  FileImage,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  Ruler,
  Sparkles,
  Upload,
} from 'lucide-react';
import { ElegantLayout } from '../components/elegant/ElegantLayout';
import {
  AdminLeadTable,
  ConceptCard,
  CTAButton,
  MeasurementSummary,
  PreviewDisclaimer,
  ProjectTypeCard,
  SectionHeader,
  StatusBadge,
  UploadField,
} from '../components/aiPlanner/PlannerComponents';
import {
  DESIGN_PREVIEW_STANDARDS,
  LEAD_STATUS_FLOW,
  PREFERRED_STYLES,
  PROJECT_TYPES,
  emptyPlannerDraft,
  examplePlannerProjects,
  type ImaginationConcept,
  type LeadStatus,
  type PlannerDraft,
  type PlannerProjectRecord,
  type UploadAsset,
} from '../data/aiPlanner';
import { canvaVisuals } from '../data/visualAssets';
import { SEOHead } from '../components/seo/SEOHead';
import { siteDetails } from '../data/siteDetails';
import { createWhatsappLink } from '../utils/contact';

const DRAFT_KEY = 'altercraft_ai_planner_draft';
const PROJECTS_KEY = 'altercraft_ai_planner_projects';
const LATEST_REQUEST_KEY = 'altercraft_latest_request_id';

const aiPlannerSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI-Assisted Interior Design Planner India',
  serviceType: 'AI-assisted imagination preview and human-verified interior execution planning',
  url: 'https://www.altercraft.in/ai-planner/',
  provider: {
    '@type': 'LocalBusiness',
    name: 'AlterCraft',
    telephone: '+918817503658',
    email: siteDetails.email,
  },
  areaServed: siteDetails.serviceAreas,
  description:
    'Upload room photos, dimensions, budget and requirements to request an AI-assisted imagination preview. AlterCraft human designers verify dimensions, feasibility, materials, quotation and execution details before project confirmation.',
};

const readJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const loadDraft = () => readJson<PlannerDraft>(DRAFT_KEY, emptyPlannerDraft());
const saveDraft = (draft: PlannerDraft) => writeJson(DRAFT_KEY, draft);
const clearDraft = () => {
  if (typeof window !== 'undefined') window.localStorage.removeItem(DRAFT_KEY);
};

const loadStoredProjects = () => readJson<PlannerProjectRecord[]>(PROJECTS_KEY, []);

const saveStoredProjects = (projects: PlannerProjectRecord[]) => writeJson(PROJECTS_KEY, projects);

const loadAllProjects = () => {
  const stored = loadStoredProjects();
  const storedIds = new Set(stored.map((record) => record.project.requestId));
  const remainingExamples = examplePlannerProjects.filter((record) => !storedIds.has(record.project.requestId));
  return [...stored, ...remainingExamples];
};

const saveProjectRecord = (record: PlannerProjectRecord) => {
  const stored = loadStoredProjects();
  const next = [record, ...stored.filter((item) => item.project.requestId !== record.project.requestId)];
  saveStoredProjects(next);
};

const getProjectByRequestId = (id?: string) =>
  loadAllProjects().find((record) => record.project.requestId === id || record.project.id === id);

const notProvided = (value?: string) => (value && value.trim() ? value : 'Not provided');

const generateRequestId = () => {
  const allIds = loadAllProjects().map((record) => record.project.requestId);
  const maxNumber = allIds.reduce((max, requestId) => {
    const match = requestId.match(/AC-IMG-(\d+)/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `AC-IMG-${String(maxNumber + 1).padStart(4, '0')}`;
};

function PlannerPageShell({ children }: { children: React.ReactNode }) {
  return (
    <ElegantLayout>
      <main className="planner-page">
        {children}
      </main>
    </ElegantLayout>
  );
}

function PlannerHero({
  kicker,
  title,
  copy,
  children,
}: {
  kicker: string;
  title: string;
  copy: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="planner-hero">
      <div className="elegant-container planner-hero-grid">
        <div>
          <p className="planner-kicker">{kicker}</p>
          <h1>{title}</h1>
          <p>{copy}</p>
          <PreviewDisclaimer />
          {children ? <div className="planner-hero-actions">{children}</div> : null}
        </div>
        <div className="planner-hero-board" aria-label="AlterCraft design preview workflow">
          {['Share Photos', 'Add Room Sizes', 'Design Preview', 'Designer Review', 'Final Details', 'Quotation'].map((item, index) => (
            <div key={item}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AIPlannerLanding() {
  return (
    <PlannerPageShell>
      <SEOHead
        title="AI Interior Design Planner India | AlterCraft Imagination Preview"
        description="Upload room photos and dimensions for an AI-assisted imagination preview. AlterCraft converts selected concepts into human-verified execution design, quotation and installation planning."
        canonical="https://www.altercraft.in/ai-planner/"
        jsonLd={[aiPlannerSchema]}
      />
      <PlannerHero
        kicker="Design Preview"
        title="Share Your Space With AlterCraft"
        copy="Upload photos, add the important sizes, and tell us what you want. We will prepare a first design preview and then discuss the practical details with you."
      >
        <CTAButton to="/ai-planner/start">Start My Request</CTAButton>
        <CTAButton to="/my-projects/AC-IMG-0001" variant="secondary">View Preview Example</CTAButton>
      </PlannerHero>

      <section className="planner-section">
        <div className="elegant-container">
          <SectionHeader
            kicker="Process"
            title="From photos to a clear next step"
            copy="Share the details once. AlterCraft can then prepare a preview, check the measurements and guide you toward a quotation."
          />
          <div className="planner-step-grid">
            {[
              ['01', 'Upload Site Photo', 'Clear photos, extra angles, rough sketch and references are attached.'],
              ['02', 'Add Room Sizes', 'Length, width, height and important room details are saved as you provide them.'],
              ['03', 'Get a First Design Preview', 'AlterCraft prepares visual directions for you to review.'],
              ['04', 'Discuss the Final Plan', 'Our team checks sizes, materials, quotation and production details.'],
            ].map(([num, title, copy]) => (
              <article key={num} className="planner-step-card">
                <span>{num}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PlannerPageShell>
  );
}

export function AIPlannerStart() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<PlannerDraft>(() => loadDraft());

  const selectType = (projectType: string) => {
    const next = { ...draft, projectType };
    setDraft(next);
    saveDraft(next);
  };

  return (
    <PlannerPageShell>
      <section className="planner-section planner-section-top">
        <div className="elegant-container">
          <SectionHeader
            kicker="Step 1"
            title="Select Project Type"
            copy="Choose the category closest to your requirement. This helps our team understand your photos and room details."
          />
          <div className="planner-type-grid">
            {PROJECT_TYPES.map((type) => (
              <ProjectTypeCard
                key={type}
                title={type}
                active={draft.projectType === type}
                onClick={() => selectType(type)}
              />
            ))}
          </div>
          <div className="planner-form-actions">
            <CTAButton to="/ai-planner" variant="secondary">Back</CTAButton>
            <CTAButton
              onClick={() => navigate('/ai-planner/upload')}
              disabled={!draft.projectType}
            >
              Continue to Upload
            </CTAButton>
          </div>
        </div>
      </section>
    </PlannerPageShell>
  );
}

export function AIPlannerUpload() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<PlannerDraft>(() => loadDraft());

  const captureFiles = (label: string, files: FileList | null) => {
    if (!files?.length) return;
    const timestamp = new Date().toISOString();
    const nextUploads: UploadAsset[] = Array.from(files).map((file, index) => ({
      id: `upl-${Date.now()}-${index}`,
      projectId: 'draft',
      fileUrl: '',
      fileType: file.type || 'file',
      label,
      fileName: file.name,
      uploadedAt: timestamp,
    }));
    const next = {
      ...draft,
      uploads: [
        ...draft.uploads.filter((upload) => upload.label !== label || label === 'Extra photos'),
        ...nextUploads,
      ],
    };
    setDraft(next);
    saveDraft(next);
  };

  return (
    <PlannerPageShell>
      <section className="planner-section planner-section-top">
        <div className="elegant-container planner-form-layout">
          <div>
            <p className="planner-kicker">Step 2</p>
            <h1>Upload Site Photo</h1>
            <p>
              Add clear photos from multiple angles. The selected file names stay on this
              device while you complete the request.
            </p>
            <PreviewDisclaimer compact />
            <div className="planner-upload-grid">
              <UploadField id="main-site-photo" label="Main site photo" helper="Front view of the room or product area." onFilesSelected={(files) => captureFiles('Main site photo', files)} />
              <UploadField id="extra-photos" label="Extra photos" helper="Side angles, close-ups and problem areas." multiple onFilesSelected={(files) => captureFiles('Extra photos', files)} />
              <UploadField id="rough-sketch" label="Rough sketch/plan photo" helper="Hand sketch, builder plan or marked drawing." onFilesSelected={(files) => captureFiles('Rough sketch/plan photo', files)} />
              <UploadField id="reference-image" label="Reference image, optional" helper="Style reference or inspiration image." onFilesSelected={(files) => captureFiles('Reference image', files)} />
            </div>
          </div>
          <aside className="planner-side-card">
            <h2>Captured files</h2>
            {draft.uploads.length ? (
              <ul>
                {draft.uploads.map((upload) => (
                  <li key={upload.id}>
                    <FileImage size={16} />
                    <span>{upload.label}: {upload.fileName}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No files selected yet.</p>
            )}
            <div className="planner-form-actions compact">
              <CTAButton to="/ai-planner/start" variant="secondary">Back</CTAButton>
              <CTAButton onClick={() => navigate('/ai-planner/dimensions')}>Continue</CTAButton>
            </div>
          </aside>
        </div>
      </section>
    </PlannerPageShell>
  );
}

export function AIPlannerDimensions() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<PlannerDraft>(() => loadDraft());

  const updateMeasurement = (name: string, value: string) => {
    const next = { ...draft, measurements: { ...draft.measurements, [name]: value } };
    setDraft(next);
    saveDraft(next);
  };

  return (
    <PlannerPageShell>
      <section className="planner-section planner-section-top">
        <div className="elegant-container">
          <SectionHeader
            kicker="Step 3"
            title="Add Dimensions"
            copy="Please add the sizes as carefully as possible. AlterCraft will not guess or change measurements that you provide."
          />
          <form className="planner-form">
            <div className="planner-form-grid">
              <label>Length<input value={draft.measurements.length} onChange={(event) => updateMeasurement('length', event.target.value)} placeholder="Example: 11" /></label>
              <label>Width<input value={draft.measurements.width} onChange={(event) => updateMeasurement('width', event.target.value)} placeholder="Example: 8" /></label>
              <label>Height<input value={draft.measurements.height} onChange={(event) => updateMeasurement('height', event.target.value)} placeholder="Example: 10" /></label>
              <label>Unit<select value={draft.measurements.unit} onChange={(event) => updateMeasurement('unit', event.target.value)}><option value="ft">ft</option><option value="inch">inch</option><option value="mm">mm</option></select></label>
              <label>Door location<input value={draft.measurements.doorLocation} onChange={(event) => updateMeasurement('doorLocation', event.target.value)} placeholder="Example: left wall near entrance" /></label>
              <label>Window location<input value={draft.measurements.windowLocation} onChange={(event) => updateMeasurement('windowLocation', event.target.value)} placeholder="Example: above sink wall" /></label>
              <label>Existing flooring<input value={draft.measurements.flooring} onChange={(event) => updateMeasurement('flooring', event.target.value)} placeholder="Tile, marble, wooden, unfinished" /></label>
              <label>Existing ceiling<input value={draft.measurements.ceiling} onChange={(event) => updateMeasurement('ceiling', event.target.value)} placeholder="Plain, false ceiling, exposed" /></label>
              <label>Electrical point location<textarea value={draft.measurements.electricalPoints} onChange={(event) => updateMeasurement('electricalPoints', event.target.value)} placeholder="Mention switchboards, appliance points, light points" /></label>
              <label>Plumbing point location<textarea value={draft.measurements.plumbingPoints} onChange={(event) => updateMeasurement('plumbingPoints', event.target.value)} placeholder="Mention sink, water inlet, drain points" /></label>
              <label>Required width<input value={draft.measurements.requiredWidth} onChange={(event) => updateMeasurement('requiredWidth', event.target.value)} placeholder="For furniture/custom unit projects" /></label>
              <label>Required height<input value={draft.measurements.requiredHeight} onChange={(event) => updateMeasurement('requiredHeight', event.target.value)} placeholder="For furniture/custom unit projects" /></label>
              <label>Required depth<input value={draft.measurements.requiredDepth} onChange={(event) => updateMeasurement('requiredDepth', event.target.value)} placeholder="For wardrobes, TV units, shelves" /></label>
              <label>Material preference<input value={draft.measurements.materialPreference} onChange={(event) => updateMeasurement('materialPreference', event.target.value)} placeholder="Plywood, HDHMR, laminate, veneer, unsure" /></label>
              <label className="planner-form-wide">Storage requirement<textarea value={draft.measurements.storageRequirement} onChange={(event) => updateMeasurement('storageRequirement', event.target.value)} placeholder="Hanging, drawers, loft, pantry, files, shoes, luggage" /></label>
              <label className="planner-form-wide">Notes<textarea value={draft.measurements.notes} onChange={(event) => updateMeasurement('notes', event.target.value)} placeholder="Anything important the team should not miss" /></label>
            </div>
          </form>
          <div className="planner-note-card">
            <LockKeyhole size={18} />
            <p>We will use the sizes exactly as shared. Missing dimensions will stay marked as "Not provided".</p>
          </div>
          <div className="planner-form-actions">
            <CTAButton to="/ai-planner/upload" variant="secondary">Back</CTAButton>
            <CTAButton onClick={() => navigate('/ai-planner/requirements')}>Continue to Details</CTAButton>
          </div>
        </div>
      </section>
    </PlannerPageShell>
  );
}

export function AIPlannerRequirements() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<PlannerDraft>(() => loadDraft());

  const updateRequirement = (name: string, value: string) => {
    const next = { ...draft, requirements: { ...draft.requirements, [name]: value } };
    setDraft(next);
    saveDraft(next);
  };

  return (
    <PlannerPageShell>
      <section className="planner-section planner-section-top">
        <div className="elegant-container">
          <SectionHeader
            kicker="Step 4"
            title="Add Requirement"
            copy="Tell the team what should be designed, the budget direction, city, preferred style and timeline."
          />
          <form className="planner-form">
            <div className="planner-form-grid">
              <label className="planner-form-wide">What do you want to design?<textarea value={draft.requirements.designIntent} onChange={(event) => updateRequirement('designIntent', event.target.value)} placeholder="Example: Premium beige modular kitchen with tall pantry and more drawers" /></label>
              <label>Preferred style<select value={draft.requirements.preferredStyle} onChange={(event) => updateRequirement('preferredStyle', event.target.value)}><option value="">Select style</option>{PREFERRED_STYLES.map((style) => <option key={style} value={style}>{style}</option>)}</select></label>
              <label>Budget range<input value={draft.requirements.budgetRange} onChange={(event) => updateRequirement('budgetRange', event.target.value)} placeholder="Example: 2-4 lakh, premium practical" /></label>
              <label>City/location<input value={draft.requirements.city} onChange={(event) => updateRequirement('city', event.target.value)} placeholder="Example: Noida Sector 76" /></label>
              <label>Expected timeline<input value={draft.requirements.expectedTimeline} onChange={(event) => updateRequirement('expectedTimeline', event.target.value)} placeholder="Example: 30-45 days" /></label>
              <label>Your name<input value={draft.requirements.customerName} onChange={(event) => updateRequirement('customerName', event.target.value)} placeholder="Customer name" /></label>
              <label>WhatsApp phone<input value={draft.requirements.customerPhone} onChange={(event) => updateRequirement('customerPhone', event.target.value)} placeholder="+91 ..." /></label>
              <label>Email<input value={draft.requirements.customerEmail} onChange={(event) => updateRequirement('customerEmail', event.target.value)} placeholder="Optional" /></label>
              <label className="planner-form-wide">Special notes<textarea value={draft.requirements.specialNotes} onChange={(event) => updateRequirement('specialNotes', event.target.value)} placeholder="Any style, material, vastu, storage, brand, or family use detail" /></label>
            </div>
          </form>
          <div className="planner-form-actions">
            <CTAButton to="/ai-planner/dimensions" variant="secondary">Back</CTAButton>
            <CTAButton onClick={() => navigate('/ai-planner/confirm')}>Review Details</CTAButton>
          </div>
        </div>
      </section>
    </PlannerPageShell>
  );
}

export function AIPlannerConfirm() {
  const navigate = useNavigate();
  const [draft] = useState<PlannerDraft>(() => loadDraft());
  const [confirmed, setConfirmed] = useState(false);

  const submitRequest = (event: FormEvent) => {
    event.preventDefault();
    if (!confirmed) return;

    const createdAt = new Date().toISOString();
    const requestId = generateRequestId();
    const projectId = `prj-${Date.now()}`;
    const userId = `usr-${Date.now()}`;
    const user = {
      id: userId,
      name: draft.requirements.customerName,
      phone: draft.requirements.customerPhone,
      email: draft.requirements.customerEmail,
      city: draft.requirements.city,
      createdAt,
    };

    const record: PlannerProjectRecord = {
      user,
      project: {
        id: projectId,
        requestId,
        userId,
        projectType: draft.projectType || 'Other',
        title: `Design Preview for ${draft.projectType || 'Custom Project'}`,
        budgetRange: draft.requirements.budgetRange,
        city: draft.requirements.city,
        status: 'New Request',
        createdAt,
      },
      measurements: {
        ...draft.measurements,
        projectId,
        lockedStatus: 'Locked',
      },
      uploads: draft.uploads.map((upload) => ({ ...upload, projectId })),
      requirements: draft.requirements,
      concepts: [],
      lead: {
        id: `lead-${Date.now()}`,
        projectId,
        selectedConceptId: '',
        customerName: draft.requirements.customerName,
        customerPhone: draft.requirements.customerPhone,
        leadStatus: 'New Request',
        assignedTo: 'AlterCraft Design Team',
        createdAt,
      },
      selectedConceptId: '',
      internalNotes: '',
    };

    saveProjectRecord(record);
    if (typeof window !== 'undefined') window.localStorage.setItem(LATEST_REQUEST_KEY, requestId);
    clearDraft();
    navigate(`/ai-planner/submitted?requestId=${requestId}`);
  };

  return (
    <PlannerPageShell>
      <section className="planner-section planner-section-top">
        <div className="elegant-container planner-confirm-layout">
          <MeasurementSummary
            projectType={draft.projectType}
            measurements={draft.measurements}
            budget={draft.requirements.budgetRange}
            style={draft.requirements.preferredStyle}
            uploadCount={draft.uploads.length}
          />
          <form className="planner-confirm-card" onSubmit={submitRequest}>
            <p className="planner-kicker">Final Check</p>
            <h1>Review Your Details</h1>
            <p>
              Please review the summary before submitting. Missing information will stay marked as
              "Not provided" so our team can confirm it with you.
            </p>
            <PreviewDisclaimer compact />
            <label className="planner-checkbox">
              <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
              <span>I confirm these details are correct. I understand AlterCraft will use these dimensions as shared.</span>
            </label>
            <div className="planner-form-actions compact">
              <CTAButton to="/ai-planner/requirements" variant="secondary">Back</CTAButton>
              <CTAButton type="submit" disabled={!confirmed}>Submit Design Preview Request</CTAButton>
            </div>
          </form>
        </div>
      </section>
    </PlannerPageShell>
  );
}

export function AIPlannerSubmitted() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const requestId = query.get('requestId') || (typeof window !== 'undefined' ? window.localStorage.getItem(LATEST_REQUEST_KEY) : '') || 'AC-IMG-0001';

  return (
    <PlannerPageShell>
      <section className="planner-section planner-section-top">
        <div className="elegant-container planner-success-card">
          <Sparkles size={36} />
          <p className="planner-kicker">Submitted</p>
          <h1>Your Design Preview Request Has Been Received</h1>
          <p>
            Our team will review your photos and sizes. Your first design preview will be prepared
            and shared with you shortly.
          </p>
          <strong className="planner-request-id">{requestId}</strong>
          <PreviewDisclaimer compact />
          <div className="planner-form-actions centered">
            <CTAButton to={`/my-projects/${requestId}`}>Open Project Page</CTAButton>
            <CTAButton to="/admin/design-requests" variant="secondary">View Admin Leads</CTAButton>
          </div>
        </div>
      </section>
    </PlannerPageShell>
  );
}

export function MyProjects() {
  const projects = useMemo(() => loadAllProjects(), []);

  return (
    <PlannerPageShell>
      <section className="planner-section planner-section-top">
        <div className="elegant-container">
          <SectionHeader
            kicker="Customer Projects"
            title="My Projects"
            copy="View your preview requests, design ideas and selected status."
          />
          <div className="planner-project-list">
            {projects.map((record) => (
              <Link key={record.project.requestId} to={`/my-projects/${record.project.requestId}`} className="planner-project-row">
                <span>{record.project.requestId}</span>
                <strong>{record.project.title}</strong>
                <em>{record.project.city || 'Not provided'}</em>
                <StatusBadge status={record.project.status} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PlannerPageShell>
  );
}

export function MyProjectDetail() {
  const { id } = useParams();
  const [record, setRecord] = useState<PlannerProjectRecord | undefined>(() => getProjectByRequestId(id));

  if (!record) {
    return (
      <PlannerPageShell>
        <section className="planner-section planner-section-top">
          <div className="elegant-container planner-success-card">
            <h1>Project not found</h1>
            <p>Check the request ID or view the preview example.</p>
            <CTAButton to="/my-projects/AC-IMG-0001">Open Preview Example</CTAButton>
          </div>
        </section>
      </PlannerPageShell>
    );
  }

  const selectConcept = (conceptId: string) => {
    const next: PlannerProjectRecord = {
      ...record,
      selectedConceptId: conceptId,
      project: { ...record.project, status: 'Customer Selected Concept' },
      lead: { ...record.lead, selectedConceptId: conceptId, leadStatus: 'Customer Selected Concept' },
      concepts: record.concepts.map((concept) => ({
        ...concept,
        status: concept.id === conceptId ? 'Selected' : concept.status === 'Selected' ? 'Ready' : concept.status,
      })),
    };
    saveProjectRecord(next);
    setRecord(next);
  };

  const selectedConcept = record.concepts.find((concept) => concept.id === record.selectedConceptId);

  return (
    <PlannerPageShell>
      <section className="planner-section planner-section-top">
        <div className="elegant-container">
          <div className="planner-detail-head">
            <div>
              <p className="planner-kicker">{record.project.requestId}</p>
              <h1>{record.project.title}</h1>
              <p>{record.requirements.designIntent || 'Requirement details not provided yet.'}</p>
            </div>
            <StatusBadge status={record.project.status} />
          </div>
          <PreviewDisclaimer />

          <div className="planner-detail-grid">
            <MeasurementSummary
              projectType={record.project.projectType}
              measurements={record.measurements}
              budget={record.project.budgetRange}
              style={record.requirements.preferredStyle}
              uploadCount={record.uploads.length}
            />
            <aside className="planner-side-card">
              <h2>Requirement</h2>
              <p><strong>Budget:</strong> {notProvided(record.project.budgetRange)}</p>
              <p><strong>Style:</strong> {notProvided(record.requirements.preferredStyle)}</p>
              <p><strong>Timeline:</strong> {notProvided(record.requirements.expectedTimeline)}</p>
              <p><strong>City:</strong> {notProvided(record.project.city)}</p>
              {selectedConcept ? (
                <div className="planner-selection-note">
                  Your selected idea has been sent to the AlterCraft team for review. We will check
                  sizes, materials and quotation before moving ahead.
                </div>
              ) : null}
            </aside>
          </div>

          <section className="planner-section-inner">
            <SectionHeader
              kicker="Design Selection"
              title="Choose the idea you like"
              copy="This preview is not the final work drawing. Select the direction you want AlterCraft to check and discuss with you."
            />
            {record.concepts.length ? (
              <div className="planner-concept-grid">
                {record.concepts.map((concept) => (
                  <ConceptCard
                    key={concept.id}
                    concept={concept}
                    selected={record.selectedConceptId === concept.id}
                    onSelect={() => selectConcept(concept.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="planner-empty-state">
                <Eye size={24} />
                <h3>Your previews are being prepared</h3>
                <p>The AlterCraft team will add design ideas after reviewing your photos, measurements and requirement.</p>
                <CTAButton
                  href={createWhatsappLink(`Hi AlterCraft, I want an update for request ${record.project.requestId}.`)}
                  variant="secondary"
                >
                  Ask for an Update
                </CTAButton>
              </div>
            )}
          </section>
        </div>
      </section>
    </PlannerPageShell>
  );
}

export function AdminDashboard() {
  const projects = useMemo(() => loadAllProjects(), []);
  const newRequests = projects.filter((record) => record.project.status === 'New Request').length;
  const ready = projects.filter((record) => record.project.status === 'Imagination Ready').length;
  const selected = projects.filter((record) => record.selectedConceptId).length;

  return (
    <PlannerPageShell>
      <section className="planner-section planner-section-top">
        <div className="elegant-container">
          <SectionHeader
            kicker="Request Desk"
            title="Admin Dashboard"
            copy="Internal desk for reviewing requests, confirming measurements, updating status and adding customer-visible design previews."
          />
          <div className="planner-admin-stats">
            <article><LayoutDashboard size={22} /><strong>{projects.length}</strong><span>Total requests</span></article>
            <article><Upload size={22} /><strong>{newRequests}</strong><span>New requests</span></article>
            <article><Sparkles size={22} /><strong>{ready}</strong><span>Imagination ready</span></article>
            <article><ClipboardCheck size={22} /><strong>{selected}</strong><span>Concept selected</span></article>
          </div>
          <AdminLeadTable projects={projects} />
          <div className="planner-form-actions">
            <CTAButton to="/admin/design-requests">Open Leads</CTAButton>
            <CTAButton to="/ai-planner/start" variant="secondary">Create New Request</CTAButton>
          </div>
        </div>
      </section>
    </PlannerPageShell>
  );
}

export function AdminLeads() {
  const projects = useMemo(() => loadAllProjects(), []);

  return (
    <PlannerPageShell>
      <section className="planner-section planner-section-top">
        <div className="elegant-container">
          <SectionHeader
            kicker="Leads"
            title="Design Preview Requests"
            copy="Lead view for request intake, project status and selected concept tracking."
          />
          <AdminLeadTable projects={projects} />
        </div>
      </section>
    </PlannerPageShell>
  );
}

export function AdminProjectDetail() {
  const { id } = useParams();
  const [record, setRecord] = useState<PlannerProjectRecord | undefined>(() => getProjectByRequestId(id));
  const [conceptDraft, setConceptDraft] = useState({
    conceptName: '',
    conceptType: '',
    imageUrl: '',
    description: '',
    materials: '',
    budgetLevel: '',
    executionComplexity: '',
  });

  if (!record) {
    return (
      <PlannerPageShell>
        <section className="planner-section planner-section-top">
          <div className="elegant-container planner-success-card">
            <h1>Admin project not found</h1>
            <CTAButton to="/admin/design-requests">Back to Leads</CTAButton>
          </div>
        </section>
      </PlannerPageShell>
    );
  }

  const persistRecord = (next: PlannerProjectRecord) => {
    saveProjectRecord(next);
    setRecord(next);
  };

  const updateStatus = (status: LeadStatus) => {
    persistRecord({
      ...record,
      project: { ...record.project, status },
      lead: { ...record.lead, leadStatus: status },
    });
  };

  const addConcept = (event: FormEvent) => {
    event.preventDefault();
    const concept: ImaginationConcept = {
      id: `concept-${Date.now()}`,
      projectId: record.project.id,
      conceptName: conceptDraft.conceptName || 'AlterCraft Design Preview',
      conceptType: conceptDraft.conceptType || 'Design Preview',
      imageUrl:
        conceptDraft.imageUrl ||
        canvaVisuals.aiJourney,
      description: conceptDraft.description || 'Design preview added by the AlterCraft team for customer selection.',
      materials: conceptDraft.materials || 'Material direction to be confirmed during designer review.',
      budgetLevel: conceptDraft.budgetLevel || 'To be estimated',
      executionComplexity: conceptDraft.executionComplexity || 'To be reviewed',
      status: 'Ready',
      createdAt: new Date().toISOString(),
    };

    persistRecord({
      ...record,
      project: { ...record.project, status: 'Imagination Ready' },
      lead: { ...record.lead, leadStatus: 'Imagination Ready' },
      concepts: [...record.concepts, concept],
    });

    setConceptDraft({
      conceptName: '',
      conceptType: '',
      imageUrl: '',
      description: '',
      materials: '',
      budgetLevel: '',
      executionComplexity: '',
    });
  };

  return (
    <PlannerPageShell>
      <section className="planner-section planner-section-top">
        <div className="elegant-container">
          <div className="planner-detail-head">
            <div>
              <p className="planner-kicker">Admin Project</p>
              <h1>{record.project.requestId}</h1>
              <p>{record.project.title}</p>
            </div>
            <StatusBadge status={record.project.status} />
          </div>

          <div className="planner-detail-grid">
            <MeasurementSummary
              projectType={record.project.projectType}
              measurements={record.measurements}
              budget={record.project.budgetRange}
              style={record.requirements.preferredStyle}
              uploadCount={record.uploads.length}
            />
            <aside className="planner-side-card">
              <h2>Lead Details</h2>
              <p><strong>Customer:</strong> {notProvided(record.lead.customerName)}</p>
              <p><strong>Phone:</strong> {notProvided(record.lead.customerPhone)}</p>
              <p><strong>City:</strong> {notProvided(record.project.city)}</p>
              <p><strong>Selected concept:</strong> {record.concepts.find((concept) => concept.id === record.selectedConceptId)?.conceptName ?? 'Not selected'}</p>
              <label>Status update<select value={record.project.status} onChange={(event) => updateStatus(event.target.value as LeadStatus)}>{LEAD_STATUS_FLOW.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
            </aside>
          </div>

          <section className="planner-section-inner">
            <div className="planner-detail-grid">
              <div className="planner-side-card">
                <h2>Uploaded Photos</h2>
                {record.uploads.length ? (
                  <ul>
                    {record.uploads.map((upload) => (
                      <li key={upload.id}><FileImage size={16} /> {upload.label}: {upload.fileName}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No uploaded file names recorded.</p>
                )}
              </div>
              <div className="planner-side-card">
                <h2>Preview Preparation Standards</h2>
                <ul>
                  {DESIGN_PREVIEW_STANDARDS.map((item) => <li key={item}><ListChecks size={16} /> {item}</li>)}
                </ul>
              </div>
            </div>
          </section>

          <section className="planner-section-inner">
            <SectionHeader
              kicker="Design Preview"
              title="Add imagination preview"
              copy="Add the concept image link and customer-friendly details. If no image is added, AlterCraft will use the current journey visual until the concept file is ready."
            />
            <form className="planner-form planner-admin-form" onSubmit={addConcept}>
              <div className="planner-form-grid">
                <label>Concept name<input value={conceptDraft.conceptName} onChange={(event) => setConceptDraft({ ...conceptDraft, conceptName: event.target.value })} /></label>
                <label>Concept type<input value={conceptDraft.conceptType} onChange={(event) => setConceptDraft({ ...conceptDraft, conceptType: event.target.value })} /></label>
                <label className="planner-form-wide">Concept image URL<input value={conceptDraft.imageUrl} onChange={(event) => setConceptDraft({ ...conceptDraft, imageUrl: event.target.value })} placeholder="https://..." /></label>
                <label className="planner-form-wide">Short description<textarea value={conceptDraft.description} onChange={(event) => setConceptDraft({ ...conceptDraft, description: event.target.value })} /></label>
                <label>Materials idea<input value={conceptDraft.materials} onChange={(event) => setConceptDraft({ ...conceptDraft, materials: event.target.value })} /></label>
                <label>Budget level<input value={conceptDraft.budgetLevel} onChange={(event) => setConceptDraft({ ...conceptDraft, budgetLevel: event.target.value })} /></label>
                <label>Execution complexity<input value={conceptDraft.executionComplexity} onChange={(event) => setConceptDraft({ ...conceptDraft, executionComplexity: event.target.value })} /></label>
              </div>
              <CTAButton type="submit">Save Concept</CTAButton>
            </form>
          </section>

          <section className="planner-section-inner">
            <SectionHeader kicker="Concepts" title="Customer-visible imagination previews" />
            {record.concepts.length ? (
              <div className="planner-concept-grid">
                {record.concepts.map((concept) => (
                  <ConceptCard key={concept.id} concept={concept} selected={record.selectedConceptId === concept.id} />
                ))}
              </div>
            ) : (
              <div className="planner-empty-state">
                <Sparkles size={24} />
                <h3>No concepts added yet</h3>
                <p>Use the concept form above to publish customer-visible previews.</p>
              </div>
            )}
          </section>
        </div>
      </section>
    </PlannerPageShell>
  );
}
