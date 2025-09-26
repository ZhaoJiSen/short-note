/**
 * @see https://theme-plume.vuejs.press/guide/document/ 查看文档了解配置详情。
 *
 * Notes 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 *
 * 请注意，你应该先在这里配置好 Notes，然后再启动 vuepress，主题会在启动 vuepress 时，
 * 读取这里配置的 Notes，然后在与 Note 相关的 Markdown 文件中，自动生成 permalink。
 *
 * 如果你发现 侧边栏没有显示，那么请检查你的配置是否正确，以及 Markdown 文件中的 permalink
 * 是否是以对应的 note 配置的 link 的前缀开头。 是否展示侧边栏是根据 页面链接 的前缀 与 `note.link`
 * 的前缀是否匹配来决定。
 */

/**
 * 在受支持的 IDE 中会智能提示配置项。
 *
 * - `defineNoteConfig` 是用于定义单个 note 配置的帮助函数
 * - `defineNotesConfig` 是用于定义 notes 集合的帮助函数
 *
 * 通过 `defineNoteConfig` 定义的 note 配置，应该填入 `defineNotesConfig` 的 notes 数组中
 */
import { defineNoteConfig, defineNotesConfig } from 'vuepress-theme-plume';

const browserNote = defineNoteConfig({
  dir: 'browser',
  link: '/browser',
  sidebar: 'auto',
});

const rustNote = defineNoteConfig({
  dir: 'rust',
  link: '/rust',
  sidebar: [
    {
      text: '基础知识',
      collapsed: false,
      items: [
        {
          text: '1. 基本概念',
          collapsed: true,
          items: [
            { text: '1. 变量与可变性', link: '/rust/o8agolw4/' },
            { text: '2. 数据类型', link: '/rust/di2oup8x/' },
            { text: '3. 函数', link: '/rust/ipu2tdvh/' },
            { text: '4. 注释', link: '/rust/kn1r3ozu/' },
            { text: '5. 控制流', link: '/rust/7jxc7tz7/' },
          ],
        },
        {
          text: '2. 所有权',
          collapsed: true,
          items: [
            { text: '1. 所有权', link: '/rust/kf7myiln/' },
            { text: '2. 引用与借用', link: '/rust/pajnqj8w/' },
            { text: '3. Slice 类型', link: '/rust/050sp5fi/' },
          ],
        },
        {
          text: '3. 结构体',
          collapsed: true,
          items: [
            { text: '1. 基本使用', link: '/rust/e68jmm5c/' },
            { text: '2. 方法', link: '/rust/p21lsigg/' },
          ],
        },
        {
          text: '4. 枚举与匹配模式',
          collapsed: true,
          items: [
            { text: '1. 枚举', link: '/rust/7342g17i/' },
            { text: '2. match 控制结构', link: '/rust/hpzb7ag9/' },
            { text: '3. 简洁控制流', link: '/rust/fbhcsnsn/' },
          ],
        },
        {
          text: '5. 包管理',
          collapsed: true,
          items: [
            {
              text: '包管理',
              link: '/rust/n40nc8u5/',
            },
          ],
        },
        {
          text: '6. 集合',
          collapsed: true,
          items: [
            { text: '1. 动态数组', link: '/rust/bkb5lpbm/' },
            { text: '2. hashMap', link: '/rust/88xu261b/' },
          ],
        },
        {
          text: '7. 错误处理',
          collapsed: true,
          items: [
            { text: '1. 处理不可恢复错误', link: '/rust/mrknlbd8/' },
            { text: '2. 处理可恢复错误', link: '/rust/qh8cg73j/' },
          ],
        },
        {
          text: '8. 泛型、Trait 与生命周期',
          collapsed: true,
          items: [
            { text: '1. 泛型', link: '/rust/7n8042c8/' },
            { text: '2. 特征', link: '/rust/bgra68f2/' },
            { text: '3. 生命周期', link: '/rust/zyr3z8hb/' },
          ],
        },
        {
          text: '9. 迭代器与闭包',
          collapsed: true,
          items: [{ text: '1. 迭代器', link: '/rust/5qk3z7b2/' }],
        },
      ],
    },
    {
      text: '进阶',
      collapsed: false,
      items: [
        {
          text: '10. 智能指针',
          collapsed: true,
          items: [
            { text: '堆分配智能指针', link: '/rust/kh4d8n14/' },
            { text: '引用计数智能指针', link: '/rust/16s6qq6n/' },
            { text: '运行时可变借用检查的智能指针', link: '/rust/s1aq3ip7/' },
          ],
        },
        {
          text: '11. 多线程',
          collapsed: true,
          items: [
            { text: '基本使用', link: '/rust/v5a8bx4o/' },
            { text: '线程通信', link: '/rust/sptujqqg/' },
          ],
        },
        {
          text: '12. 异步编程',
          collapsed: true,
          items: [
            { text: 'async', link: '/rust/yxgj4re7/' },
            { text: '流（Streams）', link: '/rust/qqm7oxdz/' },
            { text: 'Features', link: '/rust/5yjgqe0d/' },
          ],
        },
      ],
    },
  ],
});

export default defineNotesConfig({
  dir: 'notes',
  link: '/',
  notes: [browserNote, rustNote],
});
