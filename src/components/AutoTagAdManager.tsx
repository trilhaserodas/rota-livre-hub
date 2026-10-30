import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    aclib?: {
      runAutoTag?: (config: { zoneId: string; [key: string]: any }) => void;
      [key: string]: any;
    };
    __aclibAutoTagInitialized?: boolean;
  }
}

const isRestrictedRoute = (pathname: string): boolean => {
  const path = pathname.toLowerCase();
  return (
    path.startsWith('/admin') ||
    path.includes('/login') ||
    path.includes('/auth') ||
    path.includes('signin')
  );
};

/**
 * AutoTagAdManager
 * Gerenciador global e não-intrusivo para carregamento inteligente do script aclib AutoTag.
 * Isolado: não executa em /admin ou telas de autenticação/login.
 */
export default function AutoTagAdManager() {
  const location = useLocation();

  useEffect(() => {
    // Isolamento de segurança: o anúncio NUNCA pode ficar ativo dentro do /admin ou telas restritas
    if (isRestrictedRoute(location.pathname)) {
      const hasAclibScript = Boolean(document.getElementById('aclib'));
      const isAclibInitialized = Boolean(window.__aclibAutoTagInitialized);

      // Se o usuário navegar de uma rota normal para restrita com aclib já carregado/inicializado,
      // força recarregamento completo para o script morrer junto com a página
      if (hasAclibScript || isAclibInitialized) {
        window.location.replace(location.pathname);
        return;
      }

      // Se o primeiro carregamento já for numa rota restrita, não carrega nada e remove qualquer <script id="aclib"> e window.aclib
      const existingScript = document.getElementById('aclib');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
      if ('aclib' in window) {
        try {
          delete (window as any).aclib;
        } catch {
          (window as any).aclib = undefined;
        }
      }
      return;
    }

    // Evita reinicializações múltiplas se já foi carregado
    if (window.__aclibAutoTagInitialized) {
      return;
    }

    let isTriggered = false;

    const initAclib = () => {
      // Re-verificar rota atual antes do disparo
      if (isRestrictedRoute(window.location.pathname)) return;
      if (isTriggered || window.__aclibAutoTagInitialized) return;
      isTriggered = true;
      window.__aclibAutoTagInitialized = true;

      // Remove listeners após disparo
      cleanupListeners();

      const runScript = () => {
        try {
          if (isRestrictedRoute(window.location.pathname)) return;

          const executeAutoTag = () => {
            if (isRestrictedRoute(window.location.pathname)) return;
            if (window.aclib && typeof window.aclib.runAutoTag === 'function') {
              window.aclib.runAutoTag({
                zoneId: 'fpr5uwtma',
              });
            }
          };

          if (window.aclib && typeof window.aclib.runAutoTag === 'function') {
            executeAutoTag();
          } else {
            let script = document.getElementById('aclib') as HTMLScriptElement | null;
            if (!script) {
              script = document.createElement('script');
              script.id = 'aclib';
              script.type = 'text/javascript';
              script.src = 'https://acscdn.com/script/aclib.js';
              document.head.appendChild(script);
            }
            script.addEventListener('load', executeAutoTag, { once: true });
          }
        } catch (error) {
          console.warn('[AutoTagAdManager] Erro ao executar aclib:', error);
        }
      };

      // Executa em idle time do navegador para não impactar a renderização nem Core Web Vitals
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => runScript(), { timeout: 3000 });
      } else {
        setTimeout(runScript, 500);
      }
    };

    // Disparadores de interação real do usuário
    const events = ['scroll', 'pointerdown', 'touchstart', 'keydown'];

    const cleanupListeners = () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, initAclib);
      });
      clearTimeout(timerId);
    };

    events.forEach((evt) => {
      window.addEventListener(evt, initAclib, { passive: true, once: true });
    });

    // Timer de tolerância de 6 segundos de permanência ativa
    const timerId = setTimeout(() => {
      initAclib();
    }, 6000);

    return () => {
      cleanupListeners();
    };
  }, [location.pathname]);

  return null;
}
