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
          if (window.aclib && typeof window.aclib.runAutoTag === 'function') {
            window.aclib.runAutoTag({
              zoneId: 'fpr5uwtma',
            });
            console.log('[AutoTagAdManager] aclib.runAutoTag inicializado com sucesso.');
          } else {
            // Se o aclib não estiver no objeto global, injeta o script aclib.js de forma assíncrona
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://aclib.com/aclib.js';
            script.async = true;
            script.onload = () => {
              try {
                if (window.aclib && typeof window.aclib.runAutoTag === 'function') {
                  window.aclib.runAutoTag({
                    zoneId: 'fpr5uwtma',
                  });
                  console.log('[AutoTagAdManager] aclib.runAutoTag executado após download do script.');
                }
              } catch (err) {
                console.warn('[AutoTagAdManager] Falha ao executar runAutoTag:', err);
              }
            };
            script.onerror = (e) => {
              console.warn('[AutoTagAdManager] O script de anúncios foi bloqueado ou falhou no carregamento.', e);
            };
            document.head.appendChild(script);
          }
        } catch (error) {
          console.warn('[AutoTagAdManager] Erro ao inicializar aclib:', error);
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
