/* eslint-disable import/prefer-default-export */
import Control from '../../common/common';

export function createMessageThrow(
  color: string,
  name: string,
  dice: number[],
) {
  const elem = new Control(null, 'div', 'chat__item');
  const player = new Control(elem.node, 'span', 'chat__player', name);
  player.node.style.color = color;
  const message = ` roll the dice with ${dice[0]} and ${dice[1]}`;
  new Control(elem.node, 'span', 'chat__message', message);
  return elem.node;
}
