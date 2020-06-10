class DirListWrapper {
  constructor() {
    this.outerTitle = document.getElementById('outer-title');
    this.pageContainer = document.getElementById('page-container');
    this.innerDocument = this.pageContainer.contentDocument;

    this.currentPath = this.innerDocument.getElementsByTagName('title')[0].innerText.slice('Index of '.length);
    this.entries = {};
  }

  setPageTitle() {
    this.outerTitle.innerText = `Index of ${this.currentPath}`;
  }

  addCustomCss() {
    const innerStylesheetLink = document.createElement('link');
    innerStylesheetLink.setAttribute('rel', 'stylesheet');
    innerStylesheetLink.setAttribute('href', '/css/dir-list.css');

    // Show iframe when finished loading
    innerStylesheetLink.onload = () => this.showIframe();

    this.innerDocument.head.appendChild(innerStylesheetLink);
  }

  fetchEntries() {
    for (const row of Array.from(this.innerDocument.querySelectorAll('tr')).slice(2, -1)) {
      const entryNameCell = row.querySelectorAll('td')[1];
      const entryPath = entryNameCell.querySelector('a').getAttribute('href');
      if (entryNameCell.innerText.trim().toLowerCase() !== 'parent directory') {
        this.entries[decodeURIComponent(entryPath)] = entryNameCell;
      }
    }
  }

  createHoverTooltips() {
    for (const entryPath in this.entries) {
      if (entryPath.endsWith('/')) {
        continue; // Skip directories
      }

      const entryNameCell = this.entries[entryPath];
      entryNameCell.parentElement.classList.add('preview-entry');

      entryNameCell.onmouseenter = () => {
        const existingTooltip = entryNameCell.querySelector('.preview-tooltip');
        if (existingTooltip !== null) {
          existingTooltip.style.display = 'block';
          existingTooltip.style.opacity = '1';
        } else {
          const previewTooltip = document.createElement('iframe');
          previewTooltip.setAttribute('src', encodeURIComponent(entryPath));
          previewTooltip.classList.add('preview-tooltip');
          entryNameCell.appendChild(previewTooltip);
        }
      };

      entryNameCell.onmouseleave = () => {
        const existingTooltip = entryNameCell.querySelector('.preview-tooltip');
        if (existingTooltip !== null) {
          existingTooltip.style.opacity = '0';
          setTimeout(() => existingTooltip.style.display = 'none', 100);
        }
      };
    }
  }

  createSearchBar() {
    const searchBar = document.createElement('input');
    searchBar.setAttribute('placeholder', 'Search directory...');
    searchBar.classList.add('search-bar');

    searchBar.oninput = () => this.filterEntries(searchBar.value);

    const dirListTable = this.innerDocument.querySelector('table');
    dirListTable.parentElement.insertBefore(searchBar, dirListTable);
  }

  /*
   * PRIVATE METHODS
   */
  filterEntries(filterString) {
    for (const entryPath in this.entries) {
      const entryRow = this.entries[entryPath].parentElement;
      if (entryPath.toLowerCase().startsWith(filterString.toLowerCase())) {
        entryRow.style.display = 'table-row';
      } else {
        entryRow.style.display = 'none';
      }
    }
  }

  showIframe() {
    this.pageContainer.style.display = 'block';
  }
}

// eslint-disable-next-line no-unused-vars
// (called by iframe#page-container[onload])
function onIframeLoaded() {
  const dirListWrapper = new DirListWrapper();
  dirListWrapper.setPageTitle();
  dirListWrapper.addCustomCss();

  dirListWrapper.fetchEntries();
  dirListWrapper.createHoverTooltips();
  dirListWrapper.createSearchBar();
}
