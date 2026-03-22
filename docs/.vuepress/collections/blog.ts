import { defineCollection } from 'vuepress-theme-plume';

export const blogCollection = defineCollection({
  type: 'post',
  dir: 'blog',
  title: '博客',
  autoFrontmatter: {
    title: true,
    createTime: true,
    permalink: true,
  },
  profile: {
    avatar: 'https://cdn.jsdelivr.net/gh/ZhaoJiSen/note-images@master/logo.jpg',
    circle: false,
    name: '弟弟森的编程小博客',
    description: '零散信息存放处',
    location: '北京，中国',
  }
});
