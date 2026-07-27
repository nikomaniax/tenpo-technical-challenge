jest.mock('@shopify/flash-list/dist/recyclerview/utils/measureLayout', () => {
  const actual = jest.requireActual(
    '@shopify/flash-list/dist/recyclerview/utils/measureLayout'
  );

  const VIEWPORT = { x: 0, y: 0, width: 400, height: 900 };
  const ITEM = { x: 0, y: 0, width: 400, height: 100 };

  return {
    ...actual,
    measureParentSize: jest.fn(() => VIEWPORT),
    measureFirstChildLayout: jest.fn(() => VIEWPORT),
    measureItemLayout: jest.fn(() => ITEM),
  };
});
