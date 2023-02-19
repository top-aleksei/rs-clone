import Control from '../../common/common';

export function createMessageThrow(
  color: string,
  name: string,
  dice: number[],
) {
  const elem = new Control(null, 'div', 'chat__item');
  const player = new Control(elem.node, 'span', 'chat__player', name);
  player.node.style.color = color;
  const message = ` rolled the dice with ${dice[0]} and ${dice[1]}`;
  new Control(elem.node, 'span', 'chat__message', message);
  return elem.node;
}

export function createChatMessage(
  color: string,
  name: string,
  message: string,
) {
  const elem = new Control(null, 'div', 'chat__item');
  const player = new Control(elem.node, 'span', 'chat__player', name);
  player.node.style.color = color;
  const text = new Control(elem.node, 'span', 'chat__message', ` "${message}"`);
  text.node.style.fontStyle = 'italic';
  return elem.node;
}

export function createBuyMessage(color: string, name: string, factory: string) {
  const elem = new Control(null, 'div', 'chat__item');
  const player = new Control(elem.node, 'span', 'chat__player', name);
  player.node.style.color = color;
  const message = ` bought "${factory}"`;
  new Control(elem.node, 'span', 'chat__message', message);
  return elem.node;
}
