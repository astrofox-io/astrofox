import { Menu } from 'electron';
import { sendMessage } from 'main/window';
import menuConfig from 'config/menu.json';

export default function init() {
  const { setApplicationMenu, buildFromTemplate } = Menu;
  let menu = [...menuConfig];

  if (process.env.NODE_ENV === 'production') {
    menu = menu.filter(item => !item.hidden);
  }

  function executeAction({ action }) {
    sendMessage('menu-action', action);
  }

  menu.forEach(menuItem => {
    if (menuItem.submenu) {
      menuItem.submenu.forEach(item => {
        if (item.action && !item.role) {
          item.click = executeAction;
        }
      });
    }
  });

  setApplicationMenu(buildFromTemplate(menu));
}
