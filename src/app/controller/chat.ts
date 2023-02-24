import Control from '../../common/common';

enum BonusText {
  SMALL_MINUS = 'was robbed for',
  BIG_MINUS = 'has problems with law. The state exacted',
  SMALL_PLUS = 'found in his winter coat',
  BIG_PLUS = 'win in superloto',
}

export function createBonusMessage(color: string, name: string, bonus: number) {
  const elem = new Control(null, 'div', 'chat__item');
  const player = new Control(elem.node, 'span', 'chat__player', name);
  player.node.style.color = color;
  let message;
  if (bonus >= 500) {
    message = BonusText.BIG_PLUS;
  } else if (bonus > 0 && bonus < 500) {
    message = BonusText.SMALL_PLUS;
  } else if (bonus < 0 && bonus > -500) {
    message = BonusText.SMALL_MINUS;
  } else if (bonus <= -500) {
    message = BonusText.BIG_MINUS;
  }
  const resMessage = ` ${message} ${Math.abs(bonus)}$.`;
  new Control(elem.node, 'span', 'chat__message', resMessage);
  return elem.node;
}

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
