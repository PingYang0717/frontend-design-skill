import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useThemeStore } from '@/stores/useThemeStore';
import { renderApp } from '@/test/renderApp';
import { DARK_TOKENS } from '@/theme/tokens';

describe('ThemeSwitch', () => {
  it('switches the app to the dark tokens and remembers the choice', async () => {
    const user = userEvent.setup();
    const { container } = renderApp('/');

    await user.click(await screen.findByText('深色'));

    expect(useThemeStore.getState().isDarkMode).toBe(true);
    await waitFor(() => expect(container.querySelector('style')?.textContent).toContain(DARK_TOKENS.bgLayout));
  });
});
