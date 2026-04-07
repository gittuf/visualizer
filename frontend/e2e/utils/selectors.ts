export const selectors = {
  homepage: {
    // Main container
    container: '[data-testid="homepage-container"]',

    // Story Modal
    storyModal: '[data-testid="story-modal"]',
    storyModalCloseButton: '[data-testid="story-modal-close"]',
    storyModalOpenSimulatorButton: '[data-testid="story-modal-open-simulator"]',

    // Simulator Content (after modal closes)
    simulatorContent: '[data-testid="simulator-content"]',

    // Status Card
    statusCard: '[data-testid="status-card"]',
    statusCardResult: '[data-testid="status-card-result"]',
    statusCardAllowedIcon: '[data-testid="status-card-allowed-icon"]',
    statusCardBlockedIcon: '[data-testid="status-card-blocked-icon"]',
    statusCardToggleExplanation: '[data-testid="status-card-toggle-explanation"]',
    statusCardExplanation: '[data-testid="status-card-explanation"]',

    // Simulator Glossary
    simulatorGlossary: '[data-testid="simulator-glossary"]',
    glossaryItemRoot: '[data-testid="glossary-item-root"]',
    glossaryItemRole: '[data-testid="glossary-item-role"]',
    glossaryItemAttestation: '[data-testid="glossary-item-attestation"]',
    glossaryItemThreshold: '[data-testid="glossary-item-threshold"]',
  },
  tabs: {
    commits: '[data-testid="tab-commits"]',
    visualization: '[data-testid="tab-visualization"]',
    tree: '[data-testid="tab-tree"]',
    compare: '[data-testid="tab-compare"]',
    analysis: '[data-testid="tab-analysis"]',
  },
  commit: {
    commitList: '[data-testid="commit-list"]',
    commitItem: '[data-testid="commit-item"]',
    commitDetails: '[data-testid="commit-details"]',
  },
  json: {
    jsonTreeView: '[data-testid="json-tree-view"]',
    jsonTreeContainer: '[data-testid="json-tree-container"]',
    treeNode: '[data-testid="tree-node"]',
  },
  repository: {
    repositorySelector: '[data-testid="repository-selector"]',
    tryDemoButton: '[data-testid="try-demo-button"]',
    selectedRepository: '[data-testid="selected-repository"]',
  },
  simulator: {
    simulatorPlay: '[data-testid="simulator-play"]',
    simulatorPause: '[data-testid="simulator-pause"]',
    simulatorReset: '[data-testid="simulator-reset"]',
    simulationStatus: '[data-testid="simulation-status"]',
    errorMessage: '[data-testid="error-message"]',
  },
  visualization: {
    trustGraph: '[data-testid="trust-graph"]',
    graphNode: '[data-testid="graph-node"]',
    graphEdge: '[data-testid="graph-edge"]',
  },
};