import { createRef } from 'react';

import { MerchantPickerSheet } from '../MerchantPickerSheet';
import { renderWithProviders } from '../../test-utils';
import { venue } from '../../test-fixtures/componentFixtures';

describe('MerchantPickerSheet', () => {
  it('shows curated venue context in the fallback list', () => {
    const { getByText } = renderWithProviders(
      <MerchantPickerSheet merchants={[venue]} onSelect={() => undefined} ref={createRef()} />,
    );

    expect(getByText('Choose partner venue')).toBeTruthy();
    expect(getByText('1 curated partners nearby')).toBeTruthy();
    expect(getByText("Jun's Table")).toBeTruthy();
    expect(getByText('Member supper spot')).toBeTruthy();
  });
});
