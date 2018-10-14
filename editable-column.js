(function editableColumn() {
  class EditableColumn extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });

      this.isAddCardFormRendered = false;

      this.getColumnCards = this.getColumnCards.bind(this);
      this.addCard = this.addCard.bind(this);
      this.handleDragDrop = this.handleDragDrop.bind(this);
      this.removeColumn = this.removeColumn.bind(this);
      this.renderColumnView = this.renderColumnView.bind(this);
      this.renderAddCardForm = this.renderAddCardForm.bind(this);
    }

    async connectedCallback() {
      const columnCards = await this.getColumnCards();
      this.renderColumnView(columnCards);
    }

    async getColumnCards() {
      const responseJSON = await fetch("http://localhost:3000/cards");
      const cards = (await responseJSON.json());
      return cards.filter(card => card.columnId == this.id);
    }

    async addCard(event) {
      event.preventDefault();
      const titleInputValue = event.target.querySelector(".title-input").value;
      const descriptionInputValue = event.target.querySelector(".description-input").value;
      await fetch("http://localhost:3000/cards", {
        method: "POST",
        body: JSON.stringify({
          "title": titleInputValue,
          "description": descriptionInputValue,
          "columnId": parseInt(this.id)
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      this.renderAddCardForm();
    }

    async handleDragDrop(event) {
      const [columnId, cardId] = event.dataTransfer.getData("text").split("___");
      const draggedCard = document.querySelector("main-dashboard").shadowRoot.querySelector(`editable-column[id='${columnId}']`).shadowRoot.querySelector(`editable-card[id='${cardId}']`);
      if (draggedCard == null) return;
      await fetch(`http://localhost:3000/cards/${cardId}`, {
        method: "PUT",
        body: JSON.stringify({
          "title": draggedCard.getAttribute("title"),
          "description": draggedCard.getAttribute("description"),
          "columnId": event.target.getAttribute("id")
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const columnCards = await this.getColumnCards();
      this.renderColumnView(columnCards);
    }

    async renderAddCardForm() {
      this.isAddCardFormRendered = !this.isAddCardFormRendered;
      const columnCards = await this.getColumnCards();
      this.renderColumnView(columnCards);
      this.scrollTop = this.scrollHeight;
    }

    renderColumnView(cards) {
      const cardElementsArray =
        cards.map(card => `<editable-card title='${card.title}' id='${card.id}'
              columnId='${card.columnId}' description='${card.description}'> </editable-card>`);
      const addCardButtonText = this.isAddCardFormRendered ? "Cancel Add Card" : "Add Card";
      let templateView = `
        <style>
          h3 {
            margin: 0;
          }
          .cards-list {
            overflow: auto;
            height: 60vh;
          }
          .actions {
            display: flex;
            justify-content: space-between;
          }
          .submit-add-card {
            font-size: 1rem;
            padding: 1rem;
            margin: 1rem;
            border-style: solid;
            border-width: 0.05rem;
          }
          form.submit-add-card > * {
            display: block;
            margin: 0.5rem 0;
          }
          form.submit-add-card > input {
            width: 80%;
          }
        </style>
          <h3>${this.title}</h3>
          <div class="cards-list">
          ${cardElementsArray.join('')}
          </div>
          <br />
          <div class="actions">
            <button type="button" class="add-card">${addCardButtonText}</button>
            <button type="button" class="remove-column">Remove Column</button>
          </div>`;

      if (this.isAddCardFormRendered) {
        this.shadowRoot.innerHTML = templateView +
          `<form class="submit-add-card">
            <h4>Add a new card</h4>
            <label>Title</label>
            <input class="title-input" required type="text" />
            <label>Description</label>
            <input class="description-input" type="text" />
            <button type="submit">Submit</button>
          </form>`;
      } else {
        this.shadowRoot.innerHTML = templateView;
      }
      document.querySelector("main-dashboard").shadowRoot.querySelectorAll('editable-column').forEach(column => {
        column.addEventListener('dragenter', function (event) { event.preventDefault() }, false);
        column.addEventListener('dragover', function (event) { event.preventDefault() }, false);
        column.addEventListener('drop', this.handleDragDrop, false);
      })
      const addCardButton = this.shadowRoot.querySelector('.submit-add-card');
      if (addCardButton != null) {
        addCardButton.addEventListener('submit', this.addCard, false);
      }
      const addCardLink = this.shadowRoot.querySelector('.add-card');
      if (addCardLink != null) {
        addCardLink.addEventListener('click', this.renderAddCardForm, false);
      }
      const removeColumnButton = this.shadowRoot.querySelector('.remove-column');
      if (removeColumnButton != null) {
        removeColumnButton.addEventListener('click', this.removeColumn, false);
      }
    }

    async removeColumn(event) {
      event.preventDefault();
      await fetch(`http://localhost:3000/columns/${this.id}`, {
        method: "DELETE",
      });
      this.remove();
    }
  }

  customElements.define('editable-column', EditableColumn);
}());