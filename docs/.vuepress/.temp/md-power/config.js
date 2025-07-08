import { defineClientConfig } from 'vuepress/client'
import Tabs from '/Users/zhaojisen/Desktop/Notes/node_modules/.pnpm/vuepress-plugin-md-power@1.0.0-rc.156_esbuild@0.25.6_markdown-it@14.1.0_typescript@5.8._251bf25b00c5544985c1e85375ee84e4/node_modules/vuepress-plugin-md-power/lib/client/components/Tabs.vue'
import CodeTabs from '/Users/zhaojisen/Desktop/Notes/node_modules/.pnpm/vuepress-plugin-md-power@1.0.0-rc.156_esbuild@0.25.6_markdown-it@14.1.0_typescript@5.8._251bf25b00c5544985c1e85375ee84e4/node_modules/vuepress-plugin-md-power/lib/client/components/CodeTabs.vue'
import Plot from '/Users/zhaojisen/Desktop/Notes/node_modules/.pnpm/vuepress-plugin-md-power@1.0.0-rc.156_esbuild@0.25.6_markdown-it@14.1.0_typescript@5.8._251bf25b00c5544985c1e85375ee84e4/node_modules/vuepress-plugin-md-power/lib/client/components/Plot.vue'
import FileTreeNode from '/Users/zhaojisen/Desktop/Notes/node_modules/.pnpm/vuepress-plugin-md-power@1.0.0-rc.156_esbuild@0.25.6_markdown-it@14.1.0_typescript@5.8._251bf25b00c5544985c1e85375ee84e4/node_modules/vuepress-plugin-md-power/lib/client/components/FileTreeNode.vue'

import '/Users/zhaojisen/Desktop/Notes/node_modules/.pnpm/vuepress-plugin-md-power@1.0.0-rc.156_esbuild@0.25.6_markdown-it@14.1.0_typescript@5.8._251bf25b00c5544985c1e85375ee84e4/node_modules/vuepress-plugin-md-power/lib/client/styles/index.css'

export default defineClientConfig({
  enhance({ router, app }) {
    app.component('Tabs', Tabs)
    app.component('CodeTabs', CodeTabs)
    app.component('Plot', Plot)
    app.component('FileTreeNode', FileTreeNode)
  },
  setup() {
    
  }
})
