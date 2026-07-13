const generatedRoot = '/images/generated/v1';

export const generatedVisuals = {
  brandHero: `${generatedRoot}/brand-hero.webp`,
  beds: {
    hydraulicStorage: `${generatedRoot}/bed-hydraulic-storage.webp`,
    upholsteredDrawer: `${generatedRoot}/bed-upholstered-drawer.webp`,
  },
  wardrobes: {
    slidingSmoked: `${generatedRoot}/wardrobe-sliding-smoked.webp`,
    internalStorage: `${generatedRoot}/wardrobe-internal-storage.webp`,
    walkIn: `${generatedRoot}/walk-in-indian-storage.webp`,
  },
  kitchens: {
    premiumUShape: `${generatedRoot}/kitchen-premium-u-shape.webp`,
    compactLShape: `${generatedRoot}/kitchen-compact-l-shape.webp`,
  },
  living: {
    mediaWall: `${generatedRoot}/living-media-wall.webp`,
    curvedCollection: `${generatedRoot}/living-curved-collection.webp`,
  },
  process: {
    cncWorkshop: `${generatedRoot}/cnc-workshop.webp`,
    siteInstallation: `${generatedRoot}/site-installation.webp`,
    designPlanning: `${generatedRoot}/design-planning.webp`,
    joinerySoftClose: `${generatedRoot}/joinery-soft-close.webp`,
  },
  office: `${generatedRoot}/office-commercial-interior.webp`,
  rentalAppliances: `${generatedRoot}/rental-appliances.webp`,
  flushDoor: `${generatedRoot}/flush-door.webp`,
  poojaMandir: `${generatedRoot}/pooja-mandir-cnc.webp`,
} as const;

// Preserve the established API while replacing the stretched Canva mood boards
// with content-specific, locally hosted AlterCraft visualizations.
export const canvaVisuals = {
  aiJourney: generatedVisuals.process.designPlanning,
  kitchenVisual: generatedVisuals.kitchens.premiumUShape,
  wardrobeVisual: generatedVisuals.wardrobes.slidingSmoked,
  office: generatedVisuals.office,
};
