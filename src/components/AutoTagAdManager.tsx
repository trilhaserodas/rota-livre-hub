import { useEffect } from 'react';

declare global {
  interface Window {
    aclib?: {
      runAutoTag?: (config: { zoneId: string; [key: string]: any }) => void;
      [key: string]: any;
    };
    __aclibAutoTagInitialized?: boolean;
  }
}

/**
 * AutoTagAdManager
 * Gerenciador global e não-intrusivo para carregamento inteligente do script aclib AutoTag.
 * 
 * Regras implementadas:
 * - Não executa no carregamento imediato da página.
 * - Aguarda interação real do usuário (rolagem, clique, toque, navegação ou permanência ativa de 5s).
 * - Carrega de forma totalmente assíncrona (non-blocking).
 * - Garante execução única (evita duplicações).
 */
export default function AutoTagAdManager() {
  useEffect(() => {
    // Evita reinicializações múltiplas se já foi carregado
    if (window.__aclibAutoTagInitialized) {
      return;
    }

    let isTriggered = false;

    const initAclib = () => {
      if (isTriggered || window.__aclibAutoTagInitialized) return;
      isTriggered = true;
      window.__aclibAutoTagInitialized = true;

      // Remove listeners após disparo
      cleanupListeners();

      const runScript = () => {
        try {
          const executeAutoTag = () => {
            if (window.aclib && typeof window.aclib.runAutoTag === 'function') {
              window.aclib.runAutoTag({
                zoneId: 'fpr5uwtma',
              });
              console.log('[AutoTagAdManager] aclib.runAutoTag executado com sucesso.');
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
  }, []);

  return null;
}
