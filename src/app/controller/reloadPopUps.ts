export function reloadBuyPopUp(myMoney: number) {
  const btn = document.querySelector('.pay');
  const description = document.querySelector('.popup__description');
  const cost = btn?.getAttribute('data-cost');
  if (description && cost && btn) {
    if (myMoney >= +cost) {
      btn.removeAttribute('disabled');
      description.remove();
    }
  }
}
