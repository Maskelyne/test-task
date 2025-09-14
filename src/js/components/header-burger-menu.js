export function headerBurgerMenu () {
  document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header')
    if (!header) return

    const headerBurgerBtn = header.querySelector('.js-burger-btn')
    const headerMenu = document.querySelector('.js-header-menu')
    if (!headerBurgerBtn || !headerMenu) return

    headerBurgerBtn.addEventListener('click', () => {
      headerBurgerBtn.classList.toggle('header__burger-btn--open')
      headerMenu.classList.toggle('header__box--open')

      headerBurgerBtn.classList.contains('header__burger-btn--open') ? document.body.style.overflow = 'hidden' : document.body.style.overflow = ''
    })
  })
}
