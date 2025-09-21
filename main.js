const {
  app,
  BrowserWindow,
  BrowserView,
  ipcMain,
  screen,
  globalShortcut,
} = require("electron");
const path = require("path");

let win;
let currentMode = "codigo2"; // começa no modo 1
let views = [];
let view4Visible = false;
let view5Visible = false;
let view6Visible = false;
//COMECA AQUI A PALHACADA

//AQUI termina
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

app.whenReady().then(() => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  //win = new BrowserWindow({ width, height });
  win = new BrowserWindow({
    width,
    height,
    backgroundColor: "#000000", // deixa o fundo preto
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // inicia no modo 1
  initCodigo2();

  // Atalho Ctrl+Alt+K para mostrar/ocultar o Soundboard
  globalShortcut.register("CommandOrControl+Alt+K", () => {
    const view4 = views.find((v) => v.role === "soundboard");
    if (!view4) return;

    view4Visible = !view4Visible;
    if (view4Visible) {
      win.addBrowserView(view4);
    } else {
      win.removeBrowserView(view4);
    }
  });
  globalShortcut.register("F1", () => {
    const view5 = views.find((v) => v.role === "chat");
    if (!view5) return;

    view5Visible = !view5Visible;
    if (view5Visible) {
      win.addBrowserView(view5);
    } else {
      win.removeBrowserView(view5);
    }
  });
  globalShortcut.register("F3", () => {
    const view6 = views.find((v) => v.role === "admin");
    if (!view6) return;

    view6Visible = !view6Visible;
    if (view6Visible) {
      win.addBrowserView(view6);
    } else {
      win.removeBrowserView(view6);
    }
  });

  // Atalho Ctrl+Tab para alternar entre os dois modos
  globalShortcut.register("Control+Tab", () => {
    if (currentMode === "codigo1") {
      switchMode("codigo2");
    } else {
      switchMode("codigo1");
    }
  });
});

function clearViews() {
  views.forEach((v) => {
    try {
      win.removeBrowserView(v);
    } catch (e) {}
  });
  views = [];
}

function switchMode(mode) {
  clearViews();
  currentMode = mode;

  if (mode === "codigo1") {
    initCodigo1();
  } else {
    initCodigo2();
  }
}

function initCodigo1() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const mobileWidth = 600;
  const restanteWidth = width - mobileWidth;
  const topHeight = Math.floor((height * 3) / 4);
  const bottomHeight = height - topHeight;

  // View 1 - Central de Atendimentos
  const view1 = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });
  win.addBrowserView(view1);
  view1.setBounds({ x: 0, y: 0, width: restanteWidth, height: topHeight });
  view1.setAutoResize({ width: true });
  view1.webContents.loadURL(
    "https://agne.ddns.net:31114/atendimentos/minha-fila"
  );
  views.push(Object.assign(view1, { role: "main" }));

  // View 2 - Editor de Atendimento
  const view2 = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });
  win.addBrowserView(view2);
  view2.setBounds({
    x: restanteWidth,
    y: 0,
    width: mobileWidth,
    height: topHeight,
  });
  view2.setAutoResize({ height: true });
  view2.webContents.setUserAgent(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
  );
  view2.webContents.loadURL("https://agne.ddns.net:31114/atendimentos");
  views.push(Object.assign(view2, { role: "editor" }));

  // View 3 - Triagem
  const view3 = new BrowserView({
    webPreferences: {
      contextIsolation: true,
    },
  });
  win.addBrowserView(view3);
  view3.setBounds({ x: 0, y: topHeight, width: width, height: bottomHeight });
  view3.setAutoResize({ width: true });
  view3.webContents.loadURL("https://agne.ddns.net:31114/atendimentos/triagem");
  views.push(Object.assign(view3, { role: "triagem" }));
  view3.webContents.on("did-finish-load", () => {
    view3.webContents.executeJavaScript(`
    function removeTriagemHeader() {
      // Seleciona o h2 com a classe e texto exatos
      const header = [...document.querySelectorAll('h2.font-weight-regular')]
        .find(h => h.textContent.trim() === "Triagem de Atendimentos");

      if (header) {
        header.remove(); // Remove do DOM
      }
    }

    // Primeira tentativa imediata
    removeTriagemHeader();

    // Observa mudanças no DOM caso o Vue recrie o elemento
    const observer = new MutationObserver(() => removeTriagemHeader());
    observer.observe(document.body, { childList: true, subtree: true });
  `);
  });

  // View 4 - Soundboard (inicia oculta)
  const view4 = new BrowserView({
    webPreferences: {
      contextIsolation: true,
    },
  });
  view4.setBounds({
    x: width - 900,
    y: height - 250,
    width: 450,
    height: 250,
  });
  view4.setAutoResize({});
  view4.webContents.loadFile(path.join(__dirname, "soundboard.html"));
  views.push(Object.assign(view4, { role: "soundboard" }));

  //Nova View Com a ChatGPT
  const view5 = new BrowserView({
    webPreferences: {
      contextIsolation: true,
    },
  });
  view5.setBounds({ x: 0, y: 0, width: restanteWidth, height: topHeight });
  view5.setAutoResize({ width: true });
  view5.webContents.loadURL("https://chatgpt.com/c/");
  views.push(Object.assign(view5, { role: "chat" }));
  //Fim da nova view
  const view6 = new BrowserView({
    webPreferences: {
      contextIsolation: true,
    },
  });
  view6.setBounds({ x: 0, y: 0, width: restanteWidth, height: topHeight });
  view6.setAutoResize({ width: true });
  view6.webContents.loadURL("https://agne.ddns.net:31106/login");
  views.push(Object.assign(view6, { role: "admin" }));
  // Intercepta clique em links da view1
  view1.webContents.on("did-finish-load", () => {
    view1.webContents.executeJavaScript(`
      document.addEventListener('click', function (e) {
        const a = e.target.closest('a');
        if (!a) return;
        const href = a.href;
        if (href.includes('/atendimentos/editar/')) {
          e.preventDefault();
          window.electronAPI.openOnRight(href);
          return false;
        }
      }, true);
    `);
  });

  // Ajustes e escuta de clique na view2 (botão Finalizar)
  view2.webContents.on("did-finish-load", () => {
    view2.webContents.executeJavaScript(`
      let meta = document.querySelector('meta[name="viewport"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0';
        document.head.appendChild(meta);
      }

      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
      document.body.style.overflowY = 'auto';
      document.body.style.overflowX = 'hidden';

      const hideSidebar = () => {
        const sidebar = document.querySelector('.v-navigation-drawer');
        if (sidebar) {
          sidebar.style.display = 'none';
        }

        const appContent = document.querySelector('.v-main__wrap') 
                        || document.querySelector('.v-main') 
                        || document.querySelector('main');
        if (appContent) {
          appContent.style.marginLeft = '0px';
          appContent.style.paddingLeft = '0px';
          appContent.style.width = '100vw';
          appContent.style.maxWidth = '100vw';
        }
      };
      hideSidebar();
      setTimeout(hideSidebar, 1000);

      const observer = new MutationObserver(() => {
        const btn = [...document.querySelectorAll("button")]
          .find(el =>
            el.textContent.trim().includes("Finalizar") &&
            el.querySelector("i.mdi-check-all")
          );

        if (btn && !btn.dataset.electronFinalizerAttached) {
          btn.dataset.electronFinalizerAttached = "true";
          btn.addEventListener("click", () => {
            window.electronAPI.notifyFinalized();
          });
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    `);
  });
  view3.webContents.on("did-finish-load", () => {
    view3.webContents.executeJavaScript(`
    document.addEventListener('click', function (e) {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.href;
      if (href.includes('/atendimentos/editar/')) {
        e.preventDefault();
        // envia para view2
        window.electronAPI.openOnRight(href);
        return false;
      }
    }, true);
  `);
  });
}
function initCodigo2() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const mobileWidth = 800;
  const restanteWidth = width - mobileWidth;
  const topHeight = Math.floor((height * 3) / 4);
  const bottomHeight = height - topHeight;

  // View 1 - Central de Atendimentos
  const view1 = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });
  win.addBrowserView(view1);
  view1.setBounds({ x: 0, y: 0, width: restanteWidth, height: topHeight });
  view1.setAutoResize({ width: true });
  view1.webContents.loadURL(
    "https://agne.ddns.net:31114/atendimentos/minha-fila"
  );
  views.push(Object.assign(view1, { role: "main" }));

  // View 2 - Editor de Atendimento
  const view2 = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });
  win.addBrowserView(view2);
  view2.setBounds({
    x: restanteWidth,
    y: 0,
    width: mobileWidth,
    height: topHeight,
  });
  view2.setAutoResize({ height: true });
  view2.webContents.setUserAgent(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
  );
  view2.webContents.loadURL("https://app.chatpro.com.br/chat");
  views.push(Object.assign(view2, { role: "editor" }));

  // View 3 - Triagem
  const view3 = new BrowserView({
    webPreferences: {
      contextIsolation: true,
    },
  });

  view3.webContents.on("did-finish-load", () => {
    view3.webContents.executeJavaScript(`
    function removeTriagemHeader() {
      // Seleciona o h2 com a classe e texto exatos
      const header = [...document.querySelectorAll('h2.font-weight-regular')]
        .find(h => h.textContent.trim() === "Triagem de Atendimentos");

      if (header) {
        header.remove(); // Remove do DOM
      }
    }

    // Primeira tentativa imediata
    removeTriagemHeader();

    // Observa mudanças no DOM caso o Vue recrie o elemento
    const observer = new MutationObserver(() => removeTriagemHeader());
    observer.observe(document.body, { childList: true, subtree: true });
    
    
  `);
  });

  win.addBrowserView(view3);

  view3.setBounds({ x: 0, y: topHeight, width: width, height: bottomHeight });
  view3.setAutoResize({ width: true });
  //view3.setAutoResize({ width: false });
  view3.webContents.loadURL("https://agne.ddns.net:31114/atendimentos/triagem");
  views.push(Object.assign(view3, { role: "triagem" }));

  // View 4 - Soundboard (inicia oculta)
  const view4 = new BrowserView({
    webPreferences: {
      contextIsolation: true,
    },
  });
  view4.setBounds({
    x: width - 900,
    y: height - 250,
    width: 450,
    height: 250,
  });
  view4.setAutoResize({});
  view4.webContents.loadFile(path.join(__dirname, "soundboard.html"));
  views.push(Object.assign(view4, { role: "soundboard" }));
  //Nova View Com a ChatGPT
  const view5 = new BrowserView({
    webPreferences: {
      contextIsolation: true,
    },
  });
  view5.setBounds({ x: 0, y: 0, width: restanteWidth, height: topHeight });
  view5.setAutoResize({ width: true });
  view5.webContents.loadURL("https://chatgpt.com/c/");
  views.push(Object.assign(view5, { role: "chat" }));
  //Fim da nova view
  const view6 = new BrowserView({
    webPreferences: {
      contextIsolation: true,
    },
  });
  view6.setBounds({ x: 0, y: 0, width: restanteWidth, height: topHeight });
  view6.setAutoResize({ width: true });
  view6.webContents.loadURL("https://agne.ddns.net:31106/login");
  views.push(Object.assign(view6, { role: "admin" }));
}

// ===================== EVENTOS IPC =====================
ipcMain.on("open-on-right", (event, url) => {
  const view2 = views.find((v) => v.role === "editor");
  if (view2 && view2.webContents) {
    view2.webContents.loadURL(url);
  }
});

ipcMain.on("finalized-button-clicked", () => {
  const view1 = views.find((v) => v.role === "main");
  if (view1 && view1.webContents) {
    view1.webContents.focus();

    view1.webContents.sendInputEvent({ type: "keyDown", keyCode: "Control" });
    view1.webContents.sendInputEvent({ type: "keyDown", keyCode: "K" });
    view1.webContents.sendInputEvent({ type: "keyUp", keyCode: "K" });
    view1.webContents.sendInputEvent({ type: "keyUp", keyCode: "Control" });

    setTimeout(() => {
      view1.webContents.sendInputEvent({ type: "keyDown", keyCode: "Enter" });
      view1.webContents.sendInputEvent({ type: "keyUp", keyCode: "Enter" });
    }, 300);
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
