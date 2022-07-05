import { launch } from '@env';

document.$('button').on('click', () => Window.this.close());

document.on('click', 'a', (evt, el) => {
  const { href } = el.attributes;
  launch(href);
  return true;
});
