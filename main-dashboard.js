(async function mainDashboard() {
  class MainDashboard extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: 'open' });
      const mainDashboardContainer = document.createElement('div');

      this.addColumn = this.addColumn.bind(this);
      this.getColumns = this.getColumns.bind(this);
      this.renderDashboardView = this.renderDashboardView.bind(this);

      shadow.appendChild(mainDashboardContainer);
    }

    async connectedCallback() {
      const columns = await this.getColumns();
      this.renderDashboardView(columns);      
    }

    async getColumns() {
      const responseJSON = await fetch("http://localhost:3000/columns");
      return await responseJSON.json();
    }
    
    renderDashboardView(columns) {
      this.shadowRoot.querySelector("div").classList.add('main-dashboard');
      this.shadowRoot.innerHTML = `
        <style>
          ::-webkit-scrollbar {
              -webkit-appearance: none;
              height: 0.5rem;
              width: 0.5rem;
          }
          ::-webkit-scrollbar-thumb {
              border-radius: 5px;
              background-color: rgba(0,0,0,.3);
              box-shadow: 0 0 1px rgba(255,255,255,.3);
              -webkit-box-shadow: 0 0 1px rgba(255,255,255,.3);
          }
          .main-container {
            display: flex;
            overflow: auto;
            padding-bottom: 1rem;
          }
          .column {
            background-color: #fff;
            border: solid;
            cursor: pointer;
            font-size: 1.8rem;
          }
          editable-column {
            max-height: 90vh;
            margin: 0 0 0 1rem;
            min-width: 20rem;
            padding: 1rem;
            cursor: pointer;
            overflow: auto;
          }
        </style>
        <div class="main-container">
          ${columns.map((item, index) => `<editable-column class="column column-${index}"
          title='${item.title}' id='${item.id}'></editable-column>`).join("")}
        </div>
      `;
      const addColumnButton = document.querySelector('.add-column');
      if (addColumnButton != null) {
        addColumnButton.addEventListener('click', this.addColumn, false);
      }
    }

    async addColumn(event) {
      event.preventDefault();
      const columnsArray = this.shadowRoot.querySelectorAll('editable-column');
      const newColumnId = parseInt(columnsArray[columnsArray.length - 1].id) + 1;
      await fetch("http://localhost:3000/columns", {
        method: "POST",
        body: JSON.stringify({
          "title": `Column ${newColumnId}`
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const columns = await this.getColumns();
      this.renderDashboardView(columns);      
    }
  }

  customElements.define('main-dashboard', MainDashboard);
}());