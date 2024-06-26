import { Plugin } from 'obsidian';

import { BakeModal } from './BakeModal';
import { EasyBakeApi } from './api';

export interface BakeSettings {
  bakeLinks: boolean;
  bakeEmbeds: boolean;
  bakeInList: boolean;
  convertFileLinks: boolean;
  incrementHeadingLevels: boolean;
}

const DEFAULT_SETTINGS: BakeSettings = {
  bakeLinks: true,
  bakeEmbeds: true,
  bakeInList: true,
  convertFileLinks: true,
  incrementHeadingLevels: false,
};

export default class EasyBake extends Plugin {
  settings: BakeSettings;

  public api = new EasyBakeApi(this);

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  get activeMarkdownFile() {
    return this.app.workspace.activeEditor?.file;
  }

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: 'bake-file',
      name: 'Bake current file',
      checkCallback: (checking) => {
        const file = this.activeMarkdownFile;
        if (checking || !file) return !!file;
        new BakeModal(this, file).open();
      },
    });

    this.addCommand({
      id: 'bake-file:saved-settings',
      name: 'Bake current file using saved settings',
      checkCallback: (checking) => {
        // Current file
        const file = this.activeMarkdownFile;
        if (checking || !file) return !!file;
        // Output file
        let outputName = file.basename + '.baked';
        let outputFolder = file.parent?.path || '';
        if (outputFolder) outputFolder += '/';
        // Bake
        const inputPath = file.path;
        const outputPath = outputFolder + outputName + '.md';
        this.api.bakeAndOpen(inputPath, outputPath, this.settings)
      },
    });
    
  }
}
