import { Menu } from 'electron';
import { sendMessage } from 'main/window';
import menuConfig from 'view/config/menu.json';

export default function init() {
  const { setApplicationMenu, buildFromTemplate } = Menu;
  const menu = [...menuConfig];

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
