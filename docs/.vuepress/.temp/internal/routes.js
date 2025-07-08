export const redirects = JSON.parse("{\"/preview/custom-component.example.html\":\"/article/7a0ocp3w/\",\"/preview/markdown.html\":\"/article/6f4w9a7q/\",\"/notes/web3/bar.html\":\"/web3/nbi3z48v/\",\"/notes/web3/foo.html\":\"/web3/7vjvz6k3/\"}")

export const routes = Object.fromEntries([
  ["/", { loader: () => import(/* webpackChunkName: "index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/index.html.js"), meta: {"title":""} }],
  ["/article/7a0ocp3w/", { loader: () => import(/* webpackChunkName: "article_7a0ocp3w_index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/article/7a0ocp3w/index.html.js"), meta: {"title":"自定义组件"} }],
  ["/article/6f4w9a7q/", { loader: () => import(/* webpackChunkName: "article_6f4w9a7q_index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/article/6f4w9a7q/index.html.js"), meta: {"title":"Markdown"} }],
  ["/web3/nbi3z48v/", { loader: () => import(/* webpackChunkName: "web3_nbi3z48v_index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/web3/nbi3z48v/index.html.js"), meta: {"title":"bar"} }],
  ["/web3/7vjvz6k3/", { loader: () => import(/* webpackChunkName: "web3_7vjvz6k3_index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/web3/7vjvz6k3/index.html.js"), meta: {"title":"foo"} }],
  ["/404.html", { loader: () => import(/* webpackChunkName: "404.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/404.html.js"), meta: {"title":""} }],
  ["/blog/", { loader: () => import(/* webpackChunkName: "blog_index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/blog/index.html.js"), meta: {"title":"博客"} }],
  ["/blog/tags/", { loader: () => import(/* webpackChunkName: "blog_tags_index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/blog/tags/index.html.js"), meta: {"title":"标签"} }],
  ["/blog/archives/", { loader: () => import(/* webpackChunkName: "blog_archives_index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/blog/archives/index.html.js"), meta: {"title":"归档"} }],
  ["/blog/categories/", { loader: () => import(/* webpackChunkName: "blog_categories_index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/blog/categories/index.html.js"), meta: {"title":"分类"} }],
]);
