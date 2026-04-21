/*
 * Fragment Block
 * Include content on a page as a fragment.
 * https://www.aem.live/developer/block-collection/fragment
 */

import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadSections,
} from '../../scripts/aem.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    // eslint-disable-next-line no-param-reassign
    path = path.replace(/(\.plain)?\.html/, '');
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      // reset base path for media to fragment base
      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      decorateMain(main);
      await loadSections(main);
      return main;
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      block.classList.add(...fragmentSection.classList);
      block.classList.remove('section');
      block.replaceChildren(...fragmentSection.childNodes);
    }
  }
}



export default function decorate(block) {
  const panels = block.querySelectorAll(
    ".field-loan-details-panel, .field-personal-details-panel"
  );

  panels.forEach((panel, index) => {
    const legend = panel.querySelector("legend");
    if (!legend) return;

    /* ---------- make legend clickable ---------- */
    legend.style.cursor = "pointer";
    legend.style.display = "flex";
    legend.style.alignItems = "center";
    legend.style.justifyContent = "space-between";

    /* ---------- inject chevron ---------- */
    const chevron = document.createElement("span");
    chevron.className = "eds-chevron";
    legend.appendChild(chevron);

    /* ---------- wrap content ---------- */
    const content = document.createElement("div");
    content.className = "eds-panel-content";

    [...panel.children].forEach(child => {
      if (child !== legend) {
        content.appendChild(child);
      }
    });

    panel.appendChild(content);

    /* ---------- default state ---------- */
    const openByDefault = index === 0;
    panel.classList.toggle("eds-expanded", openByDefault);
    content.style.maxHeight = openByDefault
      ? content.scrollHeight + "px"
      : null;

    /* ---------- click handler ---------- */
    legend.addEventListener("click", () => {
      const isOpen = panel.classList.contains("eds-expanded");

      panels.forEach(p => {
        p.classList.remove("eds-expanded");
        const c = p.querySelector(".eds-panel-content");
        if (c) c.style.maxHeight = null;
      });

      if (!isOpen) {
        panel.classList.add("eds-expanded");
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });

  /* ---------- inject CSS ---------- */
  const style = document.createElement("style");
  style.textContent = `
    .eds-chevron {
      width: 8px;
      height: 8px;
      border-right: 2px solid #2563eb;
      border-bottom: 2px solid #2563eb;
      transform: rotate(45deg);
      transition: transform 0.3s ease;
      margin-left: auto;
    }

    .eds-expanded .eds-chevron {
      transform: rotate(-135deg);
    }

    .eds-panel-content {
      overflow: hidden;
      transition: max-height 0.35s ease;
    }
  `;
  document.head.appendChild(style);
}
``


// const style = document.createElement("style");
// style.innerHTML = `
// /* Chevron */
// .eds-chevron {
//   width: 8px;
//   height: 8px;
//   border-right: 2px solid #2563eb;
//   border-bottom: 2px solid #2563eb;
//   transform: rotate(45deg);
//   transition: transform 0.3s ease;
//   margin-left: auto;
// }

// /* Expanded state */
// .eds-expanded .eds-chevron {
//   transform: rotate(-135deg);
// }

// /* Collapsible content */
// .eds-panel-content {
//   overflow: hidden;
//   transition: max-height 0.35s ease;
// }
// `;
// document.head.appendChild(style);
