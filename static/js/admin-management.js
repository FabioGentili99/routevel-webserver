let active_map = undefined

function initAdminPage(){
    emptyElement('task-list');
    emptyElement('map-list');
    fetchActiveMap();
    fetchTask();
    setMessage("", 'task-update-div');
}

function fetchTask(){
    fetch('/admin/task')
    .then(response => response.json())
    .then(data => {
        console.log("data", data);
        if(data.length == 0){
            setMessage("Nessun task presente", 'task-update-div');
            return
        }
        data.forEach(element => {
            const row = document.createElement('div');
            row.classList.add('row', 'align-items-center', 'rounded', 'border', 'm-2');

            const col = document.createElement('div');
            col.classList.add('col-5', 'pb-2', 'd-flex', 'align-items-center');
            col.textContent = element;
            row.appendChild(col);

            const buttonCol = document.createElement('div');
            buttonCol.classList.add('col-2', 'pb-2', 'd-flex', 'align-items-center', 'justify-content-center'); // Add 'd-flex', 'align-items-center', and 'justify-content-center' classes
            const formGroup = document.createElement('div');
            formGroup.classList.add('form-group');
            buttonCol.appendChild(formGroup);

            const button = document.createElement('button');
            button.classList.add('btn', 'btn-danger', 'btn-sm');
            button.setAttribute('type', 'button');

            const icon = document.createElement('i');
            icon.classList.add('bi', 'bi-trash3-fill');
            button.addEventListener('click', () => {
                deleteTask(element);
            });

            button.appendChild(icon);
            formGroup.appendChild(button);
            row.appendChild(buttonCol);

            button.appendChild(icon);
            formGroup.appendChild(button);
            row.appendChild(buttonCol);

            document.getElementById('task-list').appendChild(row);
        });
    });
}

function deleteTask(task){
    console.log("Deleting task", task)
    fetch('/admin/task/' + task, {
        method: 'DELETE'
    })
    .then(response => {
        console.log("Task deleted");
        console.log(response)
        setMessage("Task " + task + " cancellato correttamente", 'task-update-div');
        emptyElement('task-list');
        fetchTask();
    });
}

function deleteAllTasks(){
    fetch('/admin/task', {
        method: 'DELETE'
    })
    .then(response => {
        console.log("All tasks deleted");
        console.log(response)
        setMessage("Tutti i task sono stati cancellati correttamente", 'task-update-div');
        emptyElement('task-list');
    });
}

function emptyElement(element_id){
    document.getElementById(element_id).innerHTML = '';
}

function setMessage(message, element_id) {
    const updateDiv = document.getElementById(element_id);
    updateDiv.textContent = message;
}

// MAPS
function fetchMaps(){
    fetch('/admin/maps/')
    .then(response => response.json())
    .then(data => {
        console.log("maps", data);
        // Process the data here

        data.forEach(map =>{
            addMapElement(map);
        })
    });
}

function addMapElement(map){
    const formatted_name = map.split('_')[1];
    const col = document.createElement('div');
    col.classList.add('col-3');

    const card = document.createElement('div');
    card.classList.add('card', 'm-2', 'rounded');

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    const cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title');
    cardTitle.textContent = formatted_name.toUpperCase();
    cardBody.appendChild(cardTitle);

    const cardText = document.createElement('p');
    cardText.classList.add('card-text');
    cardText.textContent = "";
    cardBody.appendChild(cardText);

    if(map === active_map){
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-success');
        button.textContent = 'IN USO';
        button.disabled = true; // Add disabled attribute
        cardBody.appendChild(button);
    
        cardBody.appendChild(document.createTextNode(' ')); // Add space between buttons
    
        const iconButton = document.createElement('button');
        iconButton.classList.add('btn', 'btn-success');
        const icon = document.createElement('i');
        icon.classList.add('bi', 'bi-check');
        iconButton.appendChild(icon);
        cardBody.appendChild(iconButton);
        card.classList.add('border', 'border-success', 'border-3');
    }else{
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-primary');
        button.textContent = 'DISPONIBILE';
        button.disabled = true; // Add disabled attribute
        cardBody.appendChild(button);
    
        cardBody.appendChild(document.createTextNode(' ')); // Add space between buttons
    
        const iconButton = document.createElement('button');
        iconButton.classList.add('btn', 'btn-primary');
        const icon = document.createElement('i');
        icon.classList.add('bi', 'bi-cloud-arrow-up-fill');
        iconButton.addEventListener('click', () => {
            switchMap(map);
        });
        iconButton.appendChild(icon);
        cardBody.appendChild(iconButton);
    }
    
    const cardImage = document.createElement('img');
    cardImage.classList.add('card-img-top');
    cardImage.setAttribute('src', 'https://picsum.photos/300/100');
    cardImage.setAttribute('alt', 'Card Image');
    cardImage.style.width = '100%';
    cardImage.style.height = '100%';
    cardImage.style.objectFit = 'cover';
    card.appendChild(cardImage);

    card.appendChild(cardBody);
    col.appendChild(card);

    document.getElementById('map-list').appendChild(col);
}

function switchMap(map){
    console.log("Switching map", map)
    fetch('/admin/switch-map/' + map, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(data => {
        active_map = data.map;
        console.log("Active map", active_map);
        emptyElement('map-list');
        fetchMaps();
    });
}

function fetchActiveMap(){
    fetch('/admin/active-map', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(data => {
        const map = data.split('/').pop();
        console.log("fetch active map", map);
        active_map = map;
        fetchMaps();
    });
}