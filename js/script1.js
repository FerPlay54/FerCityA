document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('textInput');
  const imageInput = document.getElementById('imageInput');
  const saveButton = document.getElementById('saveButton');
  const deleteButton = document.getElementById('deleteButton');
  const backButton = document.getElementById('backButton');
  const savedItemsContainer = document.getElementById('savedItemsContainer');
  const pageKeyPrefix = window.location.pathname.split('/').pop().split('.')[0];

  loadSavedItems();

  saveButton.addEventListener('click', () => {
      const textValue = textInput.value;
      const file = imageInput.files[0];
      let itemId = Date.now();
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              const imageBase64 = e.target.result;
              saveItem(itemId, textValue, imageBase64);
                createItemElement(itemId, textValue, imageBase64);
          }
          reader.readAsDataURL(file);
      } else {
          saveItem(itemId, textValue, null);
            createItemElement(itemId, textValue, null);
      }
  });

   function saveItem(itemId, text, image) {
       const now = new Date();
      const dateTimeString = now.toLocaleString();
      const data = { text: text, image: image, date: dateTimeString };
      localStorage.setItem(`${pageKeyPrefix}_item_${itemId}`, JSON.stringify(data));
  }
   function loadSavedItems(){
        for(let i=0; i < localStorage.length; i++){
          const key = localStorage.key(i);
          if(key.startsWith(`${pageKeyPrefix}_item_`)){
              const id = key.substring(pageKeyPrefix.length + 6);
               const storedData = localStorage.getItem(key);
              if (storedData) {
                 const data = JSON.parse(storedData);
                   createItemElement(id, data.text, data.image, data.date);
               }
          }
       }
   }
function createItemElement(itemId, text, image, date) {
    const itemElement = document.createElement('div');
    itemElement.classList.add('saved-item');
    itemElement.dataset.itemId = itemId;
     const savedDate = document.createElement('div');
      savedDate.textContent = date;
     savedDate.classList.add('item-date');
     const shortText = document.createElement('span')
   shortText.textContent = text.substring(0, 20) + "...";
    itemElement.appendChild(shortText);
     itemElement.appendChild(savedDate);

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('item-content');
    contentDiv.dataset.itemId = itemId;
     const closeButton = document.createElement('button');
      closeButton.textContent = 'Закрыть';
      closeButton.classList.add('close-button');

    const savedText = document.createElement('pre');
      savedText.textContent = text;


    const savedImage = document.createElement('img');
    savedImage.classList.add('item-image');

    if (image) {
        savedImage.src = image;
    }
    contentDiv.appendChild(closeButton);
    contentDiv.appendChild(savedText);
    if (image)
      contentDiv.appendChild(savedImage);

    itemElement.appendChild(contentDiv);
     savedItemsContainer.appendChild(itemElement);

      closeButton.addEventListener('click', (e) => {
          e.stopPropagation();
          contentDiv.classList.remove('active');
          itemElement.classList.remove('active');
      });
    itemElement.addEventListener('click', (e) => {
        const clickedItemId = e.currentTarget.dataset.itemId;
        const allContents = document.querySelectorAll('.item-content');
        const allItems = document.querySelectorAll('.saved-item');
         allContents.forEach(item => {
               if(item.dataset.itemId == clickedItemId)
                   item.classList.add('active')
               else
                   item.classList.remove('active');
         });
         allItems.forEach(item => {
                if(item.dataset.itemId == clickedItemId)
                     item.classList.add('active');
                 else
                      item.classList.remove('active');
         });
    });
  }


  deleteButton.addEventListener('click', () => {
     const allContents = document.querySelectorAll('.item-content.active');
        const allItems = document.querySelectorAll('.saved-item.active');
       if(allContents.length > 0){
           const itemId = allContents[0].dataset.itemId;
          localStorage.removeItem(`${pageKeyPrefix}_item_${itemId}`);
          allContents.forEach(element => element.remove());
          allItems.forEach(element => element.remove());
      }

  });
  backButton.addEventListener('click', () => {
      window.history.back();
  });
});