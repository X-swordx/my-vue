/*
 * @Author: zhengchengxuan 534370078@qq.com
 * @Date: 2023-01-11 21:12:08
 * @LastEditors: zhengchengxuan 534370078@qq.com
 * @LastEditTime: 2023-02-09 22:57:20
 * @FilePath: \my-vue\vitest.config.ts
 * @Description:
 */
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: [
      {
        find: /@my-vue\/([\w-]*)/,
        replacement: path.resolve(__dirname, 'packages') + '/$1/src',
      },
    ],
  },
});
