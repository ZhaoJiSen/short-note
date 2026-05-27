import { defineCollections } from 'vuepress-theme-plume';

import {
  babelCollection,
  blogCollection,
  browserCollection,
  buildToolsCollection,
  bunCollection,
  electronCollection,
  goCollection,
  javascriptCollection,
  modularizationCollection,
  nodeCollection,
  packageManagerCollection,
  pythonCollection,
  reactCollection,
  rustCollection,
  typescriptCollection,
  vueCollection
} from './collections/index';

export default defineCollections([
  bunCollection,
  goCollection,
  vueCollection,
  rustCollection,
  nodeCollection,
  browserCollection,
  reactCollection,
  blogCollection,
  javascriptCollection,
  typescriptCollection,
  modularizationCollection,
  packageManagerCollection,
  babelCollection,
  buildToolsCollection,
  electronCollection,
  pythonCollection
]);
