export const redirects = JSON.parse("{\"/preview/custom-component.example.html\":\"/article/7a0ocp3w/\",\"/preview/markdown.html\":\"/article/6f4w9a7q/\",\"/notes/demo/\":\"/demo/\",\"/notes/demo/bar.html\":\"/demo/shasu1vo/\",\"/notes/demo/foo.html\":\"/demo/3loojwhc/\"}")

export const routes = Object.fromEntries([
  ["/", { loader: () => import(/* webpackChunkName: "index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/index.html.js"), meta: {"title":""} }],
  ["/article/7a0ocp3w/", { loader: () => import(/* webpackChunkName: "article_7a0ocp3w_index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/article/7a0ocp3w/index.html.js"), meta: {"title":"自定义组件"} }],
  ["/article/6f4w9a7q/", { loader: () => import(/* webpackChunkName: "article_6f4w9a7q_index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/article/6f4w9a7q/index.html.js"), meta: {"title":"Markdown"} }],
  ["/demo/", { loader: () => import(/* webpackChunkName: "demo_index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/demo/index.html.js"), meta: {"title":"Demo"} }],
  ["/demo/shasu1vo/", { loader: () => import(/* webpackChunkName: "demo_shasu1vo_index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/demo/shasu1vo/index.html.js"), meta: {"title":"bar"} }],
  ["/demo/3loojwhc/", { loader: () => import(/* webpackChunkName: "demo_3loojwhc_index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/demo/3loojwhc/index.html.js"), meta: {"title":"foo"} }],
  ["/404.html", { loader: () => import(/* webpackChunkName: "404.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/404.html.js"), meta: {"title":""} }],
  ["/blog/", { loader: () => import(/* webpackChunkName: "blog_index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/blog/index.html.js"), meta: {"title":"博客"} }],
  ["/blog/tags/", { loader: () => import(/* webpackChunkName: "blog_tags_index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/blog/tags/index.html.js"), meta: {"title":"标签"} }],
  ["/blog/archives/", { loader: () => import(/* webpackChunkName: "blog_archives_index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/blog/archives/index.html.js"), meta: {"title":"归档"} }],
  ["/blog/categories/", { loader: () => import(/* webpackChunkName: "blog_categories_index.html" */"/Users/zhaojisen/Desktop/Notes/docs/.vuepress/.temp/pages/blog/categories/index.html.js"), meta: {"title":"分类"} }],
]);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updateRoutes) {
    __VUE_HMR_RUNTIME__.updateRoutes(routes)
  }
  if (__VUE_HMR_RUNTIME__.updateRedirects) {
    __VUE_HMR_RUNTIME__.updateRedirects(redirects)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ routes, redirects }) => {
    __VUE_HMR_RUNTIME__.updateRoutes(routes)
    __VUE_HMR_RUNTIME__.updateRedirects(redirects)
  })
}
