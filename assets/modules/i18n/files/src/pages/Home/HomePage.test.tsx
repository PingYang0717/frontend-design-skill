import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { zhTW as t } from '@/i18n/zhTW';
import { TEST_USER } from '@/test/fixtures';
import { renderApp } from '@/test/renderApp';

/** 頁面最小測試範本:從網址進入,確認只有這個頁面才有的內容出現。新頁面先複製這支,再依規格補 scenario。
 *  注意:頁面標題常與選單項目同名(會找到多個元素),要找頁面獨有的文字;antd Card 的標題也不是 heading。 */
describe('Home page', () => {
  it('opens from its URL', async () => {
    renderApp('/');

    expect(await screen.findByText(t.pages.home.welcome(TEST_USER.name))).toBeInTheDocument();
  });
});
