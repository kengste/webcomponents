(function editableCard() {
  class EditableCard extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: 'open' });
      const editableCardContainer = document.createElement('div');
      editableCardContainer.classList.add('editable-card');

      this.isFormRendered = false;

      this.editCard = this.editCard.bind(this);
      this.removeCard = this.removeCard.bind(this);
      this.renderEditCardForm = this.renderEditCardForm.bind(this);
      this.renderCardView = this.renderCardView.bind(this);
      this.handleInputChange = this.handleInputChange.bind(this);

      shadow.appendChild(editableCardContainer);
    }

    async connectedCallback() {
      this.renderCardView(this.title, this.description);
    }

    async editCard(event) {
      event.preventDefault();
      const titleInputValue = event.target.querySelector(".title-input").value;
      const descriptionInputValue = event.target.querySelector(".description-input").value;
      const responseJSON = await fetch(`http://localhost:3000/cards/${this.id}`, {
        method: "PUT",
        body: JSON.stringify({
          "title": titleInputValue,
          "description": descriptionInputValue,
          "columnId": this.columnId
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const modifiedCard = (await responseJSON.json());
      this.isFormRendered = !this.isFormRendered;
      this.renderCardView(modifiedCard.title, modifiedCard.description);
    }

    async removeCard(event) {
      event.preventDefault();
      await fetch(`http://localhost:3000/cards/${this.id}`, {
        method: "DELETE",
      });
      this.remove();
    }

    renderEditCardForm(event, title, description) {
      event.preventDefault();
      this.isFormRendered = !this.isFormRendered;
      this.renderCardView(title, description);
    }

    renderCardView(title, description) {
      let templateView = `
        <style>
          .text-wrap {
            word-wrap: break-word;
          }
          .actions {
            padding: 1rem 0;
            display: flex;
            justify-content: space-between;
          }
          .editable-card {
            background-color: #fff;
            border: solid;
            cursor: pointer;
            font-size: 0.8rem;
            max-width: 18rem;
            padding: 1rem;
            margin: 1rem;
          }
          .editable-card-form > * {
            display: block;
            margin: 0 0 0.5rem 0;
          }
        </style>`;
      if (this.isFormRendered) {
        this.shadowRoot.querySelector(".editable-card").innerHTML = templateView +
        `<form class="editable-card-form">
          <h4>Modify existing card</h4>
          <label>Title</label>
          <input class="title-input" type="text" required value=${title} />
          <label>Description</label>
          <input class="description-input" type="text" value=${description} />
          <button type="submit">Submit</button>
        </form><div class="actions">
        <button type="button" class="edit-form-link">Cancel Edit Card</button>
        <button type="button" class="remove-card">Remove</button>
        </div>`;
      } else {
        this.shadowRoot.querySelector(".editable-card").innerHTML = templateView +
        `<h3 class="text-wrap">${title}</h3>
        <div class="text-wrap">${description}</div>
        <div class="actions">
        <button type="button" class="edit-form-link">Edit</button>
        <button type="button" class="remove-card">Remove</button>
        </div>`;
        
      }

      // add event listener to render edit card form on click
      const editLink = this.shadowRoot.querySelector('.edit-form-link');
      if (editLink != null) {
        editLink.addEventListener('click', event => this.renderEditCardForm(event, title, description), false);
      }

      // add event listener to remove card on click
      const removeCardButton = this.shadowRoot.querySelector('.remove-card');
      if (removeCardButton != null) {
        removeCardButton.addEventListener('click', this.removeCard, false);
      }

      // add event listener on edit card form submit event
      const editCardButton = this.shadowRoot.querySelector('.editable-card-form');
      if (editCardButton != null) {
        editCardButton.addEventListener('submit', this.editCard, false);
      }

      // add event listener on keyword search
      const searchInput = document.querySelector('.search-for-cards');
      searchInput.addEventListener('input', this.handleInputChange, false);

      // add event listener on drag-and-drop on card
      const card = this.shadowRoot.querySelector(".editable-card");
      this.addDragAction(card);
    }

    handleInputChange(event) {
      this.shadowRoot.querySelector("div").style.display = '';
      if (event.target.value == "") return;
      if (!this.description.toLowerCase().includes(event.target.value.toLowerCase())) {
        this.shadowRoot.querySelector("div").style.display = 'none';
      }
    }

    addDragAction(card) {
      card.setAttribute("draggable", true);
      card.addEventListener('dragstart', function (event) {
        event.dataTransfer.setData("text", event.target.parentNode.host.getAttribute('columnid') + '___' + event.target.parentNode.host.getAttribute('id'));
      }, false);
    }

    get description() {
      return this.getAttribute('description') || '';
    }

  }

  customElements.define('editable-card', EditableCard);
}());