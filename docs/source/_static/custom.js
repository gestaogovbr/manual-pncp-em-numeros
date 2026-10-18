/* === Script de Lightbox de Imagens, Impressão Limpa e Menu Lateral (docs/source/_static/custom.js) === */

document.addEventListener('DOMContentLoaded', function() {
    // 1. Criar a estrutura HTML do Popup (Lightbox) para abrir e fechar imagens na mesma tela
    const lightboxHTML = `
        <div id="lightbox-overlay" role="dialog" aria-modal="true" aria-label="Visualização ampliada da imagem">
            <span id="lightbox-close" title="Fechar imagem (Esc)">&times;</span>
            <img id="lightbox-image" src="" alt="Imagem ampliada" title="Clique para fechar">
            <div id="lightbox-footer">
                <span id="lightbox-caption"></span>
                <button type="button" id="lightbox-close-btn" title="Fechar visualização ampliada">✕ Fechar (Esc)</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);

    // 2. Selecionar os elementos do popup
    const overlay = document.getElementById('lightbox-overlay');
    const lightboxImg = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('lightbox-close');
    const closeFooterBtn = document.getElementById('lightbox-close-btn');

    // 3. Selecionar todas as imagens dentro da área de conteúdo principal
    const images = document.querySelectorAll('.md-content img, .rst-content img, article img');

    // 4. Adicionar o evento de clique e lupa com hover em cada imagem
    images.forEach(image => {
        image.style.cursor = 'zoom-in';
        image.setAttribute('title', 'Clique para ampliar na mesma tela');

        // Caso o Sphinx envolva a imagem em um link <a>, intercepta o clique para não sair da página
        const parentLink = image.closest('a');
        if (parentLink) {
            parentLink.style.cursor = 'zoom-in';
            parentLink.addEventListener('click', function(e) {
                e.preventDefault();
            });
        }

        image.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const altText = this.getAttribute('alt') || 'Visualização do painel PNCP em Números';
            lightboxImg.src = this.src;
            lightboxImg.alt = altText;
            if (lightboxCaption) {
                lightboxCaption.textContent = altText;
            }

            overlay.style.display = 'flex';
            setTimeout(() => {
                overlay.classList.add('active');
                overlay.style.opacity = '1';
                lightboxImg.style.transform = 'scale(1)';
            }, 10);

            document.body.style.overflow = 'hidden';
        });
    });

    // 5. Função para fechar o popup na mesma tela
    function closeLightbox() {
        overlay.classList.remove('active');
        overlay.style.opacity = '0';
        lightboxImg.style.transform = 'scale(0.9)';

        setTimeout(() => {
            overlay.style.display = 'none';
            lightboxImg.src = '';
            document.body.style.overflow = '';
        }, 280);
    }

    // Opção 1: Clicar no botão superior (X)
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeLightbox();
    });

    // Opção 2: Clicar no botão inferior "✕ Fechar (Esc)"
    closeFooterBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeLightbox();
    });

    // Opção 3: Clicar no fundo escuro ou na própria imagem ampliada
    overlay.addEventListener('click', function(e) {
        if (e.target !== lightboxCaption) {
            closeLightbox();
        }
    });

    // Opção 4: Pressionar a tecla ESC no teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.style.display === 'flex') {
            closeLightbox();
        }
    });

    // 6. Garantir que o widget flutuante "latest" do Read the Docs (Web Component com Shadow DOM)
    // nunca saia na impressão / PDF
    function toggleRtdFlyoutForPrint(hide) {
        const rtdElements = document.querySelectorAll(
            'readthedocs-flyout, readthedocs-notification, readthedocs-search, .rst-versions, #rtd-sidebar'
        );
        rtdElements.forEach(el => {
            if (hide) {
                el.dataset.prevDisplay = el.style.display || '';
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('visibility', 'hidden', 'important');
                if (el.shadowRoot) {
                    let printStyle = el.shadowRoot.getElementById('rtd-no-print-style');
                    if (!printStyle) {
                        printStyle = document.createElement('style');
                        printStyle.id = 'rtd-no-print-style';
                        printStyle.textContent = '@media print { :host, * { display: none !important; visibility: hidden !important; } }';
                        el.shadowRoot.appendChild(printStyle);
                    }
                }
            } else {
                el.style.display = el.dataset.prevDisplay || '';
                el.style.visibility = '';
            }
        });
    }

    window.addEventListener('beforeprint', () => toggleRtdFlyoutForPrint(true));
    window.addEventListener('afterprint', () => toggleRtdFlyoutForPrint(false));

    const origPrint = window.print.bind(window);
    window.print = function() {
        toggleRtdFlyoutForPrint(true);
        setTimeout(() => {
            origPrint();
            setTimeout(() => toggleRtdFlyoutForPrint(false), 500);
        }, 50);
    };

    // 7. Preservar os botões nativos [+] e [-] do menu lateral do Read the Docs
    // sem que o Sphinx feche automaticamente os itens ao clicar em links
    if (window.SphinxRtdTheme && window.SphinxRtdTheme.Navigation) {
        const nav = window.SphinxRtdTheme.Navigation;
        nav.onLinkClick = function() {};
    }

    setTimeout(() => {
        const menu = document.querySelector('.wy-menu-vertical');
        if (!menu) return;

        menu.querySelectorAll('li.toctree-l1, li.toctree-l2, li.toctree-l3').forEach(li => {
            const subUl = li.querySelector(':scope > ul');
            const link = li.querySelector(':scope > a');
            if (subUl && link && !link.querySelector('.toctree-expand')) {
                const btn = document.createElement('button');
                btn.className = 'toctree-expand';
                btn.title = 'Expandir/recolher subseções';
                link.prepend(btn);
            }
        });

        menu.querySelectorAll('button.toctree-expand').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', function(ev) {
                ev.preventDefault();
                ev.stopPropagation();
                const parentLi = this.closest('li');
                if (parentLi) {
                    parentLi.classList.toggle('current');
                }
            });
        });

        menu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', function(ev) {
                if (ev.target && ev.target.classList.contains('toctree-expand')) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
                const parentLi = this.closest('li');
                if (parentLi && parentLi.querySelector(':scope > ul')) {
                    parentLi.classList.add('current');
                }
            });
        });
    }, 150);
});
